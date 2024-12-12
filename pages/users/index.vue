<template>
    <div class="user-page" ref="scrollContainer">
      <h1>신청자 랭킹</h1>
      <div v-if="isLoading && userStore.users.length === 0" class="placeholder">
        <LoadingSpinner />
      </div>
      <div v-else>
        <div class="controls">
          <label for="sort"></label>
          <select id="sort" v-model="sortCriteria">
            <option value="name">이름순</option>
            <option value="eventCount">참여 횟수순</option>
          </select>
        </div>
        <table class="user-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>전화번호</th>
              <th>참여 횟수</th>
              <th>참여 이벤트</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in sortedUsers" :key="user.phone">
              <td>{{ user.name }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ user.eventCount }}</td>
              <td>{{ user.events.join(", ") }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="isLoading" class="loading-more">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useInfiniteScroll } from "@vueuse/core";
  
  const userStore = useUserStore();
  const scrollContainer = ref(null); // 무한스크롤 대상 컨테이너
  const isLoading = ref(false);
  const sortCriteria = ref("name");

// 사용자 데이터를 정렬
const sortedUsers = computed(() => {
  const users = [...userStore.users];
  if (sortCriteria.value === "name") {
    return users.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortCriteria.value === "eventCount") {
    return users.sort((a, b) => b.eventCount - a.eventCount);
  }
  return users;
});

// 데이터 로드 함수
const loadMoreData = async () => {
  if (!userStore.hasMore || isLoading.value) return;

  isLoading.value = true;

  try {
    await userStore.fetchPaginatedApplications();
  } catch (error) {
    console.error("데이터 로드 중 오류:", error);
  } finally {
    isLoading.value = false;
  }
};

// 무한 스크롤 초기화
onMounted(async () => {
  isLoading.value = true;
  await userStore.fetchPaginatedApplications();
  isLoading.value = false;

  useInfiniteScroll(scrollContainer, loadMoreData, {
    distance: 10,
  });
});
</script>
