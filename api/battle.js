const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");
const P = require("../lib/push");

/* معركة الكلمات: لوحة أفضل نتيجة لكل لاعب في كل معركة، وتوزيع الجوائز تلقائيًا بعد انتهائها */
async function awardIfNeeded(win){
  if(!win) return null;
  const B = EV.CONFIG.battle, key = "battle:" + win.key;
  const flat = await db.call("ZREVRANGE", key, 0, B.prizes.length - 1, "WITHSCORES");
  const top = db.flatToPairs(flat).filter(x => x.score > 0);
  const names = top.length ? db.flatToObj(await db.call("HGETALL", "names")) : {};
  const winners = top.map((x, i) => ({ rank: i + 1, u: x.member, name: names[x.member] || x.member, score: x.score, prize: B.prizes[i] }));
  if(!top.length) return { key: win.key, winners };
  const lock = await db.call("SET", key + ":awarded", String(Date.now()), "NX");
  if(lock === "OK"){
    const wk = db.weekKey(win.start), mk = EV.monthKey(win.start);
    const cmds = [];
    winners.forEach(w => {
      cmds.push(["ZINCRBY", "lb:total", w.prize, w.u], ["ZINCRBY", "lb:week:" + wk, w.prize, w.u], ["ZINCRBY", "lb:month:" + mk, w.prize, w.u]);
      cmds.push(["HINCRBY", "ptsx:" + w.u, "battle", w.prize]);
      cmds.push(["HSET", "notices:" + w.u, "battle-" + win.key, JSON.stringify({ id: "battle-" + win.key, kind: "prize", at: Date.now(), points: w.prize,
        title: `مبروك! المركز ${w.rank} في معركة الكلمات`, msg: `نتيجتك ${w.score} في معركة ${win.key}. أُضيفت لك جائزة +${w.prize} نقطة.` })]);
    });
    await db.pipeline(cmds);
    for(const w of winners){ try{ await P.sendToUser(w.u, { title: `🏆 مبروك! المركز ${w.rank} في معركة الكلمات`, body: `أُضيفت لك +${w.prize} نقطة. ادخل وشوف ترتيبك.`, url: "/compete.html", tag: "battle-prize" }); }catch(e){} }
  }
  return { key: win.key, winners };
}

module.exports = H.handler(["GET", "POST"], async (req, res) => {
  const me = A.getUser(req);
  const now = Date.now();
  const bw = EV.battleWindows(now);
  if(req.method === "POST"){
    if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
    if(!bw.active) return H.err(res, 400, "المعركة ليست قائمة الآن");
    const b = await H.body(req);
    const score = Math.max(0, Math.min(200, Math.floor(Number(b.score) || 0)));
    const key = "battle:" + bw.active.key;
    const prev = Number(await db.call("ZSCORE", key, me.u) || -1);
    if(score > prev) await db.pipeline([["ZADD", key, score, me.u], ["HSET", "names", me.u, me.name]]);
    else await db.call("HSET", "names", me.u, me.name);
  }
  const last = await awardIfNeeded(bw.last);
  const cur = bw.active || bw.next;
  let board = [], mine = null;
  if(bw.active){
    const key = "battle:" + bw.active.key;
    const [flat, namesFlat, myScore, myRank] = await db.pipeline([["ZREVRANGE", key, 0, 9, "WITHSCORES"], ["HGETALL", "names"], ["ZSCORE", key, me ? me.u : "-"], ["ZREVRANK", key, me ? me.u : "-"]]);
    const names = db.flatToObj(namesFlat);
    board = db.flatToPairs(flat).map((x, i) => ({ rank: i + 1, name: names[x.member] || x.member, score: x.score, me: !!me && me.u === x.member }));
    if(me && myScore !== null && myScore !== undefined) mine = { score: Number(myScore), rank: Number(myRank) + 1 };
  }
  H.ok(res, { config: EV.CONFIG.battle, active: bw.active, next: bw.next, board, mine, last, seed: cur ? cur.key : null, now });
});
