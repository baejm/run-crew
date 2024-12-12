<template>
  <div class="applicant-list">
    <!-- 엑셀 다운로드 버튼 -->
    <button @click="downloadExcel" class="download-button">엑셀로 다운로드</button>
    <h2 class="title">신청자 목록</h2>
    <div v-if="applications.length > 0">
      <h3 v-if="eventDetails" class="event-details">이벤트: {{ eventDetails.title }}</h3>
      <p v-if="eventDetails" class="event-dates">날짜: {{ eventDetails.dates }}</p>
      <p v-if="eventDetails" class="event-time">시간: {{ eventDetails.startTime }} - {{ eventDetails.endTime }}</p>
      <p v-if="eventDetails" class="event-count">참가인원:{{ eventDetails.applicantCount }}</p>
      <div>
        <ul>
          <li v-for="applicant in applications" :key="applicant.id" class="applicant-item">
            <p class="applicant-name">이름: {{ applicant.name }}</p>
            <p class="applicant-email">이메일: {{ applicant.email }}</p>
            <p class="applicant-phone">폰 번호: {{ applicant.phone }}</p>
            <p class="applicant-group">그룹: {{ applicant.group_name }}</p>
            <p class="applicant-group">신청 날짜: {{ $dayjs(applicant.createdAt).format('YYYY.MM.DD') }}</p>
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="no-applicants">
      <p>신청자가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx';

const route = useRoute();
const eventId = route.params.id; 
const eventStore = useEventStore();
const applications = ref([]);
const eventDetails = ref(null); // 이벤트 정보를 저장할 변수

definePageMeta({
  middleware: 'auth', 
});

onMounted(async () => {
  const { applicants, applicantCount } = await eventStore.fetchApplicationsForEvent(eventId);
   // 신청자 데이터를 신청 날짜(createdAt) 순으로 정렬
   applications.value = applicants.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  // 이벤트 정보 가져오기
  eventDetails.value = await eventStore.fetchEventById(eventId);
  eventDetails.value.applicantCount = applicantCount; // 신청자 수 추가
});


// 엑셀 다운로드 함수
const downloadExcel = () => {
  if (!eventDetails.value || applications.value.length === 0) {
    alert('엑셀로 내보낼 데이터가 없습니다.');
    return;
  }

  // 엑셀 데이터 구성
  const headerData = [
    ['이벤트명', eventDetails.value.title],
    ['장소', eventDetails.value.place || '정보 없음'],
    ['시간', `${eventDetails.value.startTime} - ${eventDetails.value.endTime}`],
    [],
    ['이름', '이메일', '폰 번호', '그룹', '신청 날짜'],
  ];

  const excelData = applications.value.map((applicant) => [
    applicant.name,
    applicant.email,
    applicant.phone,
    applicant.group_name,
    useNuxtApp().$dayjs(applicant.createdAt).format('YYYY-MM-DD'),
  ]);

  const worksheetData = [...headerData, ...excelData];

  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '신청자 목록');

  // 엑셀 파일 다운로드
  XLSX.writeFile(workbook, `${eventDetails.value.title}_${new Date().toISOString().slice(0, 10)}신청자 목록.xlsx`);
};
</script>

<style scoped>

</style>