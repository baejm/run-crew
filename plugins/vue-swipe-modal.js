import { SwipeModal } from '@takuma-ru/vue-swipe-modal';

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.component('SwipeModal', SwipeModal);
  }
});