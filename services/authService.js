import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Firebase 인증 초기화 (project의 firebase 설정이 필요합니다)

export const loginUser = async (email, password) => {
    const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user; // 로그인 성공 시 사용자 정보 반환
  } catch (error) {
    console.error("Login Error:", error);
    return null; // 로그인 실패 시 null 반환
  }
};