/* فعاليات اليوم: مهام اليوم (٣ مهام بطابع اليوم + صندوق) · كلمة اليوم (مثل وردل) · هدف العائلة الأسبوعي
   كل التقدّم يُحسب في السيرفر من الجولات المسجّلة، ما نعتمد على الجوال */
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const db = require("./db");
const EV = require("../data/events.js");
const H = 3600e3, D = 24 * H, TZ = 3;

const dayStart = t => Math.floor((t + TZ * H) / D) * D - TZ * H;
const dowKSA = t => new Date(t + TZ * H).getUTCDay();
const hash = s => crypto.createHash("sha256").update(s).digest().readUInt32BE(0);

/* ---------- مهام اليوم ---------- */
const QUESTS = {
  correct20: { t: "جاوب ٢٠ سؤال صح", goal: 20, calc: r => r.reduce((a, x) => a + (x.score || 0), 0) },
  correct30: { t: "جاوب ٣٠ سؤال صح", goal: 30, calc: r => r.reduce((a, x) => a + (x.score || 0), 0) },
  new10: { t: "تعلّم ١٠ أسئلة جديدة", goal: 10, calc: r => r.reduce((a, x) => a + (x.base || 0), 0) },
  new15: { t: "تعلّم ١٥ سؤال جديد", goal: 15, calc: r => r.reduce((a, x) => a + (x.base || 0), 0) },
  new20: { t: "تعلّم ٢٠ سؤال جديد", goal: 20, calc: r => r.reduce((a, x) => a + (x.base || 0), 0) },
  perfect: { t: "جولة كاملة بدون ولا غلطة (٦ أسئلة أو أكثر)", goal: 1, calc: r => r.filter(x => !x.partial && x.total >= 6 && x.score === x.total).length },
  rounds4: { t: "خلّص ٤ جولات", goal: 4, calc: r => r.filter(x => !x.partial).length },
  story: { t: "خلّص قصة وجاوب أسئلتها (٦٠٪+)", goal: 1, href: "library.html", calc: r => r.filter(x => x.tag === "story" && x.score / x.total >= .6).length },
  gloss: { t: "اختبار كلمات قصة", goal: 1, href: "library.html", calc: r => r.filter(x => x.tag === "gloss").length },
  daily: { t: "حل «تحدي اليوم»", goal: 1, href: "general.html#/daily", calc: r => r.filter(x => x.tag === "daily").length },
  unit: { t: "اختبار وحدة (أي وحدة)", goal: 1, href: "general.html#/next", calc: r => r.filter(x => x.tag === "unit").length },
  golden: { t: "حل تحدي ساعة الذهب (٩–١٠ مساءً)", goal: 1, href: "general.html#/golden", calc: r => r.filter(x => x.golden).length },
  step: { t: "جولة تدريب STEP", goal: 1, href: "train.html", calc: r => r.filter(x => ["train", "grammar", "mix", "wrong", "challenge"].includes(x.mode)).length },
  wordle: { t: "حل «كلمة اليوم»", goal: 1, href: "general.html#/wordle", calc: (r, ctx) => ctx.wordleWon ? 1 : 0 },
  battle: { t: "العب معركة الكلمات", goal: 1, href: "general.html#/battle", calc: (r, ctx) => ctx.battlePlayed ? 1 : 0 }
};
/* طابع كل يوم (السبت = 6 ... الجمعة = 5) */
const THEMES = {
  6: { t: "سبت القصص", e: "", q: ["story", "gloss", "correct20"] },
  0: { t: "أحد الكلمات", e: "", q: ["wordle", "new15", "perfect"] },
  1: { t: "اثنين التحدي", e: "", q: ["daily", "correct30", "wordle"] },
  2: { t: "ثلاثاء الذهب", e: "", q: ["golden", "wordle", "rounds4"] },
  3: { t: "أربعاء الإنجاز", e: "", q: ["unit", "new20", "wordle"] },
  4: { t: "خميس STEP", e: "", q: ["step", "correct20", "daily"] },
  5: { t: "جمعة المعركة", e: "", q: ["battle", "wordle", "new10"] }
};
const QUEST_PTS = 3, CHEST_PTS = 6;

