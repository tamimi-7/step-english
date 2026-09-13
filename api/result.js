const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");
const AR = require("../lib/areas");
const VAL = require("../lib/validids");
const MODES = ["grammar", "vocab", "reading", "mix", "wrong", "challenge", "train", "general"];
const ID_RE = /^[\x21-\x7e؀-ۿ]{1,80}$/;
const UNIT_RE = /^u\d{1,3}$/;

function sortBoard(obj){
  return Object.entries(obj).map(([u, v]) => { try{ return { u, ...JSON.parse(v) }; }catch(e){ return null; } }).filter(Boolean)
    .sort((a, b) => (b.score / b.total) - (a.score / a.total) || a.seconds - b.seconds || a.at - b.at)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

/* الهدية الشخصية: مدتها تبدأ من أول مرة يطلبها صاحبها */
async function giftState(me){
  const g0 = EV.giftFor(me); if(!g0) return null;
  const key = `giftstart:${g0.id}:${me.u}`;
  await db.call("SET", key, String(Date.now()), "NX");
  const st = Number(await db.call("GET", key)) || Date.now();
  return EV.giftFor(me, Date.now(), st);
}

/* قاعدة النقاط (شفافة وثابتة):
   - كل سؤال يعطي نقطة واحدة فقط، أول مرة تجيبه صح. الإعادة لا تكرر النقاط.
   - ساعة الذهب أو هدية شخصية: الإجابات الجديدة بنقطتين (المضاعف لا يتراكم).
   - إتمام مرحلة (اجتياز اختبار الوحدة لأول مرة): +10 مرة واحدة.
   كل نقطة تُسجَّل في منطقتها (ptsa) أو في بند إضافي مسمّى (ptsx)، فيطابق المجموعُ التفصيلَ دائمًا. */
module.exports = H.handler(["GET", "POST"], async (req, res) => {
  if(req.method === "GET") return H.ok(res, { validator: VAL.status() });
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  const b = await H.body(req);
  const total = Math.floor(Number(b.total)), score = Math.floor(Number(b.score)), seconds = Math.max(0, Math.floor(Number(b.seconds) || 0));
  const mode = MODES.includes(b.mode) ? b.mode : "mix";
  if(!(total >= 1 && total <= 200) || !(score >= 0 && score <= total)) return H.err(res, 400, "نتيجة غير صالحة");
  const challengeId = b.challenge ? String(b.challenge).replace(/[^a-z0-9]/gi, "").slice(0, 12) : null;
  const rawIds = [...new Set((Array.isArray(b.ids) ? b.ids : []).map(x => String(x)).filter(x => ID_RE.test(x)))];
  /* أسئلة غير موجودة في محتوى الموقع ما تعطي نقاط */
  const ids = rawIds.filter(VAL.isValid).slice(0, Math.min(score, 200));
  const rejected = rawIds.length - rawIds.filter(VAL.isValid).length;
  const unit = b.unit && UNIT_RE.test(String(b.unit)) ? String(b.unit) : null;
  const ev = EV.status();
  const gift = await giftState(me);
  const giftMult = gift ? gift.mult : 1;
  const mult = Math.max(ev.mult, giftMult);
  const bonusSource = mult > 1 ? (giftMult >= ev.mult && gift ? "gift" : "events") : null;
  const bonusLabel = bonusSource === "gift" ? gift.title : bonusSource === "events" ? (ev.active[0] || {}).title : null;
  const wk = db.weekKey(), mk = EV.monthKey();
  const at = Date.now();

  let challengeBoard = null, already = false, challenge = null;
  if(challengeId){
    challenge = await db.getJSON("challenge:" + challengeId);
    if(!challenge) return H.err(res, 404, "التحدي غير موجود");
    const added = await db.call("HSETNX", "challenge:" + challengeId + ":res", me.u, JSON.stringify({ score, total, seconds, at, name: me.name }));
    already = added === 0 || added === "0";
  }

  let newIds = [], bonus = 0, stage = null, points = 0;
  let stats = (await db.getJSON("stats:" + me.u)) || { quizzes: 0, correct: 0, answered: 0, best: 0, last: null };
  if(!already){
    if(mode !== "wrong" && ids.length){
      const seen = await db.pipeline(ids.map(id => ["SISMEMBER", "earned:" + me.u, id]));
      newIds = ids.filter((id, i) => !(seen[i] === 1 || seen[i] === "1"));
      if(newIds.length) await db.call("SADD", "earned:" + me.u, ...newIds);
    }
    bonus = newIds.length * (mult - 1);
    if(unit && total >= 8 && score / total >= 0.7){
      const added = await db.call("SADD", "stages:" + me.u, unit);
      if(added === 1 || added === "1") stage = { unit, points: AR.STAGE_POINTS };
    }
    points = newIds.length + bonus + (stage ? stage.points : 0);
    stats.quizzes += 1; stats.correct += score; stats.answered += total;
    stats.best = Math.max(stats.best || 0, Math.round(score / total * 100)); stats.last = at;
    const rec = { mode, score, total, seconds, at, challenge: challengeId, points, base: newIds.length, bonus, mult, stage: stage ? stage.unit : null };
    const cmds = [
      ["LPUSH", "results:" + me.u, JSON.stringify(rec)], ["LTRIM", "results:" + me.u, 0, 49],
      ["SET", "stats:" + me.u, JSON.stringify(stats)], ["HSET", "names", me.u, me.name]
    ];
    const byArea = {}; newIds.forEach(id => { const k = AR.areaOf(id); byArea[k] = (byArea[k] || 0) + 1; });
    Object.entries(byArea).forEach(([k, n]) => cmds.push(["HINCRBY", "ptsa:" + me.u, k, n]));
    if(bonus) cmds.push(["HINCRBY", "ptsx:" + me.u, bonusSource, bonus]);
    if(stage) cmds.push(["HINCRBY", "ptsx:" + me.u, "stages", stage.points]);
    if(points > 0){ cmds.push(["ZINCRBY", "lb:total", points, me.u]); cmds.push(["ZINCRBY", "lb:week:" + wk, points, me.u]); cmds.push(["ZINCRBY", "lb:month:" + mk, points, me.u]); }
    else { cmds.push(["ZINCRBY", "lb:total", 0, me.u]); }
    await db.pipeline(cmds);
  }
  if(challengeId) challengeBoard = sortBoard(db.flatToObj(await db.call("HGETALL", "challenge:" + challengeId + ":res")));
  const [tp, wp, mp, rank, wrank, mrank] = await db.pipeline([
    ["ZSCORE", "lb:total", me.u], ["ZSCORE", "lb:week:" + wk, me.u], ["ZSCORE", "lb:month:" + mk, me.u],
    ["ZREVRANK", "lb:total", me.u], ["ZREVRANK", "lb:week:" + wk, me.u], ["ZREVRANK", "lb:month:" + mk, me.u]
  ]);
  const rk = v => v === null || v === undefined ? null : Number(v) + 1;
  H.ok(res, {
    saved: !already, already, rejected, points, base: newIds.length, bonus, bonusSource, bonusLabel, stage,
    newCount: newIds.length, repeated: Math.max(0, ids.length - newIds.length), mult,
    gift: gift ? { id: gift.id, title: gift.title, mult: gift.mult, endsAt: gift.endsAt } : null, activeEvents: ev.active,
    totalPoints: Number(tp || 0), weekPoints: Number(wp || 0), monthPoints: Number(mp || 0),
    rank: rk(rank), weekRank: rk(wrank), monthRank: rk(mrank),
    stats, challenge: challenge ? { id: challenge.id, title: challenge.title } : null, challengeBoard
  });
});
