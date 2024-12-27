<template>
    <div class="data-del-btn">
      <p>3개월 이전의 데이터는 삭제됩니다.</p>
      <button v-if="userStore.isAdmin" @click="deleteOldData">데이터 삭제</button>
      <p v-if="deleteMessage">{{ deleteMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { deleteOldEventsAndApplications } from "@/services/firestoreService.js";
  
  definePageMeta({
    middleware: 'auth', 
    });

  const userStore = useUserStore();
  const deleteMessage = ref("");
  
  const deleteOldData = async () => {
    if(!confirm('삭제 하시겠습니까?')) return
    try {
      deleteMessage.value = await deleteOldEventsAndApplications();
    } catch (error) {
      deleteMessage.value = error.message || "데이터 삭제 중 문제가 발생했습니다.";
    }
  };
  </script>
  
  
  <style scoped>
  
  </style>
  