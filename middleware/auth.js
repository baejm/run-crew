export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore();
  
    // 관리자가 아닌 경우
    if (!userStore.isAdmin) {
      return navigateTo('/');
    }

  });
  