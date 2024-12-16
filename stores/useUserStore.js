import { getDoc, doc, getDocs,collection,query, orderBy, startAfter, limit } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword ,signOut ,onAuthStateChanged} from "firebase/auth";


export const useUserStore = defineStore('user', () => {
  const { $db, $auth } = useNuxtApp(); // $db와 $auth 가져오기
  const isAdmin = ref(false);
  const user = ref(null);
  const auth = getAuth();
  const users = ref([]); 
  //어드민유저 찾기
  const fetchUserInfo = async (userId) => {
    try {
        const userDoc = await getDoc(doc($db, "users", userId));
        
        if (userDoc.exists()) { //해당 문서가 Firestore에 존재하는지 여부를 확인
            return { id: userId, ...userDoc.data() }; //문서 데이터를 객체 형태로 반환.
        } else {
            console.error("No such user!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
  };

    //로그인하기
  const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth,email, password); // auth는 $auth로 변경
      const userId = userCredential.user.uid; // 로그인한 사용자의 ID
      const userData = await fetchUserInfo(userId); // Firestore에서 사용자 정보 가져오기
  
      if (userData) {
        setUser({ // 수정: userStore.setUser가 아닌 현재 함수에서 직접 호출
          uid: userId,
          isAdmin: userData.isAdmin || false, // isAdmin 여부 설정
        });
        return userData; // 로그인 성공 시 사용자 정보 반환
      }
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      clearUser(); // 로그아웃 후 상태 초기화
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const setUser = (userData) => {
    user.value = userData;
    isAdmin.value = userData.isAdmin; 
  };

  const clearUser = () => {
    user.value = null;
    isAdmin.value = false;
  };

  const initializeAuth = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userId = firebaseUser.uid;
        const userData = await fetchUserInfo(userId);
        if (userData) {
          setUser({
            uid: userId,
            isAdmin: userData.isAdmin || false,
          });
        }
      } else {
        clearUser();
      }
    });
  };

  //전체 신청자들 목록가져오기 한번에 불러오기
  const fetchApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(collection($db, "event_applications"));
      const rawApplications = applicationsSnapshot.docs.map((doc) => doc.data());

      const userMap = new Map();

      // 이벤트 정보를 가져오기
      const eventsSnapshot = await getDocs(collection($db, "events"));
      const eventsMap = new Map(
        eventsSnapshot.docs.map((doc) => [doc.id, doc.data().title])
      );

      rawApplications.forEach((application) => {
        const { phone, name, event_id } = application;

        if (!userMap.has(phone)) {
          userMap.set(phone, {
            phone,
            name,
            eventCount: 0,
            events: [],
          });
        }

        const userData = userMap.get(phone);
        userData.eventCount += 1;
        userData.events.push(eventsMap.get(event_id) || "알 수 없음");
      });

      users.value = Array.from(userMap.values()); // 사용자 데이터를 `users`에 저장
    } catch (error) {
      console.error("신청 데이터 가져오기 실패:", error);
    }
  };


  const lastVisible = ref(null); // 마지막으로 가져온 문서
  const usersPerPage = 10; // 페이지당 사용자 수
  const hasMore = ref(true); // 데이터가 더 있는지 여부

   //전체 신청자들 목록가져오기 10개씩 무한스크롤
  const fetchPaginatedApplications = async () => {
    try {
      if (!hasMore.value) return; // 데이터가 더 이상 없으면 종료
  
      const queryBase = collection($db, "event_applications");
      let querySnapshot;
  
      if (lastVisible.value) {
        console.log("기존 문서 이후 데이터 로드 중...");
        const queryNext = query(queryBase, orderBy("name"), startAfter(lastVisible.value), limit(usersPerPage));
        querySnapshot = await getDocs(queryNext);
      } else {
        console.log("첫 번째 페이지 데이터 로드 중...");
        const queryFirst = query(queryBase, orderBy("name"), limit(usersPerPage));
        querySnapshot = await getDocs(queryFirst);
      }
  
      console.log("Firestore에서 가져온 문서 수:", querySnapshot.docs.length);
  
      if (querySnapshot.docs.length === 0) {
        console.log("더 이상 데이터가 없습니다.");
        hasMore.value = false; // 더 이상 가져올 데이터가 없음을 표시
        return;
      }
  
      // 이벤트 데이터 로드
      const eventsSnapshot = await getDocs(collection($db, "events"));
      const eventsMap = new Map(eventsSnapshot.docs.map((doc) => [doc.id, doc.data().title]));
  
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const { phone, name, event_id } = data;
  
        const existingUser = users.value.find((user) => user.phone === phone);
        if (existingUser) {
          existingUser.eventCount += 1;
          existingUser.events.push(eventsMap.get(event_id) || "알 수 없음");
        } else {
          users.value.push({
            phone,
            name,
            eventCount: 1,
            events: [eventsMap.get(event_id) || "알 수 없음"],
          });
        }
      });
  
      lastVisible.value = querySnapshot.docs[querySnapshot.docs.length - 1]; // 마지막 문서 업데이트
    } catch (error) {
      console.error("신청자 데이터 가져오기 실패:", error);
      hasMore.value = false; // 에러 발생 시에도 더 이상 로드하지 않도록 설정
    }
  };
  

  return { isAdmin, user,users,hasMore, loginUser,logoutUser, initializeAuth, fetchApplications ,fetchPaginatedApplications};
});