export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore();
  
    // 관리자가 아닌 경우
    if (!userStore.isAdmin) {
      // 메인 페이지로 리다이렉트
      return navigateTo('/');
    }

  });
  