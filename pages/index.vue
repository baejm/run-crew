<template>
    <div class="container">
      <WeatherDisplay />
      <MainHeaderImage />
      <div class="section event-list-wrap">
        <h2>브룩스 이벤트일정</h2>
        <NuxtLink :to="`/event/eventListPage`" class="all-list">전체일정</NuxtLink>
        <EventLists :limit="4" />
        <NuxtLink :to="`/my-applications`" class="my-list">내 신청 목록</NuxtLink>
      </div>
      <!-- <Calendar /> -->
      <!-- <SelectedEvent/> -->
    </div>
  </template>

<script setup>

definePageMeta({
  middleware: 'only-cafe24', 
});


</script>


<style lang="scss" scoped>

</style>