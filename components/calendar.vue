<template>
  <div class="section calendar_wrap">
    <h2>이달의 러닝 일정</h2>
    <p>러닝 일정을 확인하시고 신청해주세요.</p>
    <button v-if="userStore.isAdmin" @click="gotoInvitation" class="add-event-btn">이벤트 추가</button>
    <v-calendar
      ref="calendarRef"
      class="custom-calendar"
      :masks="masks"
      :attributes="attributes"
      :disable-page-swipe=false
      is-expanded
      hide-empty-weeks="true"
      show-today
      mode="single" 
      :initial-page="initialPage"
    >
      <template v-slot:day-content="{ day, attributes }">
        <div
          class="days-content" 
          :class="{ 'past-date': isPastDate(day.date) }"
          ref="dayRefs"
          @click="handleDayClick"
          >
          <!-- 날짜 표시 -->
          <span class="day-label">{{ day.day }}</span>
          <!-- 이벤트가 있을 경우 날짜 아래에 표시 -->
          <div class="event_wrap" >
            <p
              v-for="attr in attributes"
              :key="attr.key"
              :class="attr.class || ''"
              class="event-item"
              tabindex="0"
              @click="handleEventClick(attr)"
            >
            {{ attr.title || 'No title' }}
            </p>
          </div>
        </div>
      </template>
    </v-calendar>
    
  </div>
</template>

<script setup>
import dayjs from 'dayjs';

const eventStore = useEventStore();
const userStore = useUserStore();
const { selectedList } = storeToRefs(eventStore);
const dayRefs = ref([]); 
const currentPage = ref(dayjs().format('YYYY-MM-DD'))
const calendarRef = ref(null);
const initialPage = ref({
  month: dayjs().month() + 1,
  year: dayjs().year(),
});
const masks = {
  weekdays: 'WWW',
};

// 이벤트 날짜와 제목을 정의
const attributes = ref([]);

// 클릭된 날짜의 이벤트를 선택하는 함수
function handleEventClick(attr) {
  if (!attr) return; // 클릭된 이벤트가 없으면 종료

  const content = {
    id: attr.id || attr.key,
    key: attr.key,
    dates: attr.dates,
    title: attr.title || "제목 없음",
    content: attr.content || "",
    lat: attr.lat || 0,
    lng: attr.lng || 0,
    startTime: attr.startTime || "",
    endTime: attr.endTime || "",
    capacity: attr.capacity || 0,
    imageUrl: attr.imageUrl || "",
    remaining: attr.remaining || 0,
  };

  // 클릭된 이벤트를 store에 설정
  eventStore.setSelectEvent([content]);
}


// 임시로 이벤트를 추가하는 함수
function gotoInvitation() {
  navigateTo('/invitation')
}

// 이전 날짜인지 확인하는 함수
function isPastDate(date) {
  return dayjs(date).isBefore(dayjs(), "day");
}

// 이벤트 데이터를 날짜별로 그룹화
const groupEventsByDate = (events) => {
  // return events.reduce((acc, event) => {
  //   const eventDate = dayjs(event.dates).format('YYYY-MM-DD')
  //   if (!acc[eventDate]) acc[eventDate] = [];

  //   // event 객체에 title 필드를 추가 (없다면 description을 title로 사용)
  //   const eventData = { 
  //     ...event,
  //     title: event.title || event.description || 'No title', // title이 없다면 description을 사용
  //     id: event.id,  
  //   };

  //   acc[eventDate].push(eventData); // 날짜별로 그룹화된 이벤트 배열에 추가

  //   return acc;
  // }, {});

  const groupedEvents = {};
  events.forEach((event) => {
    const eventDate = dayjs(event.dates).format('YYYY-MM-DD');
    
    // groupedEvents[eventDate] = groupedEvents[eventDate] || [];// 첫 번째 실행: 키가 없으므로 초기화로 []
    (groupedEvents[eventDate] ??= []).push({
      ...event,
      title: event.title || event.description || 'No title',
    });
  });
  
  return groupedEvents;
};


// 캘린더 속성을 업데이트하는 함수
const updateCalendarAttributes = (events) => {
  const groupedEvents = groupEventsByDate(events);// 이벤트 있는 날들
  attributes.value = [];
  attributes.value = Object.values(groupedEvents).flat(); //하나씩 넣기

  // Object.keys(groupedEvents).forEach((date) => {
  //   groupedEvents[date].forEach((event) => {
  //     attributes.value.push(event);
  //   });
  // });
};


// 상위 days-content 클릭 이벤트 처리
function handleDayClick(event) {
  const clickedDay = event.currentTarget;
  const hasEventItem = clickedDay.querySelector(".event-item");
  if (hasEventItem) {
    return; 
  }
  selectedList.value = ""; // 선택 초기화
}


onMounted(async () => {
  try {
    currentPage.value = dayjs().format("YYYY-MM-DD"); // 현재 날짜로 설정

     // 이벤트 데이터 가져오기
     const fetchedEvents = await eventStore.fetchEvents();
     
     updateCalendarAttributes(fetchedEvents)
     
     // 이벤트를 날짜별로 그룹화
     // const groupedEvents = groupEventsByDate(fetchedEvents);
     
    // attributes에 이벤트 추가
    // attributes.value = [];  // 기존 배열을 초기화
    // Object.keys(groupedEvents).forEach(date => {
    //   groupedEvents[date].forEach(event => {
    //     attributes.value.push(event);  // 평평한 배열로 추가
    //   });
    // });
  } catch (error) {
    console.error('Error fetching events:', error);
  }
});

// 이벤트 변경 감지
watch(
  () => eventStore.events,
  (newEvents) => {
    if (newEvents && newEvents.length > 0) {
      updateCalendarAttributes(newEvents);
    }
  },
  { immediate: true }
);

</script>

<style scoped>
</style>
