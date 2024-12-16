<template>
  <div class="section event-list-wrap">
    <h2>이달의 러닝 일정</h2>
    <NuxtLink :to="`/my-applications`" class="my-list">내 신청 목록</NuxtLink>
    <button v-if="userStore.isAdmin" @click.stop="gotoInvitation" class="add-event-btn">이벤트 추가</button>
    <ul class="event-list">
      <li v-for="event in upcomingEvents.slice(0, 4)" :key="event.id" class="event-item">
        <!-- <div class="applications">
          <button class="event-apply-btn" @click.stop="openApplicationForm(event)">신청하기</button>
        </div> -->
        <div class="event-details">
          <div class="event-cont">
            <h3 class="event-title">{{ event.title || '제목 없음' }}</h3>
            <p class="event-desc">{{ event.description || '내용 없음' }}</p>
            <NuxtLink :to="`/event/${event.id}/detail`" class="go-applicants"><span class="blind">자세히보기</span>
            </NuxtLink>
            </div>
            <div class="event-date" :class="{ 'past-date': isPastDate(event.dates) }">
              <p class="date-dates">{{ formatEventDate(event.dates) }}</p>
              <p class="date-startTime">{{ event.startTime }}</p>
            </div>
            <div class="event-recruit">
              <button v-if="!isEventExpired(event) && event.remaining >= 1 " class="recruiting" @click.stop="openApplicationForm(event)">신청하기</button>
              <button v-else class="recruiting completed">신청완료</button>
            </div>
          </div>
        <NuxtLink v-if="userStore.isAdmin" @click.stop :to="`/event/${event.id}/applicants`" class="applicanion-list">
          신청자 목록 보기
        </NuxtLink>
      </li>
    </ul>

    <!-- <transition name="slide-up">
      <div 
        v-if="showApplicationForm" 
        class="application-form-overlay" 
        v-touch:swipe.down="closeApplicationForm" 
        >
        <ApplicationForm @close="closeApplicationForm" />
      </div>
    </transition> -->
    <ClientOnly>
        <SwipeModal
        v-model="showApplicationForm"
        swipeToClose
        :closeOnSwipe="true"
        :closeOnClickOutside="true"
        >
        <ApplicationForm @close="closeApplicationForm" />
      </SwipeModal>
    </ClientOnly>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
// import { SwipeModal } from '@takuma-ru/vue-swipe-modal';

const eventStore = useEventStore();
const userStore = useUserStore();
const { selectedList } = storeToRefs(eventStore);
const events = ref([]);
const showApplicationForm = ref(false);

const upcomingEvents = computed(() => {
  return events.value
    .filter(event => !isPastDate(event.dates))
    .sort((a, b) => dayjs(a.dates).isAfter(dayjs(b.dates)) ? 1 : -1);
});

function openApplicationForm(event) {
  showApplicationForm.value = true;
  handleEventClick(event);
  document.body.classList.add("overflow-y");
}

function closeApplicationForm() {
  showApplicationForm.value = false;
}

watch(()=>
  showApplicationForm.value,(newVal) =>{
    if(newVal ==false)
    document.body.classList.remove("overflow-y");
  }
)

function handleEventClick(event) {
  if (!event) return;

  const content = {
    id: event.id || event.key,
    key: event.key,
    dates: event.dates,
    title: event.title || "제목 없음",
    content: event.content || "",
    lat: event.lat || 0,
    lng: event.lng || 0,
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    capacity: event.capacity || 0,
    imageUrl: event.imageUrl || "",
    remaining: event.remaining || 0,
    place:event.place || "",
  };

  eventStore.setSelectEvent([content]);
}

function gotoInvitation() {
  navigateTo('/invitation');
}

function isPastDate(date) {
  return dayjs(date).isBefore(dayjs(), "day");
}

function formatEventDate(date) {
  return dayjs(date).format('MM/DD');
}

const currentDate = new Date();
const isEventExpired = (event) => {
  if (event) {
    const eventDateTime = new Date(event.dates); 
    const eventStartTime = event.startTime.split(':'); 

    // 이벤트 날짜에 시간 추가
    eventDateTime.setHours(eventStartTime[0]);
    eventDateTime.setMinutes(eventStartTime[1]);

    return eventDateTime < currentDate; 
  }
  return false; // 이벤트가 없을 경우
};


onMounted(async () => {
  try {
    const fetchedEvents = await eventStore.fetchEvents();
    events.value = fetchedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
  }
});

watch(
  () => eventStore.events,
  (newEvents) => {
    if (newEvents && newEvents.length > 0) {
      events.value = newEvents;
    }
  },
  { immediate: true }
);
</script>

<style scoped>

/* .slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
} */



</style>
