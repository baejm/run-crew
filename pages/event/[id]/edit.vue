<template>
    <div>
      <h1>이벤트 수정 페이지</h1>
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="title">이벤트 제목</label>
          <input type="text" id="title" v-model="event.title" required />
        </div>
        <div>
          <label for="dates">날짜</label>
          <input type="date" id="dates" v-model="event.dates" required />
        </div>
        <div>
          <label for="startTime">시작 시간</label>
          <input type="time" id="startTime" v-model="event.startTime" required />
        </div>
        <div>
          <label for="endTime">종료 시간</label>
          <input type="time" id="endTime" v-model="event.endTime" required />
        </div>
        <div>
          <label for="capacity">정원</label>
          <input type="number" id="capacity" v-model="event.capacity" required />
        </div>
        <div>
          <label for="description">설명</label>
          <textarea id="description" v-model="event.description" required></textarea>
        </div>
        <div>
          <label for="place">장소</label>
          <input type="text" id="place" v-model="event.place" required />
        </div>
        <div>
          <label for="imageUrl">이미지 URL</label>
          <input type="text" id="imageUrl" v-model="event.imageUrl" />
        </div>
        <button type="submit">수정하기</button>
      </form>
      <p v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  const route = useRoute();
  const eventId = route.params.id;
  const router = useRouter();
  const eventStore = useEventStore();
  const event = ref({});
  const error = ref('');
  
  onMounted(async () => {
    event.value = await eventStore.fetchEventById(eventId);
  });
  
  const handleSubmit = async () => {
    try {
      await eventStore.updateEvent(event.value);
      // 수정 완료 후 이벤트 상세 페이지로 이동
      router.push(`/`);
    } catch (err) {
      error.value = "이벤트 수정 중 오류가 발생했습니다.";
      console.error(err);
    }
  };
  </script>
