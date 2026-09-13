const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");
const MODES = ["grammar", "vocab", "reading", "mix", "wrong", "challenge", "train", "general"];
const ID_RE = /^[\x21-\x7e؀-ۿ]{1,80}$/;

function sortBoard(obj){
  return Object.entries(obj).map(([u, v]) => { try{ return { u, ...JSON.parse(v) }; }catch(e){ return null; } }).filter(Boolean)
    .sort((a, b) => (b.score / b.total) - (a.score / a.total) || a.seconds - b.seconds || a.at - b.at)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

/* قاعدة النقاط: كل سؤال يعطي نقطته مرة واحدة فقط (أول مرة تجيبه صح).
   إعادة الاختبار تعطيك نقاط الأسئلة التي لم تصبها من قبل فقط — لا تكرار للنقاط.
   الفعاليات (data/events.js) تضاعف النقاط الجديدة فقط. */
module.exports = H.handler(["POST"], async (req, res) => {
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  const b = await H.body(req);
  const total = Math.floor(Number(b.total)), score = Math.floor(Number(b.score)), seconds = Math.max(0, Math.floor(Number(b.seconds) || 0));
  const mode = MODES.includes(b.mode) ? b.mode : "mix";
  if(!(total >= 1 && total <= 200) || !(score >= 0 && score <= total)) return H.err(res, 400, "نتيجة غير صالحة");
  const challengeId = b.challenge ? String(b.challenge).replace(/[^a-z0-9]/gi, "").slice(0, 12) : null;
  // معرفات الأسئلة التي أُجيبت صحيحًا في هذه الجولة (بدونها لا نقاط)
  const ids = [...new Set((Array.isArray(b.ids) ? b.ids : []).map(x => String(x)).filter(x => ID_RE.test(x)))].slice(0, Math.min(score, 200));
  const ev = EV.status();
  const gift = EV.giftFor(me);
  const mult = Math.max(ev.mult, gift ? gift.mult : 1);
  const wk = db.weekKey(), mk = EV.monthKey();
  const at = Date.now();

  let challengeBoard = null, already = false, challenge = null;
  if(challengeId){
    challenge = await db.getJSON("challenge:" + challengeId);
    if(!challenge) return H.err(res, 404, "التحدي غير موجود");
    const added = await db.call("HSETNX", "challenge:" + challengeId + ":res", me.u, JSON.stringify({ score, total, seconds, at, name: me.name }));
    already = added === 0 || added === "0";
  }

  let newCount = 0, points = 0;
  let stats = (await db.getJSON("stats:" + me.u)) || { quizzes: 0, correct: 0, answered: 0, best: 0, last: null };
  if(!already){
    if(mode !== "wrong" && ids.length){ newCount = Number(await db.call("SADD", "earned:" + me.u, ...ids)) || 0; }
    points = newCount * mult;
    stats.quizzes += 1; stats.correct += score; stats.answered += total;
    stats.best = Math.max(stats.best || 0, Math.round(score / total * 100)); stats.last = at;
    const rec = { mode, score, total, seconds, at, challenge: challengeId, points, mult };
    const cmds = [
      ["LPUSH", "results:" + me.u, JSON.stringify(rec)], ["LTRIM", "results:" + me.u, 0, 49],
      ["SET", "stats:" + me.u, JSON.stringify(stats)], ["HSET", "names", me.u, me.name]
    ];
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
    saved: !already, already, points, newCount, repeated: Math.max(0, ids.length - newCount), mult, gift: gift ? { id: gift.id, title: gift.title, mult: gift.mult } : null, activeEvents: ev.active,
    totalPoints: Number(tp || 0), weekPoints: Number(wp || 0), monthPoints: Number(mp || 0),
    rank: rk(rank), weekRank: rk(wrank), monthRank: rk(mrank),
    stats, challenge: challenge ? { id: challenge.id, title: challenge.title } : null, challengeBoard
  });
});
