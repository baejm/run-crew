const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// HTTP 트리거 테스트 함수
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});

// 3개월마다 실행되는 함수 Blaze 요금제 사용시 동작...
exports.scheduledDeleteOldEvents = functions.pubsub
  .schedule("0 0 1 */3 *") // 3개월마다 매월 1일 자정 실행
  .timeZone("Asia/Seoul") // 타임존 설정
  .onRun(async () => {
    const db = admin.firestore();
    const today = new Date();

    const cutoffDate = new Date();
    cutoffDate.setMonth(today.getMonth() - 3);

    try {
      // 이전 이벤트 삭제
      const eventsSnapshot = await db
        .collection("events")
        .where("event_date", "<", cutoffDate.toISOString())
        .get();

      eventsSnapshot.forEach((doc) => {
        doc.ref.delete();
        console.log(`이전 이벤트 삭제: ${doc.id}`);
      });

      // 관련 신청자 데이터 삭제
      const applicationsSnapshot = await db
        .collection("event_applications")
        .where("createdAt", "<", cutoffDate.toISOString())
        .get();

      applicationsSnapshot.forEach((doc) => {
        doc.ref.delete();
        console.log(`이전 신청 정보 삭제: ${doc.id}`);
      });

      console.log("이전 데이터 삭제 완료.");
    } catch (error) {
      console.error("데이터 삭제 중 오류 발생:", error);
    }
    return null;
  });
