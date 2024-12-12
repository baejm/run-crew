export default defineNuxtPlugin((nuxtApp) => {
    const userStore = useUserStore();
    userStore.initializeAuth(); // 애플리케이션 초기화 시 인증 상태 확인
  });
  