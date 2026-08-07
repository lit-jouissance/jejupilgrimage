// 순례단 삭제: 단장 비밀번호 확인 후 문서 삭제
import { db, sha256, body } from './_admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, pw } = body(req);
  const ref = db.doc('pilgrimages/' + id);
  const d = await ref.get();
  if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });
  if (sha256(pw) !== d.data().leaderHash)
    return res.status(401).json({ error: '비밀번호가 맞지 않아요' });

  await ref.delete();
  res.json({ ok: true });
}
