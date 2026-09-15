const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");
const AR = require("../lib/areas");
const RC = require("../lib/recap");
const LG = require("../lib/log");
const DL = require("../lib/daily");

async function feedbackTally(v, u){
  const all = db.flatToObj(await db.call("HGETALL", "feedback:" + v));
  const tally = { love: 0, ok: 0, no: 0 }; let mine = null; const voters = [];
  Object.entries(all).forEach(([k, raw]) => { try{ const x = JSON.parse(raw); tally[x.rating] = (tally[x.rating] || 0) + 1; voters.push({ name: x.name || k, rating: x.rating }); if(k === u) mine = x; }catch(e){} });
  return { v, tally, total: voters.length, voters, mine };
}
/* الحضور اليومي بدون نقاط: سلسلة أيام متتالية، ودرع يحمي السلسلة من يوم فائت (درع لكل ٧ أيام، حدّه ٢)،
   ومين من المشاركين دخل اليوم ومين سلسلته مهددة */
async function family(me, today, yest){
  const [users, namesFlat] = await db.pipeline([["SMEMBERS", "users"], ["HGETALL", "names"]]);
  const names = db.flatToObj(namesFlat), list = (users || []).slice(0, 60);
  const st = list.length ? await db.pipeline(list.map(u => ["HMGET", "streak:" + u, "cur", "last"])) : [];
  const today_ = [], waiting = [];
  list.forEach((u, i) => {
    const [cur, last] = st[i] || [];
    const row = { name: names[u] || u, streak: Number(cur || 0), me: u === me.u };
    if(last === today) today_.push(row); else if(last === yest && row.streak >= 2) waiting.push(row);
  });
  today_.sort((a, b) => b.streak - a.streak); waiting.sort((a, b) => b.streak - a.streak);
  return { today: today_, waiting };
}
async function claimDaily(me){
  const now = Date.now(), today = EV.dateKey(now), yest = EV.dateKey(now - 864e5), before = EV.dateKey(now - 2 * 864e5);
  const lock = await db.call("SET", `daily:${me.u}:${today}`, "1", "NX", "EX", 172800);
  const st = db.flatToObj(await db.call("HGETALL", "streak:" + me.u));
  let cur = Number(st.cur || 0), best = Number(st.best || 0), shields = Number(st.shields || 0);
  if(lock !== "OK") return { claimed: false, today, streak: cur, best, shields, family: await family(me, today, yest) };
  let usedShield = false, gotShield = false;
  if(st.last === yest) cur += 1;
  else if(st.last === before && shields > 0 && cur > 0){ cur += 1; shields -= 1; usedShield = true; }
  else cur = 1;
  if(cur % 7 === 0 && shields < 2){ shields += 1; gotShield = true; }
  best = Math.max(best, cur);
  await db.pipeline([["HSET", "streak:" + me.u, "cur", cur, "best", best, "last", today, "shields", shields], ["HSET", "names", me.u, me.name]]);
  const broke = !!st.last && !usedShield && st.last !== yest && Number(st.cur || 0) > 1;
  return { claimed: true, today, streak: cur, best, shields, usedShield, gotShield, broke, lost: broke ? Number(st.cur) : 0, family: await family(me, today, yest) };
}

/* تفصيل نقاط المستخدم: لكل منطقة + البنود الإضافية، والمجموع يطابق الترتيب.
   POST {ack: id} يعلّم رسالة (تعويض/جائزة) كمقروءة. */
module.exports = H.handler(["GET", "POST"], async (req, res) => {
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  if(req.method === "POST"){
    const b = await H.body(req);
    if(b.daily) return H.ok(res, await claimDaily(me));
    /* رأي المشارك في الشكل الجديد */
    if(b.feedback){
      const f = b.feedback, v = String(f.v || "").replace(/[^a-z0-9-]/g, "").slice(0, 20);
      const rating = ["love", "ok", "no"].includes(f.rating) ? f.rating : null;
      if(!v || !rating) return H.err(res, 400, "رأي غير صالح");
      const tags = (Array.isArray(f.tags) ? f.tags : []).map(x => String(x).slice(0, 30)).slice(0, 8);
      const comment = String(f.comment || "").replace(/\s+/g, " ").trim().slice(0, 400);
      await db.pipeline([["HSET", "feedback:" + v, me.u, JSON.stringify({ rating, tags, comment, name: me.name, at: Date.now() })], ["HSET", "names", me.u, me.name]]);
      return H.ok(res, { ok: true, tally: await feedbackTally(v, me.u) });
    }
    /* فعاليات اليوم */
    if(b.quest !== undefined){ const r = await DL.claimQuest(me.u, String(b.quest)); return r.error ? H.err(res, 400, r.error) : H.ok(res, r); }
    if(b.wordleHint !== undefined){ const r = await DL.wordleHint(me.u, String(b.wordleHint)); return r.error ? H.err(res, 400, r.error) : H.ok(res, r); }
    if(b.wordle !== undefined){ const r = await DL.wordleGuess(me.u, b.wordle); return r.error ? H.err(res, 400, r.error) : H.ok(res, r); }
    if(b.family){ const r = await DL.claimFamily(me.u); return r.error ? H.err(res, 400, r.error) : H.ok(res, r); }
    const id = String(b.ack || "").slice(0, 60);
    const raw = id && await db.call("HGET", "notices:" + me.u, id);
    if(raw){ let n = null; try{ n = JSON.parse(raw); }catch(e){} if(n){ n.acked = Date.now(); await db.call("HSET", "notices:" + me.u, id, JSON.stringify(n)); } }
    return H.ok(res, { ok: true });
  }
  const q = H.query(req);
  /* ?log=<user>: سجل نقاط أي مشارك · ?recap=1: ملخص آخر ساعة ذهب */
  if(q.log !== undefined){
    const lg = await LG.userLog(String(q.log || me.u).slice(0, 40));
    return lg ? H.ok(res, lg) : H.err(res, 404, "المستخدم غير موجود");
  }
  if(q.feedback){ const v = String(q.feedback).replace(/[^a-z0-9-]/g, "").slice(0, 20); return H.ok(res, await feedbackTally(v, me.u)); }
  if(q.today){ const [quests, wordle, family] = await Promise.all([DL.questState(me.u), DL.wordleState(me.u), DL.familyState(me.u)]); return H.ok(res, { quests, wordle, family }); }
  if(q.wordle){ return H.ok(res, await DL.wordleState(me.u)); }
  if(q.recap){
    const win = RC.lastGolden(Date.now()); if(!win) return H.ok(res, { recap: null });
    const r = await RC.recap(win), active = r.list.filter(x => x.gained > 0), mine = r.list.find(x => x.u === me.u) || null;
    return H.ok(res, { recap: { id: r.id, key: r.key, title: r.title, start: r.start, end: r.end, mult: r.mult, players: active.length, top: active.slice(0, 5).map(x => ({ name: x.name, gained: x.gained, me: x.u === me.u })), me: mine } });
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
