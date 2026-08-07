// 단장이 자신의 순례 일정(담은 성지·순서·날짜)을 순례단에 저장 → 단원이 받아 봄
import { db, sha256, body } from './_admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, pw, course, tripDate, departTime } = body(req);
  const ref = db.doc('pilgrimages/' + id);
  const d = await ref.get();
  if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });
  if (sha256(pw) !== d.data().leaderHash)
    return res.status(401).json({ error: '비밀번호가 맞지 않아요' });

  await ref.update({
    course: Array.isArray(course) ? course : [],
    tripDate: tripDate || null,
    departTime: departTime || null,
    courseUpdatedAt: Date.now(),
  });
  res.json({ ok: true });
}
