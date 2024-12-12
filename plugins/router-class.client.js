export default defineNuxtPlugin((nuxtApp) => {
    const router = useRouter();
  
    router.beforeEach((to, from, next) => {
      if (to.path.startsWith('/users')) {
        document.body.classList.add('user-page-active');
      } else {
        document.body.classList.remove('user-page-active');
      }
      next(); // 다음 라우트로 이동
    });
  });
  