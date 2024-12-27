<template>
  <div class="section event-list-wrap">
    <button v-if="userStore.isAdmin" @click.stop="gotoInvitation" class="add-event-btn">이벤트 추가</button>
    <h2>전체 일정</h2>
      <EventLists :limit="0" :all="true" />
  </div>
  </template>

<script setup>
const userStore = useUserStore();

  function gotoInvitation() {
    navigateTo('/invitation');
  }
</script>


<style lang="scss" scoped>

</style>