const crypto = require("crypto");
const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const P = require("../lib/push");
const EV = require("../data/events.js");
const RC = require("../lib/recap");
const DL = require("../lib/daily");

/* تذكير يومي واحد لكل مشترك (الساعة ٨ مساءً بتوقيت السعودية): الشعلة المهددة أولًا، ثم معركة الجمعة، ثم ساعة الذهب */
async function dailyJob(){
  const users = await db.call("SMEMBERS", "push:users") || [];
  const now = Date.now(), today = EV.dateKey(now), yest = EV.dateKey(now - 864e5);
  const riyadhDow = new Date(now + 3 * 3600e3).getUTCDay();
  let sent = 0;
  for(const u of users.slice(0, 200)){
    const [cur, last] = await db.call("HMGET", "streak:" + u, "cur", "last") || [];
    let msg;
    if(Number(cur) >= 2 && last === yest) msg = { title: ` شعلتك ${cur} أيام بتنطفي الليلة!`, body: "ادخل الحين وحافظ على سلسلتك، دقيقة وحدة تكفي.", url: "/general.html#/next", tag: "streak" };
    else if(await (async () => { try{ const qs = await DL.questState(u, now), w = await DL.wordleState(u, now); const left = qs.quests.filter(x => !x.done).length; if(!left && w.done) return false; msg = { title: `${qs.theme.e} ${qs.theme.t}: باقي لك ${left ? `${left} من مهام اليوم` : "كلمة اليوم"}`, body: `${left ? qs.quests.filter(x => !x.done).map(x => x.t).join(" · ") : ""}${!w.done ? (left ? " · " : "") + "وكلمة اليوم تنتظرك " : ""}، والصندوق +${qs.chest.pts} لو خلصتها كلها`, url: "/general.html#/today", tag: "quests" }; return true; }catch(e){ return false; } })()){ /* تم */ }
    else if(riyadhDow === 5) msg = { title: " معركة الكلمات قائمة الحين", body: "٦٠ ثانية بنفس الكلمات للجميع، والأول يكسب +٣٠ نقطة. تنتهي الساعة ١٠.", url: "/general.html#/battle", tag: "battle" };
    else if(last !== today) msg = { title: " تحدي ساعة الذهب الساعة ٩ مساءً", body: "٢٠ سؤال جديد على مستواك، كل سؤال بنقطتين، مرة واحدة باليوم!", url: "/general.html#/golden", tag: "golden" };
    if(!msg) continue;
    const r = await P.sendToUser(u, msg); sent += r.sent || 0;
  }
  return { users: users.length, sent };
}

/* بعد ساعة الذهب: تبريكات لكل مشترك جمع نقاط، مع كم ارتفع */
async function recapJob(){
  const win = RC.lastGolden(Date.now()); if(!win) return { sent: 0, reason: "no-window" };
  const r = await RC.recap(win);
  const users = (await db.call("SMEMBERS", "push:users")) || [];
  let sent = 0;
  for(const u of users.slice(0, 200)){
    const m = r.list.find(x => x.u === u); if(!m || !m.gained) continue;
    const top = r.list[0];
    const body = `ارتفع مجموعك من ${m.before} إلى ${m.after}${m.rankAfter ? ` · ترتيبك #${m.rankAfter}` : ""}${top && top.u !== u ? ` · الأكثر تجميعًا: ${top.name} +${top.gained}` : " · أنت الأكثر تجميعًا الليلة "}`;
    const rr = await P.sendToUser(u, { title: ` جمعت +${m.gained} في ساعة الذهب!`, body, url: "/compete.html", tag: "recap" });
    sent += rr.sent || 0;
  }
  return { sent, players: r.list.filter(x => x.gained > 0).length };
}

module.exports = H.handler(["GET", "POST"], async (req, res) => {
  const q = H.query(req);
  if(req.method === "GET"){
    if(q.cron){
      /* يشغّله Vercel Cron فقط: لازم المفتاح السري */
      const want = process.env.CRON_SECRET || "", got = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      const okSecret = want && got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
      if(!okSecret) return H.err(res, 401, "غير مصرّح");
      return H.ok(res, q.cron === "recap" ? await recapJob() : await dailyJob());
    }
    return H.ok(res, { key: P.publicKey(), enabled: P.enabled() });
  }
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  const b = await H.body(req);
  if(b.action === "subscribe"){
    if(!P.enabled()) return H.err(res, 503, "الإشعارات غير مفعّلة على الخادم");
    const ok = await P.addSub(me.u, b.sub);
    if(!ok) return H.err(res, 400, "اشتراك غير صالح");
    return H.ok(res, { ok: true });
  }
  if(b.action === "unsubscribe"){ await P.removeSub(me.u, b.endpoint); return H.ok(res, { ok: true }); }
  if(b.action === "test"){
    /* إشعار تجربة لنفس الشخص فقط، مرة كل دقيقة */
    const lock = await db.call("SET", "pushtest:" + me.u, "1", "NX", "EX", 60);
    if(lock !== "OK") return H.err(res, 429, "انتظر دقيقة قبل التجربة مرة ثانية");
    const r = await P.sendToUser(me.u, { title: " الإشعارات شغّالة!", body: `أهلًا ${me.name}، بنذكّرك بالفعاليات وشعلتك اليومية.`, url: "/general.html", tag: "test" });
    return H.ok(res, r);
  }
  return H.err(res, 400, "طلب غير معروف");
});
