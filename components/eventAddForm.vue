<template>
  <div class="register_form">
    <h1>이벤트 추가</h1>
    <form @submit.prevent="handleSubmit">
      <label for="title">이벤트명:</label>
      <input v-model="newEvent.title" id="title" type="text" required />
      
      <label for="place">장소:</label>
      <input v-model="newEvent.place" id="place" type="text" required />

      <label for="date">이벤트 날짜:</label>
      <input v-model="newEvent.dates" id="date" type="date" required />

      <label for="timeRange">이벤트 시간:</label>
      <div class="time-input-group">
        <input v-model="newEvent.startTime" type="time" required />
        <span>~</span>
        <input v-model="newEvent.endTime" type="time" required />
      </div>

      <label for="capacity">등록 가능 인원:</label>
      <select v-model.number="newEvent.capacity" id="capacity" class="custom-select" required>
        <option disabled value="">인원을 선택하세요</option>
        <option value=3>3명</option>
        <option value=10>10명</option>
        <option value=20>20명</option>
        <option value=30>30명</option>
        <option value=50>50명</option>
        <option value=100>100명</option>
      </select>

      <label for="description">설명:</label>

      <textarea v-model="newEvent.description" id="description" rows="1"></textarea>
      <label for="placeQuery">지도주소:</label>
      <div class="place_search">
        <input v-model="placeQuery" id="placeQuery" type="text" placeholder="예) 강남역" />
        <button type="button" @click="searchPlace">검색하기</button>
      </div>

      <!-- 검색 결과 리스트 -->
       <div v-if="searchResults.length" class="search-results">
         <ul>
           <li
           v-for="(result, index) in searchResults"
           :key="index"
           @click="selectPlace(result)"
           >
           {{ result.place_name }}
          </li>
        </ul>
      </div>
      <!-- KakaoMap 컴포넌트 -->
      <KakaoMap
      v-if="isMapVisible"
      :lat="newEvent.lat"
      :lng="newEvent.lng"
      @update:lat="updateLat"
      @update:lng="updateLng"
      />

      <label for="imageUpload">이벤트 이미지:</label>
      <input type="file" id="imageUpload" @change="handleImageUpload" accept="image/*" />
      
      <!-- 선택한 이미지 미리보기 -->
      <div v-if="newEvent.imageUrl">
        <img :src="newEvent.imageUrl" alt="Selected Image" class="image-preview" />
      </div>


      <button type="submit">이벤트 추가</button>
      <button type="button" @click="cancel">취소</button>
    </form>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';

const newEvent = ref({
  title: '',
  dates: '',
  startTime: '',
  endTime: '',
  capacity: 0,
  place: '',
  lat: 37.5665, // 초기값: 서울
  lng: 126.9780, // 초기값: 서울
  description: '',
  imageUrl: '', // 이미지를 저장할 필드 추가
  remaining:0//남은인원
});
const eventStore = useEventStore(); 
const placeQuery = ref(''); // 검색어 상태
const searchResults = ref([]); // 검색 결과 리스트
const config = useRuntimeConfig();
const kakaoRestKey = config.public.KAKAO_REST_KEY; // 환경 변수 값 가져오기
const isMapVisible = ref(false);

const searchPlace = async () => {
  if (!placeQuery.value.trim()) return; // 검색어가 없을 경우 종료

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
        placeQuery.value
      )}`,
      {
        headers: {
          Authorization: `KakaoAK ${kakaoRestKey}`,
        },
      }
    );
    const data = await response.json();
    searchResults.value = data.documents || []; // 검색 결과 저장
  } catch (error) {
    console.error('검색 중 오류 발생:', error);
  }
};

const selectPlace = (place) => {
  newEvent.value.lat = Number(place.y);
  newEvent.value.lng = Number(place.x);
  newEvent.value.place = place.place_name;
  searchResults.value = []; // 선택 후 리스트 닫기
  isMapVisible.value = true; // 장소를 선택하면 지도 활성화

};

const updateLat = (lat) => {
  newEvent.value.lat = lat;
};

const updateLng = (lng) => {
  newEvent.value.lng = lng;
};

const handleSubmit = async () => {
  try {
    console.log('addedEvent)');
    const formattedDate = dayjs(newEvent.value.dates).format("YYYY-MM-DD");

    // Firestore에 저장
    await eventStore.addEvent({
      customData: { ...newEvent.value },
      dates: formattedDate,
      lat: newEvent.value.lat,
      lng: newEvent.value.lng,
    });

    // 저장 후 페이지 이동
    navigateTo("/");
  } catch (error) {
    console.error("이벤트 저장 중 오류:", error);
    alert("이벤트 저장에 실패했습니다. 다시 시도해주세요.");
  }
};

// 이미지 업로드 처리 함수
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      newEvent.value.imageUrl = reader.result; // 이미지 URL을 newEvent 객체에 저장
    };
    reader.readAsDataURL(file); // 파일을 데이터 URL로 읽기
  }
};


const cancel = () => {
  navigateTo('/');
};
</script>

<style scoped>

</style>
