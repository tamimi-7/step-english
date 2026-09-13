const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");
const AR = require("../lib/areas");

/* سجل نقاط أي مشارك (شفاف للجميع): التفصيل حسب المنطقة + كل الجولات بوقتها ونقاطها.
   ما فيه أي معلومة خاصة — نفس اللي يظهر في الترتيب بس بالتفصيل. */
module.exports = H.handler(["GET"], async (req, res) => {
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  const u = String(H.query(req).u || me.u).slice(0, 40);
  const exists = await db.call("SISMEMBER", "users", u);
  if(!(exists === 1 || exists === "1")) return H.err(res, 404, "المستخدم غير موجود");
  const wk = db.weekKey(), mk = EV.monthKey();
  const [name, areasFlat, extraFlat, stages, tp, mp, wp, earnedN, results, streakFlat] = await db.pipeline([
    ["HGET", "names", u], ["HGETALL", "ptsa:" + u], ["HGETALL", "ptsx:" + u], ["SMEMBERS", "stages:" + u],
    ["ZSCORE", "lb:total", u], ["ZSCORE", "lb:month:" + mk, u], ["ZSCORE", "lb:week:" + wk, u],
    ["SCARD", "earned:" + u], ["LRANGE", "results:" + u, 0, -1], ["HGETALL", "streak:" + u]
  ]);
  const num = o => Object.fromEntries(Object.entries(db.flatToObj(o)).map(([k, v]) => [k, Number(v) || 0]));
  const areas = num(areasFlat), extra = num(extraFlat), st = db.flatToObj(streakFlat);
  const sumAreas = Object.values(areas).reduce((a, b) => a + b, 0), sumExtra = Object.values(extra).reduce((a, b) => a + b, 0);
  const total = Number(tp || 0);
  const rounds = (results || []).map(x => { try{ return JSON.parse(x); }catch(e){ return null; } }).filter(Boolean)
    .map(r => ({ at: r.at, mode: r.mode, score: r.score, total: r.total, points: r.points || 0, base: r.base, bonus: r.bonus || 0, mult: r.mult || 1, stage: r.stage || null, partial: !!r.partial, challenge: !!r.challenge }));
  H.ok(res, {
    u, name: name || u, total, month: Number(mp || 0), week: Number(wp || 0), uniqueQuestions: Number(earnedN || 0),
    areas: AR.AREAS.map(a => ({ key: a.key, label: a.label, points: areas[a.key] || 0 })).concat(areas.other ? [{ key: "other", label: "أخرى", points: areas.other }] : []).filter(a => a.points),
    extras: Object.entries(AR.EXTRAS).map(([k, label]) => ({ key: k, label, points: extra[k] || 0 })).filter(x => x.points),
    sum: sumAreas + sumExtra, consistent: sumAreas + sumExtra === total,
    stages: (stages || []).length, streak: Number(st.cur || 0), best: Number(st.best || 0),
    rounds, roundsKept: 500
  });
});
