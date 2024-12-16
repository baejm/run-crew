// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  devServer: { //내위치는 https 환경작동을 위한
    https: false, 
    host: 'localhost',
    port: 3000,
  },
  ssr: true, // SSR 비활성화
  nitro: {
    preset: 'static' // 정적 사이트 빌드
  },
  plugins: [
    '~/plugins/firebase.js', // Firebase 초기화 플러그인 추가
    "~/plugins/events-touch.js",
    "~/plugins/vue-swipe-modal.js",
  ],
  runtimeConfig: {
    public: {
      KAKAO_API_KEY: process.env.KAKAO_API_KEY, 
      KAKAO_REST_KEY: process.env.KAKAO_REST_KEY, 
      firebaseApiKey: "AIzaSyDvVM-mwJr_oc0NkLudgFFN04NB9p73Yvw",
      firebaseAuthDomain: "runcrew-6a407.firebaseapp.com",
      firebaseProjectId: "runcrew-6a407",
      firebaseStorageBucket: "runcrew-6a407.firebasestorage.app",
      firebaseMessagingSenderId: "775580694548",
      firebaseAppId: "1:775580694548:web:20f78ee641af7dc9204f01",
      firebaseMeasurementId: "G-2E9BFM0XTQ",
      COOLSMS_API_KEY: process.env.COOLSMS_API_KEY,
      COOLSMS_API_SECRET: process.env.COOLSMS_API_SECRET,
      COOLSMS_SENDER_PHONE: process.env.COOLSMS_SENDER_PHONE,
      weatherApiKey: process.env.WEATHER_API_KEY,
      googleApiKey:"AIzaSyA2s2upTZlkeY_WMwzbgWOfc-85Evj97Fo",
      // googleApiKey:"AIzaSyCvOSDsnvlRfqHgAJIEUefsDixCP61Ggc0",
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
  },
  css: [
    "@/assets/styles/main.scss",
    "swiper/swiper-bundle.css",
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        }
      },
    },
  },
  modules: ['@samk-dev/nuxt-vcalendar','@pinia/nuxt'],
})
