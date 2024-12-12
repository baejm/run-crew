<template>
  <client-only>
    <div ref="mapContainer" style="width: 100%; height: 400px;"></div>
  </client-only>
</template>

<script setup>
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue';

const props = defineProps({
  lat: Number,
  lng: Number,
});

const emit = defineEmits(['update:lat', 'update:lng']);

const mapContainer = ref(null);
const kakaoMap = ref(null);
const marker = ref(null);
const config = useRuntimeConfig();
const kakaoApiKey = config.public.KAKAO_API_KEY; // 환경 변수 값 가져오기

const loadKakaoMapAPI = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && !window.kakao) {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&libraries=services&autoload=false`;
      script.onload = () => resolve(window.kakao);
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    } else {
      resolve(window.kakao);
    }
  });
};

onMounted(async () => {
  try {
    const kakao = await loadKakaoMapAPI();
    kakao.maps.load(() => {
      const mapOptions = {
        center: new kakao.maps.LatLng(props.lat, props.lng),
        level: 3,
      };

      kakaoMap.value = new kakao.maps.Map(mapContainer.value, mapOptions);

      marker.value = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(props.lat, props.lng),
        draggable: true,
      });

      marker.value.setMap(kakaoMap.value);

      kakao.maps.event.addListener(marker.value, 'dragend', () => {
        const position = marker.value.getPosition();
        emit('update:lat', position.getLat());
        emit('update:lng', position.getLng());
      });
    });
  } catch (error) {
    console.error('Kakao Maps API 로드 실패', error);
  }
});

// 좌표 변경 시 마커 및 지도 업데이트
watch(
  () => [props.lat, props.lng],
  ([newLat, newLng]) => {
    if (marker.value) {
      const position = new kakao.maps.LatLng(newLat, newLng);
      marker.value.setPosition(position);
      kakaoMap.value.setCenter(position);
    }
  }
);
</script>
