export default defineNuxtRouteMiddleware((to, from) => {

    //방법.1
    // 쿠키가 없으면 접속 차단
    // const userCookie = useCookie('authorized') || { value: 'false' };
    //   if (!userCookie.value || userCookie.value !== 'true') {
        
    //         if (process.client) {
    //         alert('쿠키없어요?');
    //         }
    //         return navigateTo('https://naver.com',{ external: true });
    //     }

    //2
    //   const source = to.query.source;
    // if (source === 'naver') {
    //     console.log('네이버에서 접근한 사용자입니다.');
    // } else {
    //     console.log('허용되지 않은 접근입니다.');
    // }


    //3
    // const referer = useRequestHeaders()['referer']; 
    // const allowedDomain = 'https://naver.com';

    // if (!referer || !referer.startsWith(allowedDomain)) {
    //   // 접근 차단 및 리다이렉트
    //   return navigateTo('/error'); // 에러 페이지로 리다이렉트
    // }


  });
  