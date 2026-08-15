// 단원이 순례단에 합류 → 그 순례단 토픽에 FCM 토큰 구독
import { db, fcm, body } from './_admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, token } = body(req);
  if (!id || !token) return res.status(400).json({ error: 'id와 token이 필요해요' });

  const d = await db.doc('pilgrimages/' + id).get();
  if (!d.exists) return res.status(404).json({ error: '순례단을 찾을 수 없어요' });

  const x = d.data();
  try {
    await fcm.subscribeToTopic(token, x.topic);
    res.json({
      ok: true,
      topic: x.topic,
      fullName: x.fullName,
      course: x.course || null,
      tripDate: x.tripDate || null,
      departTime: x.departTime || null,
      start: x.start || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
