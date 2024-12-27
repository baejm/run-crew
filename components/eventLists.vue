<template>
  <div>
    <div class="eventList-header">
      <select v-if="props.all" v-model="selectedMonth" class="month-filter">
        <option value="">전체 보기</option>
        <option v-for="month in availableMonths" :key="month" :value="month">
          {{ month }}월
        </option>
      </select>
      <NuxtLink v-else :to="`/event/eventListPage`" class="all-list">전체일정</NuxtLink>
    </div>
    <ul class="event-list">
      <li v-for="event in displayedEvents" :key="event.id" class="event-item">
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
              <button v-else class="recruiting completed">신청마감</button>
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

const props = defineProps({
  limit: {
    type: Number,
    default: 1, // 기본값은 4개
  },
  all: {
    type: Boolean,
    default: false, // 기본값은 현재 날짜 이후만 표시
  },
});

const selectedMonth = ref("");
const filteredEvents = ref([]);

const eventStore = useEventStore();
const userStore = useUserStore();
const { selectedList } = storeToRefs(eventStore);
const events = ref([]);
const showApplicationForm = ref(false);

const availableMonths = computed(() => {
  const months = new Set(
    events.value.map((event) => dayjs(event.dates).format("MM"))
  );
  return Array.from(months).sort();
});

const upcomingEvents = computed(() =>
  events.value
    .filter((event) => {
      if (props.all) {
        // all이 true일 때 월 선택 필터 적용
        if (selectedMonth.value !== "") {
          const eventMonth = dayjs(event.dates).format("MM");
          return eventMonth === selectedMonth.value;
        }
        return true; // 전체 보기
      } else {
        // all이 false일 경우 현재 이후 이벤트만 표시
        const eventDateTime = dayjs(`${event.dates} ${event.startTime}`, "YYYY-MM-DD HH:mm");
        return eventDateTime.isAfter(dayjs());
      }
    })
    .sort((a, b) => {
      const dateA = dayjs(`${a.dates} ${a.startTime}`, "YYYY-MM-DD HH:mm");
      const dateB = dayjs(`${b.dates} ${b.startTime}`, "YYYY-MM-DD HH:mm");
      return dateA.isAfter(dateB) ? 1 : -1;
    })
);


function openApplicationForm(event) {
  showApplicationForm.value = true;
  handleEventClick(event);
  document.body.classList.add("overflow-y");
}

function closeApplicationForm() {
  showApplicationForm.value = false;
}

onMounted(async () => {
  try {
    const fetchedEvents = await eventStore.fetchEvents();
    events.value = fetchedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
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

watch(()=>
  showApplicationForm.value,(newVal) =>{
    if(newVal ==false)
    document.body.classList.remove("overflow-y");
  }
)

const displayedEvents = computed(() =>
props.limit > 0 ? upcomingEvents.value.slice(0, props.limit) : upcomingEvents.value
);

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



</script>

<style scoped>


</style>
