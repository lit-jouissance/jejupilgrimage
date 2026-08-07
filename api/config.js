// 알림 허용 기간 저장(단장) / 조회
import { db, sha256, body } from './_admin.js';

export default async function handler(req, res) {
  // 조회: /api/config?id=XXXX
  if (req.method === 'GET') {
    const id = req.query.id;
    const d = await db.doc('pilgrimages/' + id).get();
    if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });
    const x = d.data();
    return res.json({ notifyStart: x.notifyStart, notifyEnd: x.notifyEnd });
  }

  if (req.method !== 'POST') return res.status(405).end();
  const { id, pw, start, end } = body(req);
  const ref = db.doc('pilgrimages/' + id);
  const d = await ref.get();
  if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });
  if (sha256(pw) !== d.data().leaderHash)
    return res.status(401).json({ error: '비밀번호가 맞지 않아요' });

  await ref.update({ notifyStart: start || null, notifyEnd: end || null });
  res.json({ ok: true });
}
