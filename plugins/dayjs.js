import dayjs from 'dayjs';

// 필요한 플러그인 import
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

// 플러그인 등록
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

export default defineNuxtPlugin(() => {
  // Nuxt 앱에 dayjs 추가
  return {
    provide: {
      dayjs,
    },
  };
});
