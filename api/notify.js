// 알림 발송: 단장 비번 확인 + 허용 기간 확인 후 순례단 토픽으로 전송
// (기본 비번 0000이어도 발송은 되지만, 경고는 앱 화면에서 띄움)
import { db, fcm, sha256, body } from './_admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, pw, title, body: msg } = body(req);
  if (!title || !msg) return res.status(400).json({ error: '제목과 내용을 입력해 주세요' });

  const d = await db.doc('pilgrimages/' + id).get();
  if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });
  const x = d.data();
  if (sha256(pw) !== x.leaderHash) return res.status(401).json({ error: '비밀번호가 맞지 않아요' });

  const now = Date.now();
  if (x.notifyStart && now < new Date(x.notifyStart).getTime())
    return res.status(403).json({ error: '아직 알림 발송 기간이 아니에요' });
  if (x.notifyEnd && now > new Date(x.notifyEnd).getTime())
    return res.status(403).json({ error: '알림 발송 기간이 지났어요' });

  try {
    await fcm.send({ topic: x.topic, notification: { title, body: msg } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
