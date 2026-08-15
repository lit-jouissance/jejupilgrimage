// 단장이 자신의 순례 일정(담은 성지·순서·날짜)을 순례단에 저장 → 단원이 받아 봄
// 저장 후 순례단 토픽에 "일정이 업데이트됐어요" 알림 자동 발송
import { db, fcm, sha256, body } from './_admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, pw, course, tripDate, departTime, start } = body(req);
  const ref = db.doc('pilgrimages/' + id);
  const d = await ref.get();
  if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });
  const x = d.data();
  if (sha256(pw) !== x.leaderHash)
    return res.status(401).json({ error: '비밀번호가 맞지 않아요' });

  await ref.update({
    course: Array.isArray(course) ? course : [],
    tripDate: tripDate || null,
    departTime: departTime || null,
    start: (start && start.name) ? start : null,
    courseUpdatedAt: Date.now(),
  });

  // 단원들에게 일정 변경 알림 (실패해도 저장은 성공으로 처리)
  let notified = false;
  try {
    await fcm.send({
      topic: x.topic,
      notification: {
        title: '순례 일정이 업데이트됐어요',
        body: (x.name || '순례단') + ' 단장이 순례 일정을 새로 정했어요. 앱에서 확인하세요.',
      },
      data: { type: 'course-updated' },
    });
    notified = true;
  } catch (e) { /* 구독자가 없거나 발송 실패해도 저장은 유지 */ }

  res.json({ ok: true, notified });
}

