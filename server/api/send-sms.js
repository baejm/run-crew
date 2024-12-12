import axios from "axios";
import crypto from "crypto";

export default defineEventHandler(async (event) => {
  const formatPhoneNumber = (phone) => phone.replace(/[^0-9]/g, "");

  const body = await readBody(event);
  const { to, text } = body;

  const formattedTo = formatPhoneNumber(to); 
  const config = useRuntimeConfig();

  // 유효성 검사
  if (!formattedTo || !text || formattedTo.length < 10) {
    console.error("전화번호 또는 메시지 유효성 검사 실패:", { to, text });
    throw createError({
      statusCode: 400,
      message: "유효하지 않은 전화번호 또는 메시지입니다.",
    });
  }

  // HMAC-SHA256 서명 생성 함수
  const createSignature = (date, salt, apiSecret) => {
    const data = date + salt;
    return crypto.createHmac("sha256", apiSecret).update(data).digest("hex");
  };

  try {
    // ISO 8601 날짜 형식과 난수 생성
    const date = new Date().toISOString();
    const salt = crypto.randomBytes(16).toString("hex");

    // 서명 생성
    const signature = createSignature(date, salt, config.public.COOLSMS_API_SECRET);

    console.log("CoolSMS 요청 시작:", { from: config.public.COOLSMS_SENDER_PHONE, to: formattedTo, text });

    // CoolSMS API 요청
    const response = await axios.post(
      "https://api.coolsms.co.kr/messages/v4/send",
      {
        message: {
          to: formattedTo,
          from: config.public.COOLSMS_SENDER_PHONE,
          text,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `HMAC-SHA256 apiKey=${config.public.COOLSMS_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
        },
      }
    );

    // 응답 상태 코드 확인
    if (response.status !== 200 || !response.data) {
      console.error("CoolSMS 오류:", response.data);
      throw createError({
        statusCode: response.status || 500,
        message: `CoolSMS 전송 실패: ${response.data.error?.message || "알 수 없는 오류"}`,
      });
    }

    console.log("CoolSMS 응답 성공:", response.data);

    return {
      success: true,
      message: "메시지가 성공적으로 전송되었습니다.",
      response: response.data,
    };
  } catch (error) {
    console.error("CoolSMS 전송 실패:", error.response?.data || error.message || error);
    throw createError({
      statusCode: 500,
      message: "메시지 전송 실패",
      details: error.message,
    });
  }
});
