<template>
    <div class="application-edit-container">
      <h1>신청 정보 수정</h1>
      <div v-if="application">
        <form @submit.prevent="updateApplication">
          <div class="form-group">
            <label for="name">이름</label>
            <input
              type="text"
              id="name"
              v-model="application.name"
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          <div class="form-group">
            <label for="phone">폰 번호</label>
            <input
              type="tel"
              id="phone"
              v-model="application.phone"
              placeholder="폰 번호를 입력하세요"
              required
            />
          </div>
          <div class="form-group">
            <label for="email">이메일</label>
            <input
              type="email"
              id="email"
              v-model="application.email"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          <div class="form-group">
            <label for="group">그룹</label>
            <select id="group" v-model="application.group_name" required>
              <option value="" disabled>그룹을 선택하세요</option>
              <option value="05k">05k</option>
              <option value="06k">06k</option>
              <option value="07k">07k</option>
              <option value="08k">08k</option>
            </select>
          </div>
          <button type="submit" class="save-button">저장</button>
        </form>
      </div>
      <div v-else>
        <p>신청 정보를 불러오는 중입니다...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { doc, getDoc, updateDoc } from "firebase/firestore";
  
  const route = useRoute();
  const router = useRouter();
  const { $db } = useNuxtApp();
  const applicationId = route.params.id;
  
  const application = ref(null);
  
  // Firestore에서 신청 정보 가져오기
  const fetchApplication = async () => {
    try {
      const docRef = doc($db, "event_applications", applicationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        application.value = docSnap.data();
      } else {
        console.error("신청 정보를 찾을 수 없습니다.");
        router.push("/my-applications"); // 잘못된 접근 시 목록으로 이동
      }
    } catch (error) {
      console.error("신청 정보 가져오기 실패:", error);
    }
  };
  
  // 신청 정보 업데이트
  const updateApplication = async () => {
    try {
      const docRef = doc($db, "event_applications", applicationId);
      await updateDoc(docRef, {
        name: application.value.name,
        phone: application.value.phone,
        email: application.value.email,
        group_name: application.value.group_name, // 그룹 선택 값 저장
      });
      alert("신청 정보가 성공적으로 저장되었습니다.");
      router.push("/my-applications"); // 수정 후 목록으로 이동
    } catch (error) {
      console.error("신청 정보 업데이트 실패:", error);
      alert("저장에 실패했습니다.");
    }
  };
  
  // 데이터 초기화
  onMounted(() => {
    fetchApplication();
  });
  </script>
  
  <style scoped>
  .application-edit-container {
    padding: 20px;
  }
  
  h1 {
    margin-bottom: 20px;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
  }
  
  label {
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input,
  select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
  
  input::placeholder {
    color: #aaa;
  }
  
  .save-button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .save-button:hover {
    background-color: #0056b3;
  }
  </style>
  