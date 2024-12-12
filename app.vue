<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
const config = useRuntimeConfig();
const kakaoApiKey = config.public.KAKAO_API_KEY; // 환경 변수 값 가져오기

useHead({
  script: [
    {
      src: `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${kakaoApiKey}&libraries=services`,
      defer: true,
    },
  ],
});

</script>