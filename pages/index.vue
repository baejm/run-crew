<template>
    <div class="container">
      <WeatherDisplay />
      <MainHeaderImage />
      <div class="section event-list-wrap">
      <button v-if="userStore.isAdmin" @click.stop="gotoInvitation" class="add-event-btn">이벤트 추가</button>
        <h2>브룩스 이벤트일정</h2>
        <EventLists :limit="4" />
        <NuxtLink :to="`/my-applications`" class="my-list">내 신청 목록</NuxtLink>
      </div>
      <!-- <Calendar /> -->
      <!-- <SelectedEvent/> -->
    </div>
  </template>

<script setup>
const userStore = useUserStore();

definePageMeta({
  middleware: 'only-cafe24', 
});

function gotoInvitation() {
  navigateTo('/invitation');
}

</script>


<style lang="scss" scoped>

</style>