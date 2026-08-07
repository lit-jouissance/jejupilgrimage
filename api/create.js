// 순례단 개설: 이름 뒤에 짧은 코드를 붙여 중복 구분. 단장 비번 기본값 0000.
import { db, sha256, body } from './_admin.js';

const CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 헷갈리는 0,O,1,I 제외
function makeCode(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += CH[Math.floor(Math.random() * CH.length)];
  return s;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name } = body(req);
  if (!name || !name.trim()) return res.status(400).json({ error: '순례단 이름을 입력해 주세요' });

  // 사용되지 않은 짧은 코드 뽑기
  let id = null;
  for (let i = 0; i < 6; i++) {
    const c = makeCode(4);
    const d = await db.doc('pilgrimages/' + c).get();
    if (!d.exists) { id = c; break; }
  }
  if (!id) return res.status(500).json({ error: '코드 생성에 실패했어요. 다시 시도해 주세요' });

  const fullName = name.trim() + '-' + id;
  await db.doc('pilgrimages/' + id).set({
    name: name.trim(),
    code: id,
    fullName,
    topic: 'pilgrims_' + id,
    leaderHash: sha256('0000'),
    pwChanged: false,
    notifyStart: null,
    notifyEnd: null,
    createdAt: Date.now(),
  });

  res.json({ ok: true, id, fullName, topic: 'pilgrims_' + id });
}
