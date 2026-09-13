const A = require("../lib/auth");
const H = require("../lib/http");
const RC = require("../lib/recap");

/* ملخص آخر ساعة ذهب انتهت: نتيجتي + الأكثر تجميعًا */
module.exports = H.handler(["GET"], async (req, res) => {
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  const win = RC.lastGolden(Date.now());
  if(!win) return H.ok(res, { recap: null });
  const r = await RC.recap(win);
  const active = r.list.filter(x => x.gained > 0);
  const mine = r.list.find(x => x.u === me.u) || null;
  H.ok(res, { recap: { id: r.id, key: r.key, title: r.title, start: r.start, end: r.end, mult: r.mult, players: active.length,
    top: active.slice(0, 5).map(x => ({ name: x.name, gained: x.gained, me: x.u === me.u })), me: mine } });
});
