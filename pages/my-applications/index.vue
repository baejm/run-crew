<template>
  <div class="my-applications-container">
    <h1>내 신청 목록</h1>
    
    <!-- 로딩 중 -->
    <div v-if="isLoading" class="placeholder">
      <LoadingSpinner />
    </div>

    <!-- 로딩 완료 후 신청 목록 -->
    <div v-else>
      <div v-if="applications.length > 0">
        <ul>
          <li
            v-for="(application, index) in applications"
            :key="application.id"
            class="application-item"
          >
            <h3>이벤트명: {{ application.eventTitle }}</h3>
            <p>
              이벤트 날짜:
              {{ application.eventDate
                ? formatDateWithTime(application.eventDate, application.eventStartTime)
                : "날짜 정보 없음" }}
            </p>
            <p>신청한 날짜: {{ dayjs(application.createdAt).format("YYYY년 MM월 DD일") }}</p>
            <div class="actions">
              <NuxtLink
                :to="`/my-applications/${application.id}/edit`"
                class="action-button edit-button"
                :class="{ disabled: isEventExpired(application) }"
                :tabindex="isEventExpired(application) ? -1 : 0"
                @click.prevent="isEventExpired(application) ? null : navigateToEdit(application.id)"
              >
                수정하기
              </NuxtLink>
              <button
                @click="deleteApplication(application.id, index)"
                class="action-button delete-button"
                :class="{ disabled: isEventExpired(application) }"
                :disabled="isEventExpired(application)"
              >
                취소하기
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- 신청 데이터가 없는 경우 -->
      <div v-else>
        <p>현재 신청한 이벤트가 없습니다.</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import dayjs from "dayjs";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";

const applications = ref([]);
const { $db } = useNuxtApp();
const eventStore = useEventStore();
const isLoading = ref(true);

// 로컬스토리지에서 전화번호 가져오기
const getPhoneFromLocalStorage = () => {
  const storedData = JSON.parse(localStorage.getItem("runRememberData"));
  return storedData?.phone || null;
};

// 신청 데이터 가져오기
const fetchApplications = async () => {
  isLoading.value = true; // 로딩 시작
  applications.value = []; // 신청 데이터 초기화
  try {
    const phone = getPhoneFromLocalStorage();
    if (!phone) {
      console.error("전화번호가 로컬스토리지에 없습니다.");
      return;
    }
    const applicationsQuery = query(
      collection($db, "event_applications"),
      where("phone", "==", phone)
    );
    const querySnapshot = await getDocs(applicationsQuery);
    applications.value = (
      await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const eventDetails = await eventStore.fetchEventDetails(data.event_id);
          return {
            id: doc.id,
            ...data,
            eventTitle: eventDetails?.title || "제목 없음",
            eventDate: eventDetails?.dates || null,
            eventStartTime: eventDetails?.startTime || "시간 정보 없음", // 시작 시간 추가
          };
        })
      )
    ).sort((a, b) => {
      // 날짜 비교
      const dateA = dayjs(a.eventDate);
      const dateB = dayjs(b.eventDate);

      if (dateA.isBefore(dateB)) return -1;
      if (dateA.isAfter(dateB)) return 1;
      
      // 날짜가 같으면 시간 비교
      return a.eventStartTime.localeCompare(b.eventStartTime);
    });
  } catch (error) {
    console.error("신청 목록 가져오기 실패:", error);
  } 
  finally{
    isLoading.value=false
  }
};

// 신청 데이터 삭제
const deleteApplication = async (id, index) => {
  if (!confirm("정말 삭제하시겠습니까?")) return; // 삭제 확인

  try {
    const applicationToDelete = applications.value[index]; // 삭제할 신청 데이터
    const eventId = applicationToDelete.event_id; // 관련 이벤트 ID

    // Firestore에서 신청 데이터 삭제
    await deleteDoc(doc($db, "event_applications", id));
    applications.value.splice(index, 1); // 로컬 데이터에서 제거

    // 모집 인원 증가
    const eventDetails = await eventStore.fetchEventDetails(eventId); // 이벤트 정보 가져오기
    if (eventDetails) {
      const newRemaining = eventDetails.remaining + 1; // 모집 인원 증가
      await eventStore.updateRemainingCount(eventId, newRemaining); // Firestore 업데이트
    }
    alert("신청이 성공적으로 삭제되었습니다.");
  } catch (error) {
    console.error("신청 삭제 실패:", error);
    alert("신청 삭제에 실패했습니다.");
  }
};

// 이벤트가 만료되었는지 확인
const isEventExpired = (application) => {
  if (application.eventDate && application.eventStartTime) {
    // ISO 형식을 로컬 시간으로 변환
    const eventDate = dayjs(application.eventDate).format("YYYY-MM-DD");
    const dateTimeString = `${eventDate} ${application.eventStartTime}`;
    const eventDateTime = dayjs(dateTimeString, "YYYY-MM-DD HH:mm");

    // 디버깅: 이벤트 시간 및 현재 시간 출력
    console.log("이벤트 날짜 및 시간:", eventDateTime.format("YYYY-MM-DD HH:mm"));
    console.log("현재 시간:", dayjs().format("YYYY-MM-DD HH:mm"));

    // 현재 시간과 비교
    return eventDateTime.isBefore(dayjs());
  }
  return false; // 날짜 또는 시간 정보가 없으면 만료되지 않은 것으로 간주
};


//이벤트날짜가 지났으면 클릭막기
const navigateToEdit = (id) => {
  if (!isEventExpired(id)) {
    navigateTo(`/my-applications/${id}/edit`);
  }
};

// 날짜 및 시간 형식 변환 함수
const formatDateWithTime = (date, time) => {
  if (!date || !time) return "날짜 정보 없음";
  const formattedDate = dayjs(date).format("YYYY년 MM월 DD일");
  return `${formattedDate} ${time}`;
};

// 데이터 초기화
onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.my-applications-container {
  padding: 20px;
}

.application-item {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  display: inline-block;
}
.action-button.disabled {
  pointer-events: none; 
  opacity: 0.5; 
  cursor: not-allowed; 
  background: #b1b1b1;
}
.edit-button {
  background-color: #007bff;
  color: white;
}

.edit-button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

</style>
