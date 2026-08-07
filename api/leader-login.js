// 단장 로그인: 비번 확인 → 기본(0000)이면 변경 필요 신호
import { db, sha256, body } from './_admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, pw } = body(req);
  const d = await db.doc('pilgrimages/' + id).get();
  if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });

  const x = d.data();
  if (sha256(pw) !== x.leaderHash) return res.status(401).json({ error: '비밀번호가 맞지 않아요' });

  res.json({
    ok: true,
    pwChanged: !!x.pwChanged,       // false면 아직 기본 비번(0000)
    name: x.name,
    fullName: x.fullName,
    notifyStart: x.notifyStart,
    notifyEnd: x.notifyEnd,
  });
}
