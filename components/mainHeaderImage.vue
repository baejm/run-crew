<template>
  <div class="header-container">
    <div v-if="isLoading"><LoadingSpinner /></div>
    <div v-else>
      <div v-if="userStore.isAdmin">
          <form @submit.prevent="submitImage" class="image-upload-form">
              <label for="imageUpload" class="image-upload-label">이미지 업로드</label>
              <input
                  ref="fileInput"
                  class="image-upload-input"
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  @change="onFileChange"
              />
              <!-- 미리보기 -->
              <div v-if="imgSrc" class="image-preview">
                  <div class="image_btn">
                    <button type="submit" class="image-upload-button">등록</button>
                    <button type="button" class="image-cancle-button" @click=cancleImage>취소</button>
                  </div>
                  <h3 class="preview-title">미리보기</h3>
                  <img :src="imgSrc" alt="미리보기 이미지" class="preview-img" />
              </div>
          </form>
      </div>
      <!-- Firestore에서 가져온 이미지 출력 -->
      <div v-if="headerImage" class="header_img">
          <img :src="headerImage" alt="등록된 이미지" class="header-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
const userStore = useUserStore();

const imgSrc = ref(null); // 파일 리더로 변환된 이미지 URL (미리보기용)
const file = ref(null); // 업로드할 파일 객체
const headerImage = ref(null); // Firestore에서 가져온 이미지 URL
const isLoading = ref(true); // 로딩 상태 추적
const fileInput = ref(null); // 파일 입력 필드 참조
const db = getFirestore();


// 파일 업로드 시 데이터 URL 생성
const onFileChange = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    file.value = selectedFile;

    const reader = new FileReader();
    reader.onload = () => {
      imgSrc.value = reader.result; // 파일을 데이터 URL로 변환
    };
    reader.readAsDataURL(selectedFile);
  }
};

// Firestore에서 이미지 URL 가져오기
const fetchHeaderImage = async () => {
  try {
    const docRef = doc(db, "settings", "headerImage");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      headerImage.value = docSnap.data().url; // Firestore에 저장된 URL
    } else {
      console.error("등록된 이미지가 없습니다.");
    }
  } catch (error) {
    console.error("이미지 URL을 가져오지 못했습니다:", error);
  } finally {
    isLoading.value = false; // 로딩 완료
  }
};

// Firestore에 데이터 URL 저장
const submitImage = async () => {
  if (!imgSrc.value) {
    alert("이미지를 선택해주세요.");
    return;
  }

  try {
    const docRef = doc(db, "settings", "headerImage");
    await setDoc(docRef, { id: "header_img", url: imgSrc.value });

    alert("이미지가 성공적으로 등록되었습니다.");
    headerImage.value = imgSrc.value; // 등록 후 즉시 화면에 반영
    imgSrc.value = null; // 미리보기 초기화
    file.value = null; // 입력창 초기화
  } catch (error) {
    console.error("이미지 URL 저장에 실패했습니다:", error);
  }
};

// 컴포넌트가 마운트될 때 Firestore에서 이미지 URL 가져오기
onMounted(() => {
  fetchHeaderImage();
});

const cancleImage = () => {
  imgSrc.value = null;
  file.value = null;
    // 파일 입력 필드 초기화
    if (fileInput.value) {
    fileInput.value.value = ""; // 입력 값을 빈 문자열로 설정
  }
}

</script>

<style lang="scss" scoped>

</style>