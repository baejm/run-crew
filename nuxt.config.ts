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
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      COOLSMS_API_KEY: process.env.COOLSMS_API_KEY,
      COOLSMS_API_SECRET: process.env.COOLSMS_API_SECRET,
      COOLSMS_SENDER_PHONE: process.env.COOLSMS_SENDER_PHONE,
      weatherApiKey: process.env.WEATHER_API_KEY,
      googleApiKey:process.env.FIREBASE_API_KEY,
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
