import { getFirestore, getDocs, query, collection, where  } from "firebase/firestore";

export const getDbInstance = () => {
  const firebaseApp = useNuxtApp().$firebaseApp; // Firebase 앱 가져오기
  return getFirestore(firebaseApp);
};

// 이벤트 및 신청자 삭제 서비스 예시
export const deleteOldEventsAndApplications = async () => {
  const db = getDbInstance(); // Firestore 인스턴스 가져오기

  const today = new Date();
  const cutoffDate = new Date();
  cutoffDate.setMonth(today.getMonth() - 3);

  try {
    // 오래된 이벤트 삭제
    const eventsSnapshot = await getDocs(
      query(
        collection(db, "events"),
        where("event_date", "<", cutoffDate.toISOString())
      )
    );

    if (eventsSnapshot.empty) {
        console.log("삭제할 이벤트가 없습니다.");
        return "삭제할 이벤트가 없습니다.";
      }

    const deleteEventPromises = eventsSnapshot.docs.map((doc) => {
      console.log(`이벤트 삭제: ${doc.id}`);
      return doc.ref.delete();
    });

    await Promise.all(deleteEventPromises);
    console.log("이벤트 데이터 삭제 완료.");
    return "데이터 삭제가 성공적으로 완료되었습니다!";
  } catch (error) {
    console.error("데이터 삭제 중 오류:", error);
    throw new Error("데이터 삭제 중 문제가 발생했습니다.");
  }
};
