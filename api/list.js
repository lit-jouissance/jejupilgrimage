// 개설된 순례단 목록 (단원이 골라서 스스로 들어옴)
import { db } from './_admin.js';

export default async function handler(req, res) {
  const snap = await db.collection('pilgrimages')
    .orderBy('createdAt', 'desc').limit(200).get();
  const items = [];
  snap.forEach((d) => {
    const x = d.data();
    items.push({ id: x.code, name: x.name, fullName: x.fullName });
  });
  res.json({ items });
}