async function todayRounds(u, now){
  const from = dayStart(now);
  const raw = (await db.call("LRANGE", "results:" + u, 0, 199)) || [];
  const out = [];
  for(const s of raw){ let r; try{ r = JSON.parse(s); }catch(e){ continue; } if(r.at < from) break; out.push(r); }
  return out;
}
async function questState(u, now){
  now = now || Date.now();
  const date = EV.dateKey(now), theme = THEMES[dowKSA(now)];
  const [rounds, w, claimedFlat, battleScore] = await Promise.all([
    todayRounds(u, now), db.call("HGET", "wordle:" + date, u), db.call("HGETALL", `quest:${date}:${u}`), db.call("ZSCORE", "battle:" + date, u)
  ]);
  let wordleWon = false; try{ wordleWon = !!(w && JSON.parse(w).won); }catch(e){}
  const claimed = db.flatToObj(claimedFlat);
  const ctx = { wordleWon, battlePlayed: battleScore !== null && battleScore !== undefined };
  const quests = theme.q.map((k, i) => { const Q = QUESTS[k]; const p = Math.min(Q.goal, Q.calc(rounds, ctx)); return { i, key: k, t: Q.t, goal: Q.goal, progress: p, done: p >= Q.goal, claimed: !!claimed["q" + i], href: Q.href || null, pts: QUEST_PTS }; });
  return { date, theme: { t: theme.t, e: theme.e }, quests, chest: { pts: CHEST_PTS, ready: quests.every(q => q.claimed), claimed: !!claimed.chest } };
}
async function award(u, pts, key, notice){
  const wk = db.weekKey(), mk = EV.monthKey();
  const cmds = [["HINCRBY", "ptsx:" + u, key, pts], ["ZINCRBY", "lb:total", pts, u], ["ZINCRBY", "lb:week:" + wk, pts, u], ["ZINCRBY", "lb:month:" + mk, pts, u]];
  await db.pipeline(cmds);
  const tp = await db.call("ZSCORE", "lb:total", u);
  return Number(tp || 0);
}
async function claimQuest(u, which, now){
  const st = await questState(u, now);
  const key = `quest:${st.date}:${u}`;
  if(which === "chest"){
    if(!st.chest.ready) return { error: "خلّص المهام الثلاث أول" };
    const ok = await db.call("HSETNX", key, "chest", String(Date.now()));
    if(!(ok === 1 || ok === "1")) return { error: "استلمت الصندوق من قبل" };
    await db.call("EXPIRE", key, 3 * 86400);
    return { points: CHEST_PTS, total: await award(u, CHEST_PTS, "quests"), state: await questState(u, now) };
  }
  const q = st.quests[Number(which)]; if(!q) return { error: "مهمة غير موجودة" };
  if(!q.done) return { error: "المهمة لسا ما خلصت" };
  const ok = await db.call("HSETNX", key, "q" + q.i, String(Date.now()));
  if(!(ok === 1 || ok === "1")) return { error: "استلمتها من قبل" };
  await db.call("EXPIRE", key, 3 * 86400);
  return { points: QUEST_PTS, total: await award(u, QUEST_PTS, "quests"), state: await questState(u, now) };
}

