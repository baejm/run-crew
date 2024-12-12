
<template>
    <div class="weather-container">
      <Swiper
        v-if="weatherSlides.length > 0"
        class="mySwiper"
        :modules="[Autoplay]"
        direction="vertical"
        :loop="true"
        :speed="1000"
        :autoplay="{ delay: 3000, disableOnInteraction: false }"
        :slidesPerView="1"
        :slidesPerGroup="1"
        :key="swiperKey"
      >
        <SwiperSlide v-for="(item, index) in weatherSlides" :key="index">
          <div class="weather-slide">
              <div class="weather-info">
                <img
                  :src="`https://openweathermap.org/img/wn/${item.icon}@2x.png`"
                  :alt="item.description"
                />
                <p class="description">{{ translatedWeather(item.description) }}</p>
              </div>
            <p class="cityName">{{ item.cityName }}</p>
            <p class="temp">{{ item.temp }}°C</p>
          </div>
        </SwiperSlide>
      </Swiper>
  
      <button @click="getCurrentLocationWeather">내 위치 날씨</button>
    </div>
  </template>
  
  <script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";

const weatherSlides = ref([]);
const swiperKey = ref(0);

// 서울 지역 리스트
const seoulAreas = [
  { name: "강남", lat: 37.5172, lon: 127.0473 },
  { name: "종로", lat: 37.5731, lon: 126.9794 },
  { name: "마포", lat: 37.5502, lon: 126.9101 },
  { name: "송파", lat: 37.5145, lon: 127.1052 },
  { name: "영등포", lat: 37.5249, lon: 126.9261 },
];

const weatherDescriptions = {
  "clear sky": "맑음",
  "few clouds": "구름 조금",
  "scattered clouds": "흩어진 구름",
  "broken clouds": "구름 많음",
  "shower rain": "소나기",
  rain: "비",
  thunderstorm: "뇌우",
  snow: "눈",
  mist: "안개",
};

// 날씨 설명 번역
const translatedWeather = (description) =>
  weatherDescriptions[description.toLowerCase()] || description;

// 날씨 데이터 가져오기
const fetchWeather = async (lat, lon, cityName) => {
  const config = useRuntimeConfig();
  const apiKey = config.public.weatherApiKey;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`
    );
    const data = await response.json();
    

    if (response.status !== 200 || !data.main) {
      throw new Error("날씨 데이터를 가져올 수 없습니다.");
    }

    return {
      cityName,
      temp: data.main.temp,
      icon: data.weather[0].icon,
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error("날씨 데이터 오류:", error);
    return null;
  }
};

// 모든 지역 날씨 가져오기
const fetchSeoulAreasWeather = async () => {
  const slides = [];
  for (const area of seoulAreas) {
    const weather = await fetchWeather(area.lat, area.lon, area.name);
    if (weather) slides.push(weather);
  }
  weatherSlides.value = slides;
  swiperKey.value++; // Swiper 재렌더링
};

// 현재 위치 날씨
const getCurrentLocationWeather = async() => {
  if (!navigator.geolocation) {
    alert("현재 브라우저에서 위치 서비스를 사용할 수 없습니다.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const config = useRuntimeConfig();
        const googleApiKey = config.public.googleApiKey;

        // Google Maps Geocoding API 호출
        const geoResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}&language=ko`
        );
        const geoData = await geoResponse.json();

        if (!geoData || geoData.status !== "OK" || !geoData.results.length) {
          throw new Error("도시명 가져오기 실패");
        }

        // 도시명 추출
        const cityName = geoData.results[0].address_components.find((comp) =>
          comp.types.includes("locality")
        )?.long_name || "알 수 없음";

        // 날씨 정보 가져오기
        const currentWeather = await fetchWeather(latitude, longitude, cityName);

        if (currentWeather) {
          // 기존 위치 확인
          const existingIndex = weatherSlides.value.findIndex(
            (slide) => slide.cityName === cityName
          );

          if (existingIndex !== -1) {
            // 이미 있는 경우 기존 데이터 업데이트 및 맨 앞 이동
            weatherSlides.value.splice(existingIndex, 1); 
            console.log("현재 위치 업데이트 완료:", currentWeather);
          }

          // 내 위치 날씨를 맨 앞에 추가
          weatherSlides.value.unshift(currentWeather);
          swiperKey.value++; // Swiper 재렌더링
        }
      } catch (error) {
        console.error("현재 위치 날씨 가져오기 오류:", error);
      }
    },
    (error) => handleGeolocationError(error)
  );
};


// 위치 권한 오류 처리
const handleGeolocationError = (error) => {
  const messages = {
    1: "위치 서비스 권한이 거부되었습니다.",
    2: "현재 위치 정보를 확인할 수 없습니다.",
    3: "위치 확인이 너무 오래 걸립니다. 다시 시도해주세요.",
  };
  alert(messages[error.code] || "알 수 없는 오류가 발생했습니다.");
};

// 초기 로딩
onMounted(async () => {
  await getCurrentLocationWeather(); // 첫 번째에 내 위치
  await fetchSeoulAreasWeather(); // 서울 지역 날씨 가져오기
});
</script>

<style scoped>



</style>
