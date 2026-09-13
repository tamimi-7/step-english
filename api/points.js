const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");
const AR = require("../lib/areas");

/* تفصيل نقاط المستخدم: لكل منطقة + البنود الإضافية، والمجموع يطابق الترتيب.
   POST {ack: id} يعلّم رسالة (تعويض/جائزة) كمقروءة. */
module.exports = H.handler(["GET", "POST"], async (req, res) => {
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  if(req.method === "POST"){
    const b = await H.body(req);
    const id = String(b.ack || "").slice(0, 60);
    const raw = id && await db.call("HGET", "notices:" + me.u, id);
    if(raw){ let n = null; try{ n = JSON.parse(raw); }catch(e){} if(n){ n.acked = Date.now(); await db.call("HSET", "notices:" + me.u, id, JSON.stringify(n)); } }
    return H.ok(res, { ok: true });
  }
  const wk = db.weekKey(), mk = EV.monthKey();
  const [areasFlat, extraFlat, stages, noticesFlat, tp, mp, wp, rank, mrank, wrank, earnedN, gstart] = await db.pipeline([
    ["HGETALL", "ptsa:" + me.u], ["HGETALL", "ptsx:" + me.u], ["SMEMBERS", "stages:" + me.u], ["HGETALL", "notices:" + me.u],
    ["ZSCORE", "lb:total", me.u], ["ZSCORE", "lb:month:" + mk, me.u], ["ZSCORE", "lb:week:" + wk, me.u],
    ["ZREVRANK", "lb:total", me.u], ["ZREVRANK", "lb:month:" + mk, me.u], ["ZREVRANK", "lb:week:" + wk, me.u],
    ["SCARD", "earned:" + me.u], ["GET", "giftstart:" + ((EV.giftFor(me) || {}).id || "none") + ":" + me.u]
  ]);
  const num = o => Object.fromEntries(Object.entries(db.flatToObj(o)).map(([k, v]) => [k, Number(v) || 0]));
  const areas = num(areasFlat), extra = num(extraFlat);
  const sumAreas = Object.values(areas).reduce((a, b) => a + b, 0), sumExtra = Object.values(extra).reduce((a, b) => a + b, 0);
  const total = Number(tp || 0);
  const notices = Object.values(db.flatToObj(noticesFlat)).map(x => { try{ return JSON.parse(x); }catch(e){ return null; } }).filter(Boolean).sort((a, b) => a.at - b.at);
  const gift = EV.giftFor(me, Date.now(), gstart ? Number(gstart) : null);
  const rk = v => v === null || v === undefined ? null : Number(v) + 1;
  H.ok(res, {
    total, month: Number(mp || 0), week: Number(wp || 0), rank: rk(rank), monthRank: rk(mrank), weekRank: rk(wrank),
    areas: AR.AREAS.map(a => ({ key: a.key, label: a.label, points: areas[a.key] || 0 })).concat(areas.other ? [{ key: "other", label: "أخرى", points: areas.other }] : []),
    extras: Object.entries(AR.EXTRAS).map(([k, label]) => ({ key: k, label, points: extra[k] || 0 })),
    sum: sumAreas + sumExtra, consistent: sumAreas + sumExtra === total, uniqueQuestions: Number(earnedN || 0),
    stages, stagePoints: AR.STAGE_POINTS,
    notices: notices.filter(n => !n.acked), gift: gift && gstart ? { id: gift.id, title: gift.title, msg: gift.msg, mult: gift.mult, endsAt: gift.endsAt } : (gift ? { id: gift.id, title: gift.title, msg: gift.msg, mult: gift.mult, endsAt: gift.endsAt, pending: true } : null),
    week_key: wk, month_key: mk
  });
});
