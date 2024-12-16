<template>
  <!-- <div class="application-form close" @click.stop>
    <button @click="$emit('close')">닫기</button>
  </div> -->
  <!-- 신청 폼 내용 -->
   <div class="applicate_data">
      <p>이벤트: {{title}}</p>
      <p>날짜: {{dayjs(dates).format('YYYY-MM-DD')}}</p>
      <p>시간: {{startTime}}</p>
      <p>장소: {{place}}</p>
   </div>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="email">이메일</label>
      <input type="email" id="email" v-model="email" placeholder="이메일을 입력하세요" required />
    </div>

    <div class="form-group">
      <label for="name">이름</label>
      <input type="text" id="name" v-model="name" placeholder="이름을 입력하세요" required />
    </div>

    <div class="form-group phone">
      <div class="group_item">
        <label for="phone">휴대폰 번호(인증은 테스트후 노출 )</label>
        <input
        type="tel"
        id="phone"
        v-model="phone"
        placeholder="번호 숫자만 입력하세요"
        @input="formatPhoneNumber"
        maxlength="13"
        required
        />
      </div>
      <button type="button" v-if="!isVerified" @click="sendVerificationCode">인증 코드 받기</button>
    </div>

    <!-- ReCAPTCHA 컨테이너 -->
    <div id="recaptcha-container"></div>

    <div v-if="isCodeSent" class="form-group">
      <label for="verificationCode">인증 코드</label>
      <input
        type="text"
        id="verificationCode"
        v-model="verificationCode"
        placeholder="인증 코드를 입력하세요"
        required
      />
      <button type="button" @click="verifyCode">인증 코드 확인</button>
    </div>

    <div class="form-group">
      <label for="group">그룹</label>
      <select id="group" v-model="group" required>
        <option value="" disabled>그룹을 선택하세요</option>
        <option value="05k">05k</option>
        <option value="06k">06k</option>
        <option value="07k">07k</option>
        <option value="08k">08k</option>
      </select>
    </div>

    <div class="form-group checkbox">
      <input type="checkbox" id="remember" v-model="remember" checked />
      <label for="remember">정보 기억하기</label>
    </div>

    <button type="submit" class="submit-btn" :disabled="!isVerified">등록</button> <!-- 유지 -->
  </form>
</template>


