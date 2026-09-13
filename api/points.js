const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");
const AR = require("../lib/areas");

/* مكافأة الدخول اليومي: مرة واحدة كل يوم (بتوقيت السعودية)، تكبر مع الأيام المتتالية، واليوم السابع صندوق */
const DAILY = [3, 4, 5, 6, 7, 8, 15];
async function rivals(me){
  const mk = EV.monthKey();
  const [flat, namesFlat] = await db.pipeline([["ZREVRANGE", "lb:month:" + mk, 0, -1, "WITHSCORES"], ["HGETALL", "names"]]);
  const names = db.flatToObj(namesFlat), board = db.flatToPairs(flat);
  const i = board.findIndex(x => x.member === me.u);
  const nm = x => x ? (names[x.member] || x.member) : null;
  if(i < 0) return { rank: null, players: board.length, leader: board[0] ? { name: nm(board[0]), points: board[0].score } : null };
  const above = i > 0 ? board[i - 1] : null, below = board[i + 1] || null;
  return { rank: i + 1, players: board.length, points: board[i].score,
    above: above ? { name: nm(above), gap: above.score - board[i].score } : null,
    below: below ? { name: nm(below), gap: board[i].score - below.score } : null };
}
async function claimDaily(me){
  const now = Date.now(), today = EV.dateKey(now), yest = EV.dateKey(now - 864e5);
  const lock = await db.call("SET", `daily:${me.u}:${today}`, "1", "NX", "EX", 172800);
  const st = db.flatToObj(await db.call("HGETALL", "streak:" + me.u));
  let cur = Number(st.cur || 0), best = Number(st.best || 0);
  if(lock !== "OK") return { claimed: false, today, streak: cur, best, rewards: DAILY, day: ((Math.max(cur, 1) - 1) % 7) + 1, rivals: await rivals(me) };
  cur = st.last === yest ? cur + 1 : 1;
  best = Math.max(best, cur);
  const day = ((cur - 1) % 7) + 1, reward = DAILY[day - 1];
  const wk = db.weekKey(), mk = EV.monthKey();
  await db.pipeline([
    ["HSET", "streak:" + me.u, "cur", cur, "best", best, "last", today],
    ["ZINCRBY", "lb:total", reward, me.u], ["ZINCRBY", "lb:week:" + wk, reward, me.u], ["ZINCRBY", "lb:month:" + mk, reward, me.u],
    ["HINCRBY", "ptsx:" + me.u, "daily", reward], ["HSET", "names", me.u, me.name]
  ]);
  return { claimed: true, today, reward, streak: cur, best, day, rewards: DAILY, broke: !!st.last && st.last !== yest && cur === 1 && Number(st.cur || 0) > 1, rivals: await rivals(me) };
}

/* تفصيل نقاط المستخدم: لكل منطقة + البنود الإضافية، والمجموع يطابق الترتيب.
   POST {ack: id} يعلّم رسالة (تعويض/جائزة) كمقروءة. */
module.exports = H.handler(["GET", "POST"], async (req, res) => {
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  if(req.method === "POST"){
    const b = await H.body(req);
    if(b.daily) return H.ok(res, await claimDaily(me));
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