/* ---------- كلمة اليوم ---------- */
let WORDS = null;
function wordList(){
  if(WORDS) return WORDS;
  const c = { window: {} }; vm.createContext(c);
  ["a1", "a2", "b1"].forEach(l => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "data", "general", "vocab-" + l + ".js"), "utf8"), c));
  const seen = new Map();
  (c.window.GEN_VOCAB || []).forEach(t => t.words.forEach(w => { const e = String(w[0]).toLowerCase(); if(/^[a-z]{5}$/.test(e) && !seen.has(e)) seen.set(e, { w: e, ar: w[1], ex: w[3] || "", exAr: w[4] || "", lvl: t.lvl, topic: t.t }); }));
  WORDS = [...seen.values()].sort((a, b) => a.w.localeCompare(b.w));
  return WORDS;
}
function answerFor(date){
  const L = wordList();
  const epoch = Math.round((Date.parse(date + "T00:00:00Z") - Date.parse("2026-09-01T00:00:00Z")) / D);
  /* ترتيب ثابت مخلوط، فما تتكرر كلمة إلا بعد ما تمر كل الكلمات */
  const order = L.map((x, i) => ({ i, h: hash("wordle-order|" + x.w) })).sort((a, b) => a.h - b.h).map(x => x.i);
  return L[order[((epoch % order.length) + order.length) % order.length]];
}
function feedback(guess, ans){
  const res = Array(5).fill("b"), left = {};
  for(let i = 0; i < 5; i++){ if(guess[i] === ans[i]) res[i] = "g"; else left[ans[i]] = (left[ans[i]] || 0) + 1; }
  for(let i = 0; i < 5; i++){ if(res[i] === "g") continue; if(left[guess[i]] > 0){ res[i] = "y"; left[guess[i]]--; } }
  return res.join("");
}
/* النقاط: ٧ − المحاولات − التلميحات المدفوعة (أقل شي ١) */
const WORDLE_PTS = (tries, paid) => Math.max(1, 7 - tries - (paid || 0));
const HINTS = ["first", "meaning", "example"];
const FREE_FIRST_AFTER = 3;
function hintData(ans, me){
  const used = new Set(me.hints || []), out = {};
  if(used.has("first") || (me.guesses || []).length >= FREE_FIRST_AFTER) out.first = ans.w[0].toUpperCase();
  if(used.has("meaning")) out.meaning = ans.ar;
  if(used.has("example")){
    const re = new RegExp("\\b" + ans.w + "\\b", "i");
    out.example = ans.ex && re.test(ans.ex) ? { en: ans.ex.replace(re, "_____"), ar: null } : { en: null, ar: ans.exAr || ans.ar };
  }
  return out;
}
async function wordleHint(u, which, now){
  now = now || Date.now();
  if(!HINTS.includes(which)) return { error: "تلميح غير معروف" };
  const date = EV.dateKey(now), key = "wordle:" + date;
  let me = { guesses: [], won: false, done: false, hints: [] }; const raw = await db.call("HGET", key, u); try{ if(raw) me = JSON.parse(raw); }catch(e){}
  me.hints = me.hints || [];
  if(me.done) return { error: "خلصت كلمة اليوم" };
  if(me.hints.includes(which)) return { state: await wordleState(u, now) };
  if(which === "first" && me.guesses.length >= FREE_FIRST_AFTER) return { state: await wordleState(u, now) }; /* صار مجاني */
  me.hints.push(which);
  await db.pipeline([["HSET", key, u, JSON.stringify(me)], ["EXPIRE", key, 8 * 86400]]);
  return { state: await wordleState(u, now) };
}
async function wordleState(u, now){
  now = now || Date.now();
  const date = EV.dateKey(now), ans = answerFor(date);
  const [mine, allFlat, names, ws] = await Promise.all([db.call("HGET", "wordle:" + date, u), db.call("HGETALL", "wordle:" + date), db.call("HGETALL", "names"), db.call("HGETALL", "wstreak:" + u)]);
  let me = { guesses: [], won: false, done: false }; try{ if(mine) me = JSON.parse(mine); }catch(e){}
  const N = db.flatToObj(names), st = db.flatToObj(ws);
  const family = Object.entries(db.flatToObj(allFlat)).map(([k, v]) => { try{ const x = JSON.parse(v); return { name: N[k] || k, me: k === u, tries: x.guesses.length, won: !!x.won, done: !!x.done, hints: (x.hints || []).length, grid: x.done ? x.guesses.map(g => g.fb) : null }; }catch(e){ return null; } }).filter(Boolean)
    .sort((a, b) => (b.won - a.won) || (a.tries - b.tries));
  return { date, len: 5, max: 6, guesses: me.guesses, won: me.won, done: me.done, points: me.points || 0,
    answer: me.done ? { w: ans.w, ar: ans.ar, ex: ans.ex, exAr: ans.exAr } : null,
    topic: ans.topic || null, lvl: ans.lvl || null,
    hints: me.hints || [], hintData: hintData(ans, me), freeFirstAfter: FREE_FIRST_AFTER,
    worth: me.done ? (me.points || 0) : WORDLE_PTS(me.guesses.length + 1, (me.hints || []).length),
    streak: Number(st.cur || 0), best: Number(st.best || 0), family };
}
async function wordleGuess(u, guess, now){
  now = now || Date.now();
  const g = String(guess || "").toLowerCase().trim();
  if(!/^[a-z]{5}$/.test(g)) return { error: "اكتب كلمة إنجليزية من ٥ حروف" };
  const date = EV.dateKey(now), ans = answerFor(date), key = "wordle:" + date;
  /* قفل بسيط ضد الضغط المزدوج */
  const lock = await db.call("SET", `wlock:${date}:${u}`, "1", "NX", "EX", 3);
  if(lock !== "OK") return { error: "لحظة…" };
  try{
    let me = { guesses: [], won: false, done: false }; const raw = await db.call("HGET", key, u); try{ if(raw) me = JSON.parse(raw); }catch(e){}
    if(me.done) return { error: "خلصت كلمة اليوم، تعال بكرة" };
    me.guesses.push({ w: g, fb: feedback(g, ans.w) });
    let gained = 0, total = null;
    if(g === ans.w){ me.won = true; me.done = true; }
    else if(me.guesses.length >= 6) me.done = true;
    if(me.won){
      const paid = (me.hints || []).length;
      gained = WORDLE_PTS(me.guesses.length, paid); me.points = gained;
      const st = db.flatToObj(await db.call("HGETALL", "wstreak:" + u)), yest = EV.dateKey(now - D);
      const cur = st.last === yest ? Number(st.cur || 0) + 1 : st.last === date ? Number(st.cur || 1) : 1;
      await db.call("HSET", "wstreak:" + u, "cur", cur, "best", Math.max(cur, Number(st.best || 0)), "last", date);
    }else if(me.done){ await db.call("HSET", "wstreak:" + u, "cur", 0); }
    await db.pipeline([["HSET", key, u, JSON.stringify(me)], ["EXPIRE", key, 8 * 86400]]);
    if(gained) total = await award(u, gained, "wordle");
    return { gained, total, state: await wordleState(u, now) };
  } finally { await db.call("DEL", `wlock:${date}:${u}`); }
}