<script setup>
import { collection, addDoc,query,where,getDocs  } from "firebase/firestore";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { signInWithCredential,RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from 'firebase/auth';
import { usePhoneVerification } from "@/services/formService";

// 플러그인 활성화
dayjs.extend(isBetween);

// const props = defineProps({
//   id: {
//     // type: Number,
//     required: true,
//   },
// })


const { $db, $auth } = useNuxtApp();
const eventStore = useEventStore();
const { selectedList } = storeToRefs(eventStore);
const router = useRouter();

const email = ref("");
const name = ref("");
const phone = ref("");
const group = ref("");
const remember = ref(true);
const verificationCode = ref("");
const isCodeSent = ref(false);
const isVerified = ref(true); //배포땐 false
const storedCode = ref("");
// const { 
//   phone,
//   name,
//   group,
//   email,
//   remember,
//   isCodeSent,
//   verificationCode,
//   isVerified,
//   initializeRecaptcha, 
//   sendVerificationCodeService,
//   verifyCodeService,
//   handleSubmitService
//  } = usePhoneVerification($auth);



defineEmits(['close']);

const id = ref("");
const dates = ref("");
const title = ref("");
const content = ref("");
const startTime = ref("");
const place = ref("");


onMounted(async() => {

  // 로컬스토리지에서 데이터 복원
  if (localStorage.getItem("runRememberData")) {
    const savedData = JSON.parse(localStorage.getItem("runRememberData"));
    email.value = savedData.email || "";
    name.value = savedData.name || "";
    phone.value = savedData.phone || "";
    group.value = savedData.group || "";
    remember.value = savedData.remember || true;
    isVerified.value= true
  }

  //전화번호 인증 초기화 및 검증
  // initializeRecaptcha()
  });

  watch(
  () => selectedList.value,
  (newValue) => {
    if (newValue.length > 0) {
      const event = newValue[0];
      id.value = event.id;
      dates.value = event.dates;
      title.value = event.title;
      content.value = event.content;
      startTime.value = event.startTime;
      place.value = event.place;
    }
  }
);

// 인증 코드 전송 함수
const sendVerificationCode = async () => {
  if (!phone.value) {
    alert("휴대폰 번호를 입력해주세요.");
    return;
  }

  try {
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    storedCode.value = generatedCode;
    const response = await $fetch("/api/send-sms", {
      method: "POST",
      body: {
        to: phone.value,
        text: `[run-crew] 인증번호: ${generatedCode}`,
      },
    });
    

    if (response.success) {
      isCodeSent.value = true;
      alert("인증 코드가 발송되었습니다!");
    } else {
      console.error("전송 실패:", response.message);
      alert("인증 코드 전송 중 문제가 발생했습니다.");
    }
  } catch (error) {
    console.error("서버 호출 오류:", error);
    alert("서버 오류로 인해 메시지를 전송할 수 없습니다.");
  }
};




// 인증 코드 확인 함수
const verifyCode = async () => {
  // verifyCodeService()
  if (verificationCode.value === storedCode.value) {
    isVerified.value = true;
    alert("인증이 성공적으로 완료되었습니다!");
  } else {
    alert("인증 코드가 일치하지 않습니다. 다시 확인해주세요.");
  }
};


//신청하기 테스트용
const handleSubmit = async () => {
  const storedData = localStorage.getItem("runRememberData");
  const storedPhone = storedData ? JSON.parse(storedData).phone : null;

  // 기존 번호와 현재 입력된 번호 비교
  if (storedPhone && storedPhone !== phone.value) {
    // isVerified.value = false; // 번호가 변경된 경우 인증 상태 초기화
    alert("전화번호가 변경되었습니다. 다시 인증을 진행해주세요.");
    return;
  }

  // if (!isVerified.value) {
  //   alert("휴대폰 번호 인증을 완료해주세요.");
  //   return;
  // }

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
//신청하기 배포용용
// const handleSubmit = async () => {
//   const storedData = localStorage.getItem("runRememberData");
//   const storedPhone = storedData ? JSON.parse(storedData).phone : null;

//   // 기존 번호와 현재 입력된 번호 비교
//   if (storedPhone && storedPhone !== phone.value) {
//     isVerified.value = false; // 번호가 변경된 경우 인증 상태 초기화
//     alert("전화번호가 변경되었습니다. 다시 인증을 진행해주세요.");
//     return;
//   }

//   if (!isVerified.value) {
//     alert("휴대폰 번호 인증을 완료해주세요.");
//     return;
//   }

//   // 선택된 이벤트 확인
//   if (!selectedList.value.length) {
//     alert("선택된 이벤트가 없습니다.");
//     return;
//   }

//   const selectedEvent = selectedList.value[0];

//   try {
//     // 이벤트 중복 확인
//     const alreadyApplied = await eventStore.isEventAlreadyApplied(phone.value, selectedEvent.id);
//     if (alreadyApplied) {
//       alert("이미 신청하셨습니다.");
//       return;
//     }

//     // 30일 이내 다른 이벤트 확인
//     const eventConflict = await checkEventConflict(phone.value, selectedEvent.dates);
//     if (eventConflict) {
//       alert("30일 이내의 다른 이벤트가 이미 신청되어 있습니다.");
//       return;
//     }

//     // Firestore에 데이터 저장
//     const applicationData = {
//       event_id: selectedEvent.id,
//       email: email.value,
//       name: name.value,
//       phone: phone.value, // 현재 입력된 번호 사용
//       group_name: group.value,
//       createdAt: new Date().toISOString(),
//     };
//     await addDoc(collection($db, "event_applications"), applicationData);

//     // 모집 인원 감소
//     await eventStore.updateRemainingCount(selectedEvent.id, selectedEvent.remaining - 1);

//     alert("신청이 성공적으로 완료되었습니다!");

//     // 로컬스토리지 업데이트
//     if (remember.value) {
//       localStorage.setItem("runRememberData", JSON.stringify(applicationData));
//     } else {
//       localStorage.removeItem("runRememberData");
//     }

//     // 폼 초기화
//     email.value = "";
//     name.value = "";
//     phone.value = "";
//     group.value = "";
//     remember.value = false;
//     router.go(0); // 페이지 새로고침
//   } catch (error) {
//     console.error("신청 중 문제가 발생했습니다:", error);
//     alert("신청 중 문제가 발생했습니다. 다시 시도해주세요.");
//   }
// };

// 30일 이내 겹치는 이벤트 확인 함수
const checkEventConflict = async (phone, selectedEventDate) => {
  const oneMonthBefore = dayjs(selectedEventDate).subtract(1, "day");
  const oneMonthAfter = dayjs(selectedEventDate).add(1, "day");

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

        const eventDate = dayjs(eventDetails.dates); // Firestore 날짜 변환
        return eventDate.isBetween(oneMonthBefore, oneMonthAfter, "day", "[]");
      })
    );

    // 30일 이내 충돌하는 이벤트가 있으면 true 반환
    return conflictingEvent.some((conflict) => conflict);
  } catch (error) {
    console.error("이벤트 충돌 확인 실패:", error);
    return false;
  }
};




// 입력값 포맷팅 함수
const formatPhoneNumber = (event) => {
  let value = event.target.value.replace(/[^0-9]/g, ''); // 숫자 이외의 문자 제거

  if (value.length > 3 && value.length <= 7) {
    value = `${value.slice(0, 3)}-${value.slice(3)}`; // 010-XXXX
  } else if (value.length > 7) {
    value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`; // 010-XXXX-XXXX
  }

  phone.value = value; // 포맷팅된 값 설정
};

</script>
