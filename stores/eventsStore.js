import { collection, getDocs,addDoc,query, where,getDoc,doc, updateDoc  } from "firebase/firestore";
export const useEventStore = defineStore('event', () => {
  
  const events = ref([]);
  const selectedList = ref([])
  const { $db } = useNuxtApp(); // Firestore 가져오기

   

  //전체 이벤트 목록가져오기
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection($db, "events"));
  
      events.value = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          class: data.class || '',
          title: data.title || '제목 없음',
        };
      });
      return events.value;

    } catch (error) {
      console.error("이벤트 데이터 가져오기 실패:", error);
      return [];
    }
  };

  // 특정 ID 이벤트 가져오기
  const getEventById = async (id) => {
    // 이벤트 데이터가 비어 있으면 Fetch 호출
     // events 캐싱 확인 후 fetch
     if (!events.value.length) {
      await fetchEvents();
    }
    
    return events.value.find((event) => event.id === id);
  };

  // 새로운 특정 ID 이벤트 가져오기
  const fetchEventById = async (id) => {
    try {
      const eventDoc = await getDoc(doc($db, "events", id));
      if (eventDoc.exists()) {
        const data = eventDoc.data();
        return {
          id: eventDoc.id,
          ...data,
          dates: data.dates, // Firestore에 저장된 날짜 (ISO 형식 문자열)
        };
      } else {
        console.error("이벤트를 찾을 수 없습니다.");
        return null;
      }
    } catch (error) {
      console.error("이벤트 데이터 가져오기 실패:", error);
      return null;
    }
  };
 
  //이벤트 추가
  const addEvent = async (newEvent) => {
    try {
      // 필수 데이터가 없으면 에러 발생
      if (!newEvent.lat || !newEvent.lng) {
        throw new Error("lat 또는 lng 값이 누락되었습니다.");
      }
  
      // 날짜 파싱
      const eventDate = new Date(newEvent.dates);
      if (isNaN(eventDate)) {
        throw new Error("유효하지 않은 날짜 형식입니다.");
      }
  
      // Firestore에 저장할 데이터 객체 생성
      const event = {
        title: newEvent.customData.title || "",
        startTime: newEvent.customData.startTime || "",
        endTime: newEvent.customData.endTime || "",
        place: newEvent.customData.place || "",
        description: newEvent.customData.description || "",
        capacity: newEvent.customData.capacity || 0,
        imageUrl: newEvent.customData.imageUrl || "", 
        class: newEvent.customData.class || "", 
        dates: eventDate.toISOString(), // ISO 형식으로 저장
        lat: newEvent.lat,
        lng: newEvent.lng,
        createdAt: new Date().toISOString(), // 생성 시간 추가
        remaining:newEvent.customData.capacity || 0,
      };
  
      // Firestore에 저장
      const docRef = await addDoc(collection($db, "events"), event);

      // 로컬 이벤트 배열에 추가 (옵션)
      const addedEvent = { id: docRef.id, ...event };
       events.value.push(addedEvent);
      
    // 필요 시 선택된 이벤트 업데이트
    setSelectEvent([addedEvent]);
    
    } catch (error) {
      console.error("addEvent 에러:", error.message);
      throw error; // 상위에서 핸들링 가능하도록 에러 던지기
    }
  };
  
 //선택된 이벤트 내용
  const setSelectEvent = (events) => {
    selectedList.value = events.map((event) => ({
      ...event,
      id: event.id || "없음", // id가 없는 경우 기본값 설정
    }));
  };

   // 특정 이벤트의 신청자 목록 가져오기
const fetchApplicationsForEvent = async (eventId) => {
  try {
    const applicationsQuery = query(collection($db, "event_applications"), where("event_id", "==", eventId));
    const querySnapshot = await getDocs(applicationsQuery);

    const applications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 신청자 수를 반환
    return {
      applicants: applications,
      applicantCount: applications.length,
    };
  } catch (error) {
    console.error("신청자 목록 가져오기 실패:", error);
    return { applicants: [], applicantCount: 0 };
  }
};

  //이벤트 수정
  const updateEvent = async (eventData) => {
    try {
      const eventRef = doc($db, "events", eventData.id);
      await updateDoc(eventRef, {
        title: eventData.title,
        dates: eventData.dates,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        capacity: eventData.capacity,
        description: eventData.description,
        place: eventData.place,
        imageUrl: eventData.imageUrl,
        lat: eventData.lat,
        lng: eventData.lng,
      });
      // 로컬 이벤트 배열 업데이트 (옵션)
      const index = events.value.findIndex(event => event.id === eventData.id);
      if (index !== -1) {
        events.value[index] = eventData; // 업데이트된 정보로 교체
      }
    } catch (error) {
      console.error("이벤트 업데이트 실패:", error);
      throw error;
    }
  };

  //이벤트 세부내역 가져오기
  const fetchEventDetails = async (eventId) => {
    try {
      const eventData = await fetchEventById(eventId);
      const { applicants, applicantCount } = await fetchApplicationsForEvent(eventId);
  
      const eventDetails = {
        ...eventData,
        applicantCount, // 신청자 수 포함
        applicants, // 신청자 목록 포함
        remaining: eventData.remaining, // Firestore의 remaining 값을 사용
      };
  
      return eventDetails;
    } catch (error) {
      console.error("이벤트 세부 정보를 가져오는 데 실패했습니다:", error);
      return null;
    }
  };
  
  
  // remaining 수 업데이트 함수
  const updateRemainingCount = async (eventId, newRemainingCount) => {
    try {
      const eventRef = doc($db, "events", eventId); // 특정 이벤트 문서 참조
      await updateDoc(eventRef, {
        remaining: newRemainingCount, // remaining 필드 업데이트
      });
    } catch (error) {
      console.error("업데이트 실패", error);
    }
  };

  // 특정 이벤트에 대해 이메일 중복 체크
  const isEventAlreadyApplied = async (phone, eventId) => {
    try {
      const applicationsQuery = query(
        collection($db, "event_applications"),
        where("phone", "==", phone), // 전화번호로 검색
        where("event_id", "==", eventId) // 동일한 이벤트 ID로 필터링
      );
      const querySnapshot = await getDocs(applicationsQuery);
      return !querySnapshot.empty; // 동일 이벤트가 있으면 true 반환
    } catch (error) {
      console.error("이벤트 중복 확인 실패:", error);
      return false;
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsSnapshot = await getDocs(collection($db, "event_applications"));
      const rawApplications = applicationsSnapshot.docs.map((doc) => doc.data());
  
      const userMap = new Map();
  
      // 모든 이벤트 데이터를 한 번에 가져오기
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
  
      return Array.from(userMap.values()); // 정리된 신청자 데이터 반환
    } catch (error) {
      console.error("신청 데이터 가져오기 실패:", error);
      return [];
    }
  };

  return { 
    fetchEvents, 
    events, 
    addEvent, 
    setSelectEvent, 
    selectedList,
    getEventById, 
    fetchApplicationsForEvent, 
    fetchEventById,
    updateEvent,
    fetchEventDetails,
    updateRemainingCount,
    isEventAlreadyApplied,
    fetchApplications
    };
});

