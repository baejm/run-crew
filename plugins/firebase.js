// plugins/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore  } from 'firebase/firestore'
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";


export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const firebaseConfig = {
    //파이어베이스 디비2용 예비용
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  }

  // Firebase 앱 초기화
  const firebaseApp = initializeApp(firebaseConfig)
  const auth = getAuth(firebaseApp);
  // Firestore 초기화
  const db = getFirestore(firebaseApp)
  const database = getDatabase(firebaseApp);
  const storage  = getStorage(firebaseApp);
  // Auth 초기화 및 설정

   // **테스트 환경에서 ReCAPTCHA 비활성화**
   if (process.env.NODE_ENV === "development") {
    try {
      auth.settings.appVerificationDisabledForTesting = true;
    } catch (error) {
      console.error("Failed to set appVerificationDisabledForTesting:", error);
    }
  }

  return {
    provide: {
      db,
      auth,
      database,
      storage 
    }
  }
})
