<template>
    <div>
      <h1>이벤트 상세 페이지</h1>
      <div v-if="event">
        <div v-if="userStore.isAdmin" class="detail_btn">
          <NuxtLink :to="`/event/${event.id}/edit`" class="edit-button">수정하기</NuxtLink>
          <button @click="deleteEvent" class="delete-button">삭제하기</button>
        </div>
        <p>이벤트: {{ event.title }}</p>
        <p>날짜: {{ formatDate(event.dates) }}</p>
        <p>시간: {{ event.startTime }} ~ {{ event.endTime }}</p>
        <p>현재 남은 인원: {{ event.remaining }} /{{ event.capacity }}</p>
        <p>설명: {{ event.description }}</p>
        <p>장소: {{ event.place }}</p>
        <div v-if="event.imageUrl">
          <img :src="event.imageUrl" alt="Event Image" class="event-image" />
        </div>
        <KakaoMap :lat="event.lat" :lng="event.lng" :markerDreg="false" />
      </div>
      <p v-else>이벤트 정보를 불러오는 중입니다...</p>

    </div>
  </template>
  
  <script setup>
import dayjs from 'dayjs';
import { doc, deleteDoc } from "firebase/firestore";
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const eventId = route.params.id;

const eventStore = useEventStore();
const event = ref(null)  // ref로 초기화

// Firestore DB 참조
const { $db } = useNuxtApp();

const eventDetail = () => {
  return eventStore.events.find((item) => item.id===eventId)
}
event.value=eventDetail()



// 이벤트 데이터 가져오기
onMounted(async () => {
  // event.value = await eventStore.getEventById(eventId);
});

// 삭제 함수
const deleteEvent = async () => {
  if (!confirm("정말로 이 이벤트를 삭제하시겠습니까?")) return;

  try {
    // Firestore에서 이벤트 삭제
    await deleteDoc(doc($db, "events", eventId));

    // 로컬스토어에서 이벤트 제거
    await eventStore.fetchEvents(); // 이벤트 목록 갱신
    alert("이벤트가 성공적으로 삭제되었습니다.");

    // 삭제 후 메인 페이지로 이동
    router.push("/");
  } catch (error) {
    console.error("이벤트 삭제 중 오류 발생:", error);
    alert("이벤트 삭제에 실패했습니다. 다시 시도해주세요.");
  }
};

// 날짜 포맷 함수
function formatDate(date) {
  return dayjs(date).format('YYYY.MM.DD');
}
  </script>
 <style scoped>
</style> 