<template>
    <div>
      <div v-if="selectedList && selectedList.length > 0">
        <NuxtLink v-for="select in selectedList" :key="select.title" :to="`/event/${select.id}/detail`" custom="" v-slot="{ navigate }">
          <div class="mt-6" @click="navigate">
            <p><strong>선택된 이벤트:</strong></p>
            <p>이벤트: {{ select.title }}</p>
            <p>날짜: {{ select.dates }}</p>
            <p>시간: {{ select.startTime }}</p>
            <p>현재 남은 인원: {{5}}/{{ select.capacity }}</p>
            <p>모집중</p>
            <NuxtLink @click.stop :to="`/event/${select.id}/applicants`">신청자 목록 보기</NuxtLink>
          </div>
       </NuxtLink>
    </div>
    <p v-else>선택된 이벤트가 없습니다.</p>
  </div>
  <ApplicationForm />
  </template>
  
  <script setup>

  const useEventStored = useEventStore()
  const { selectedList } = storeToRefs(useEventStored);

  </script>
  