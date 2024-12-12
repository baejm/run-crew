import { collection, addDoc,query,where,getDocs  } from "firebase/firestore";
import { signInWithCredential,RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from 'firebase/auth';
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

export const usePhoneVerification = ($auth) => {
  const router = useRouter()
  const eventStore = useEventStore();
  const { $db } = useNuxtApp();
  const { selectedList } = storeToRefs(eventStore);
  const email = ref("");
  const name = ref("");
  const group = ref("");
  const phone = ref("");
  const remember = ref("");
  const isCodeSent = ref(false);
  const verificationId = ref("");
  const verificationCode = ref(""); 
  const isVerified = ref(false); // 인증 여부 상태 추가

  const initializeRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        $auth, 
        "recaptcha-container", {
        size: "invisible",
        callback: () => console.log("ReCAPTCHA 인증 성공!"),
        "expired-callback": () => console.error("reCAPTCHA 인증 만료"),
      });
    }
    $auth.languageCode = "ko";	
  };

  const sendVerificationCodeService = async () => {
    if (!phone.value) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = `+82${phone.value.slice(1)}`;
      const confirmationResult = await signInWithPhoneNumber($auth, formattedPhone, appVerifier);
      verificationId.value = confirmationResult.verificationId;
      isCodeSent.value = true;
      alert("인증 코드가 발송되었습니다!");
    } catch (error) {
      console.error("인증 코드 전송 실패:", error);
      console.error("Firebase Error:", error.code, error.message, error);
      alert("인증 코드 전송 중 문제가 발생했습니다.");
    }
  };

  const verifyCodeService = async () => {
    // 인증 코드 확인 함수
    if (!verificationCode.value || !verificationId.value) {
      alert("인증 코드를 입력해주세요.");
      return;
    }
  
    try {
      // PhoneAuthProvider를 사용하여 credential 생성
      const credential = PhoneAuthProvider.credential(
        verificationId.value,
        verificationCode.value
      );
  
      // Firebase Auth 사용자 인증
      await signInWithCredential($auth, credential);
  
      isVerified.value = true; // 인증 성공 시 상태 업데이트
      isCodeSent.value = false; // 인증 완료 후 버튼 숨기기
      alert("휴대폰 번호 인증이 성공적으로 완료되었습니다!");
  
      // 로컬스토리지 업데이트
      const updatedData = {
        email: email.value,
        name: name.value,
        phone: phone.value, // 현재 인증된 번호 저장
        group: group.value,
        remember: remember.value,
      };
      localStorage.setItem("runRememberData", JSON.stringify(updatedData));
    } catch (error) {
      console.error("인증 코드 확인 실패:", error);
      alert("인증 코드 확인에 실패했습니다.");
      isVerified.value = false; // 인증 실패 시 상태 초기화
    }
  };

  // 30일 이내 겹치는 이벤트 확인 함수
const checkEventConflict = async (phone, selectedEventDate) => {
    const oneWeekBefore = dayjs(selectedEventDate).subtract(7, "day");
    const oneWeekAfter = dayjs(selectedEventDate).add(7, "day");
  
    try {
      const applicationsQuery = query(
        collection($db, "event_applications"),
        where("phone", "==", phone)
      );
      const querySnapshot = await getDocs(applicationsQuery);
  
      const conflictingEvent = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const eventId = doc.data().event_id;
          const eventDetails = await eventStore.fetchEventById(eventId);
  
          if (!eventDetails || !eventDetails.dates) return false;
  
          const eventDate = dayjs(eventDetails.dates); // Firestore 날짜를 dayjs 객체로 변환
          return eventDate.isBetween(oneWeekBefore, oneWeekAfter, "day", "[]");
        })
      );
  
      // 30일 이내 겹치는 이벤트가 하나라도 있으면 true 반환
      return conflictingEvent.some((conflict) => conflict);
    } catch (error) {
      console.error("30일 이내 겹치는 이벤트 확인 실패:", error);
      return false;
    }
  };
  
  //신청하기
const handleSubmitService = async () => {
    const storedData = localStorage.getItem("runRememberData");
    const storedPhone = storedData ? JSON.parse(storedData).phone : null;
  
    // 로컬스토리지에 저장된 번호와 현재 입력된 번호가 다른 경우 인증 필요
    if (storedPhone !== phone.value) {
      isVerified.value = false; // 번호가 변경된 경우 인증 상태 초기화
    }
  
    if (!isVerified.value) {
      alert("휴대폰 인증을 완료해주세요.");
      return;
    }
  
    // 선택된 이벤트 확인
    if (!selectedList.value.length) {
      alert("선택된 이벤트가 없습니다.");
      return;
    }
  
    const selectedEvent = selectedList.value[0];
  
    try {
      // 이벤트 중복 확인
      const alreadyApplied = await eventStore.isEventAlreadyApplied(phone.value, selectedEvent.id);
      if (alreadyApplied) {
        alert("이미 신청하셨습니다.");
        return;
      }
  
      // 30일 이내 다른 이벤트 확인
      const eventConflict = await checkEventConflict(phone.value, selectedEvent.dates);
      if (eventConflict) {
        alert("30일 이내의 다른 이벤트가 이미 신청되어 있습니다.");
        return;
      }
  
      // Firestore에 데이터 저장
      const applicationData = {
        event_id: selectedEvent.id,
        email: email.value,
        name: name.value,
        phone: phone.value, // 현재 입력된 번호 사용
        group_name: group.value,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection($db, "event_applications"), applicationData);
  
      // 모집 인원 감소
      await eventStore.updateRemainingCount(selectedEvent.id, selectedEvent.remaining - 1);
  
      alert("신청이 성공적으로 완료되었습니다!");
  
      // 로컬스토리지 업데이트
      if (remember.value) {
        localStorage.setItem("runRememberData", JSON.stringify(applicationData));
      } else {
        localStorage.removeItem("runRememberData");
      }
  
      // 폼 초기화
      email.value = "";
      name.value = "";
      phone.value = "";
      group.value = "";
      remember.value = false;
      router.go(0); // 페이지 새로고침
    } catch (error) {
      console.error("신청 중 문제가 발생했습니다:", error);
      alert("신청 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return {
    phone,
    name,
    group,
    email,
    remember,
    isCodeSent,
    verificationCode,
    isVerified,
    initializeRecaptcha,
    sendVerificationCodeService,
    verifyCodeService,
    handleSubmitService
  };
};
