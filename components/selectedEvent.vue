<template>
  <NuxtLink @click.stop class="my_applications" :to="`/my-applications`">나의 신청내역</NuxtLink>
  <div v-if="selectedList && selectedList.length > 0" class="event-list">
    <div
        v-for="select in selectedList"
        :key="select.id"
        class="event-item">
        <div class="event-info">
          <NuxtLink :to="`/event/${select.id}/detail`"
          custom="" v-slot="{ navigate }">
          <div @click="navigate" class="event-details">
              <p>자세히보기</p>
              <p>이벤트: {{ select.title }}</p>
              <p>날짜: {{ $dayjs(select.dates).format('YYYY.MM.DD') }}</p>
              <p>시간: {{ select.startTime }}</p>
              <p>현재 남은 인원: {{ select.remaining}}/{{ select.capacity }} 명</p>
              <p>신청수:{{ select.capacity - select.remaining }}</p>
              <p v-if="!isEventExpired(select) && select.remaining >= 1 " class="recruiting">모집중</p>
              <p v-else class="recruitment-completed">모집완료</p>
            </div>
            <NuxtLink v-if="userStore.isAdmin" @click.stop :to="`/event/${select.id}/applicants`">
              신청자 목록 보기
            </NuxtLink>
          </NuxtLink>
          <!-- 이벤트 날짜가 현재 날짜보다 이전인지 확인 -->
          <div class="event-action">
            <template v-if="isEventExpired(select) || !select.remaining >= 1 ">
              <p class="event-unavailable">신청 가능한 이벤트가 아닙니다.</p>
            </template>
            <template v-else>
              <ApplicationForm :event="select" class="application-form"/>
            </template>
          </div>
        </div>
      </div>
  </div>
  <div v-else class="no_content">
    <p>이벤트를 선택해주세요.</p>
  </div>
</template>

<script setup>
const userStore = useUserStore();
const eventStore = useEventStore();
const { selectedList } = storeToRefs(eventStore);

// 현재 날짜와 시간
const currentDate = new Date();
// const countApplicantCount = ref(0)

// 이벤트가 현재 시간 이전인지 확인하는 computed property
const isEventExpired = (event) => {
  if (event) {
    const eventDateTime = new Date(event.dates); // 선택된 이벤트의 날짜와 시간
    const eventStartTime = event.startTime.split(':'); // 'HH:MM' 형태로 시간 분리

    // 이벤트 날짜에 시간 추가
    eventDateTime.setHours(eventStartTime[0]);
    eventDateTime.setMinutes(eventStartTime[1]);

    return eventDateTime < currentDate; // 이벤트 날짜와 시간이 현재 시간보다 이전인지 확인
  }
  return false; // 이벤트가 없을 경우
};


</script>