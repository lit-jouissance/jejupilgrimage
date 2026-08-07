// 공용 firebase-admin 초기화 (모든 /api 함수가 가져다 씀)
import admin from 'firebase-admin';
import crypto from 'crypto';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      // Vercel 환경변수에 줄바꿈이 \n 문자로 들어오므로 실제 줄바꿈으로 복원
      privateKey: (process.env.FB_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

export const db = admin.firestore();
export const fcm = admin.messaging();
export const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

// 요청 body를 안전하게 JSON으로 파싱
export function body(req) {
  if (!req.body) return {};
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
}