/* ---------- هدف العائلة الأسبوعي ---------- */
const FAMILY_PER_PLAYER = 150, FAMILY_MIN_SHARE = 20, FAMILY_PTS = 15;
async function familyState(u, now){
  now = now || Date.now();
  const wk = db.weekKey(new Date(now));
  const users = (await db.call("SMEMBERS", "users")) || [];
  const names = db.flatToObj(await db.call("HGETALL", "names"));
  const res = await db.pipeline(users.map(x => ["LRANGE", "results:" + x, 0, 499]));
  const members = users.map((x, i) => {
    const got = (res[i] || []).map(s => { try{ return JSON.parse(s); }catch(e){ return null; } }).filter(r => r && db.weekKey(new Date(r.at)) === wk).reduce((a, r) => a + (r.base || 0), 0);
    return { u: x, name: names[x] || x, got };
  }).filter(m => m.got > 0).sort((a, b) => b.got - a.got);
  const target = FAMILY_PER_PLAYER * Math.max(2, members.length);
  const sum = members.reduce((a, m) => a + m.got, 0);
  const mine = members.find(m => m.u === u);
  const claimed = await db.call("SISMEMBER", "famgoal:" + wk, u);
  return { week: wk, target, sum, reached: sum >= target, pts: FAMILY_PTS, minShare: FAMILY_MIN_SHARE,
    members: members.map(m => ({ name: m.name, got: m.got, me: m.u === u })),
    mine: mine ? mine.got : 0, eligible: !!mine && mine.got >= FAMILY_MIN_SHARE, claimed: claimed === 1 || claimed === "1" };
}
async function claimFamily(u, now){
  const st = await familyState(u, now);
  if(!st.reached) return { error: "العائلة لسا ما وصلت الهدف" };
  if(!st.eligible) return { error: `تحتاج ${FAMILY_MIN_SHARE} سؤال جديد على الأقل هالأسبوع عشان تستلم` };
  const added = await db.call("SADD", "famgoal:" + st.week, u);
  if(!(added === 1 || added === "1")) return { error: "استلمتها من قبل" };
  return { points: FAMILY_PTS, total: await award(u, FAMILY_PTS, "family"), state: await familyState(u, now) };
}

module.exports = { questState, claimQuest, wordleState, wordleGuess, wordleHint, familyState, claimFamily, answerFor, feedback, wordList, THEMES, QUESTS };
