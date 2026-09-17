const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");
const AR = require("../lib/areas");
const VAL = require("../lib/validids");
const RC = require("../lib/recap");
const MODES = ["grammar", "vocab", "reading", "mix", "wrong", "challenge", "train", "general"];
/* مكافأة المراجعة: كل ٤ إجابات صحيحة على أسئلة سبق أخذت نقاطها = نقطة، بحد يومي حتى ما تصير مزرعة نقاط */
const REVIEW_PER = 4, REVIEW_DAILY_CAP = 10;
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
  let ids = rawIds.filter(VAL.isValid).slice(0, Math.min(score, 200));
  let rejected = rawIds.length - rawIds.filter(VAL.isValid).length;
  const unit = b.unit && UNIT_RE.test(String(b.unit)) ? String(b.unit) : null;
  const story = b.story && /^[a-z0-9-]{1,40}$/.test(String(b.story)) ? String(b.story) : null;
  const TAGS = ["daily", "unit", "story", "gloss", "practice", "review", "golden", "game", "roleplay", "verbs"];
  let tag = TAGS.includes(b.tag) ? b.tag : null; if(!tag && unit) tag = "unit"; if(!tag && story) tag = "story";
  const ev = EV.status();
  const gift = await giftState(me);
  const giftMult = gift ? gift.mult : 1;
  let mult = 1, bonusSource = null, bonusLabel = null;
  const wk = db.weekKey(), mk = EV.monthKey();
  const at = Date.now();
  /* أسئلة تحدي ساعة الذهب (gh-تاريخ-رقم): تُقبل بتاريخ اليوم وأثناء الساعة فقط (+٥ دقائق سماح للي خلص آخر لحظة) */
  const gActive = ev.active.some(a => a.id === "golden"), lg = RC.lastGolden(at), gGrace = !!lg && at - lg.end < 5 * 60e3;
  const gOk = id => { const m = id.match(/^gh-(\d{4}-\d{2}-\d{2})-\d+$/); return !m || (m[1] === EV.dateKey(at) && (gActive || gGrace)); };
  rejected += ids.filter(id => !gOk(id)).length; ids = ids.filter(gOk);
  const evMult = gActive ? ev.mult : gGrace ? (lg.mult || 2) : 1; /* المضاعفة تشمل دقائق السماح */

  let challengeBoard = null, already = false, challenge = null;
  if(challengeId){
    challenge = await db.getJSON("challenge:" + challengeId);
    if(!challenge) return H.err(res, 404, "التحدي غير موجود");
    const added = await db.call("HSETNX", "challenge:" + challengeId + ":res", me.u, JSON.stringify({ score, total, seconds, at, name: me.name }));
    already = added === 0 || added === "0";
  }

  let newIds = [], bonus = 0, stage = null, storyBonus = null, points = 0, repeatedAt = null, wordRepeats = 0, review = null;
  let stats = (await db.getJSON("stats:" + me.u)) || { quizzes: 0, correct: 0, answered: 0, best: 0, last: null };
  if(!already){
    if(ids.length){
      const seen = await db.pipeline(ids.map(id => ["SISMEMBER", "earned:" + me.u, id]));
      let fresh = ids.filter((id, i) => !(seen[i] === 1 || seen[i] === "1"));
      /* الكلمة تنحسب مرة وحدة في العمر، حتى لو جت في المفردات وكلمات القصص و«كلماتي» */
      const keys = fresh.map(id => VAL.wordKey(id));
      const withWord = keys.map((k, i) => k ? { k, id: fresh[i] } : null).filter(Boolean);
      if(withWord.length){
        const dup = await db.pipeline(withWord.map(x => ["SISMEMBER", "earnedw:" + me.u, x.k]));
        const paidWord = new Set(); const drop = new Set();
        withWord.forEach((x, i) => { if(dup[i] === 1 || dup[i] === "1" || paidWord.has(x.k)) drop.add(x.id); else paidWord.add(x.k); });
        wordRepeats = drop.size;
        fresh = fresh.filter(id => !drop.has(id));
        if(paidWord.size) await db.call("SADD", "earnedw:" + me.u, ...paidWord);
      }
      newIds = fresh;
      if(newIds.length) await db.pipeline([["SADD", "earned:" + me.u, ...newIds], ["HSET", "earnedat:" + me.u, ...newIds.flatMap(id => [id, String(at)])]]);
      /* الأسئلة المكررة: متى أخذت نقطتها من قبل (للشفافية) */
      const rep = ids.filter(id => !newIds.includes(id));
      if(rep.length){ const ts = await db.call("HMGET", "earnedat:" + me.u, ...rep.slice(0, 50)); repeatedAt = Math.max(0, ...(ts || []).map(x => Number(x) || 0)) || null; }
    }
    /* المضاعفة: الهدية الشخصية تغطي كل الأسئلة، وساعة الذهب أسئلة تحديها فقط — وما تتراكم */
    const goldenNew = newIds.filter(id => id.startsWith("gh-")).length;
    const giftBonus = giftMult > 1 ? newIds.length * (giftMult - 1) : 0, evBonus = evMult > 1 ? goldenNew * (evMult - 1) : 0;
    bonus = Math.max(giftBonus, evBonus);
    if(bonus){ bonusSource = giftBonus >= evBonus ? "gift" : "events"; mult = bonusSource === "gift" ? giftMult : evMult; bonusLabel = bonusSource === "gift" ? gift.title : (ev.active.find(a => a.id === "golden") || {}).title || "ساعة الذهب"; }
    if(unit && total >= 8 && score / total >= 0.7){
      const added = await db.call("SADD", "stages:" + me.u, unit);
      if(added === 1 || added === "1") stage = { unit, points: AR.STAGE_POINTS };
    }
    /* مكافأة إتمام القصة: مرة واحدة لكل قصة، عند النجاح في أسئلة الفهم */
    if(story && total >= 3 && score / total >= 0.6){
      const info = VAL.storyInfo(story);
      if(info){ const added = await db.call("SADD", "storydone:" + me.u, story); if(added === 1 || added === "1") storyBonus = { id: story, points: AR.STORY_POINTS[info.lvl] || 6 }; }
    }
    /* المراجعة تستاهل: الأسئلة اللي جاوبتها صح وسبق أخذت نقاطها تعطي نقطة لكل ٤، بحد ١٠ نقاط في اليوم */
    const reviewCorrect = Math.max(0, ids.length - newIds.length);
    if(reviewCorrect >= REVIEW_PER){
      const rk = "rev:" + EV.dateKey(at) + ":" + me.u;
      const used = Number(await db.call("GET", rk)) || 0;
      const pts = Math.max(0, Math.min(Math.floor(reviewCorrect / REVIEW_PER), REVIEW_DAILY_CAP - used));
      if(pts){
        await db.pipeline([["INCRBY", rk, pts], ["EXPIRE", rk, 8 * 86400]]);
        review = { points: pts, questions: reviewCorrect, left: Math.max(0, REVIEW_DAILY_CAP - used - pts) };
      }else if(used >= REVIEW_DAILY_CAP) review = { points: 0, questions: reviewCorrect, left: 0, capped: true };
    }
    points = newIds.length + bonus + (stage ? stage.points : 0) + (storyBonus ? storyBonus.points : 0) + (review ? review.points : 0);
    const partial = !!b.partial;
    if(!partial){ stats.quizzes += 1; stats.correct += score; stats.answered += total; }
    if(!partial) stats.best = Math.max(stats.best || 0, Math.round(score / total * 100)); stats.last = at;
    const rec = { mode, partial: partial || undefined, score, total, seconds, at, challenge: challengeId, points, base: newIds.length, bonus, mult, stage: stage ? stage.unit : null, story: storyBonus ? storyBonus.id : null, review: review && review.points ? review.points : undefined, tag: tag || undefined, golden: ids.some(id => id.startsWith("gh-")) || undefined };
    const cmds = [
      ["LPUSH", "results:" + me.u, JSON.stringify(rec)], ["LTRIM", "results:" + me.u, 0, 499],
      ["SET", "stats:" + me.u, JSON.stringify(stats)], ["HSET", "names", me.u, me.name]
    ];
    const byArea = {}; newIds.forEach(id => { const k = AR.areaOf(id); byArea[k] = (byArea[k] || 0) + 1; });
    Object.entries(byArea).forEach(([k, n]) => cmds.push(["HINCRBY", "ptsa:" + me.u, k, n]));
    if(bonus) cmds.push(["HINCRBY", "ptsx:" + me.u, bonusSource, bonus]);
    if(stage) cmds.push(["HINCRBY", "ptsx:" + me.u, "stages", stage.points]);
    if(storyBonus) cmds.push(["HINCRBY", "ptsx:" + me.u, "storybonus", storyBonus.points]);
    if(review && review.points) cmds.push(["HINCRBY", "ptsx:" + me.u, "review", review.points]);
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
    saved: !already, already, rejected, repeatedAt, wordRepeats, review, points, base: newIds.length, bonus, bonusSource, bonusLabel, stage, storyBonus,
    newCount: newIds.length, repeated: Math.max(0, ids.length - newIds.length), mult,
    gift: gift ? { id: gift.id, title: gift.title, mult: gift.mult, endsAt: gift.endsAt } : null, activeEvents: ev.active,
    totalPoints: Number(tp || 0), weekPoints: Number(wp || 0), monthPoints: Number(mp || 0),
    rank: rk(rank), weekRank: rk(wrank), monthRank: rk(mrank),
    stats, challenge: challenge ? { id: challenge.id, title: challenge.title } : null, challengeBoard
  });
});
