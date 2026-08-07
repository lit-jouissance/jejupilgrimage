// 단장 비밀번호 변경 (현재 비번 확인 후 교체)
import { db, sha256, body } from './_admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, pw, newPw } = body(req);
  if (!newPw || String(newPw).length < 4)
    return res.status(400).json({ error: '새 비밀번호는 4자 이상으로 정해 주세요' });

  const ref = db.doc('pilgrimages/' + id);
  const d = await ref.get();
  if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });
  if (sha256(pw) !== d.data().leaderHash)
    return res.status(401).json({ error: '현재 비밀번호가 맞지 않아요' });

  await ref.update({ leaderHash: sha256(newPw), pwChanged: true });
  res.json({ ok: true });
}
