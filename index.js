const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const http = require('http');
const router = require('./router/routes');
const connectDB = require('./handlers/db');
const vision = require("@google-cloud/vision");
const multer = require("multer");

// Vision API 클라이언트 초기화
const client = new vision.ImageAnnotatorClient({
    credentials: {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // 개행문자 처리
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
    }
});

connectDB();
const app = express();
const upload = multer({
    storage: multer.memoryStorage(), // 파일을 메모리에 저장 (또는 디스크 스토리지 사용 가능)
    limits: {
        fileSize: 5 * 1024 * 1024, // 파일 크기 제한 (5MB)
    },
});

const corsOptions = {
    origin: 'https://attendance-list-fe.vercel.app', // 클라이언트 도메인
    credentials: true, // 인증 정보 포함 허용
};
app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);

app.use('/api', router);

app.post("/ocr", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: "파일이 업로드되지 않았습니다." });
        }

        console.log("업로드된 파일:", req.file);

        // Google Vision API로 이미지에서 텍스트 추출
        const [result] = await client.textDetection(req.file.buffer); // req.file.buffer는 메모리에 저장된 이미지
        const detections = result.textAnnotations;

        if (detections && detections.length > 0) {
            const extractedText = detections[0].description; // 추출된 텍스트
            console.log("OCR 추출 결과:", extractedText);
            res.json({ text: extractedText });
        } else {
            res.status(200).json({ text: "텍스트를 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("OCR 처리 중 오류:", error);
        res.status(500).send({ error: "OCR 처리 중 오류가 발생했습니다." });
    }
});

app.listen(PORT,()=>console.log(`port: ${PORT}`));