const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");

module.exports = H.handler(["GET"], async (req, res) => {
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  const wk = db.weekKey(), ev = EV.status(), mk = ev.tournament.key || EV.monthKey();
  const [stats, total, week, rank, wrank, results, month, mrank, earned] = await db.pipeline([
    ["GET", "stats:" + me.u], ["ZSCORE", "lb:total", me.u], ["ZSCORE", "lb:week:" + wk, me.u],
    ["ZREVRANK", "lb:total", me.u], ["ZREVRANK", "lb:week:" + wk, me.u], ["LRANGE", "results:" + me.u, 0, 14],
    ["ZSCORE", "lb:month:" + mk, me.u], ["ZREVRANK", "lb:month:" + mk, me.u], ["SCARD", "earned:" + me.u]
  ]);
  H.ok(res, {
    user: { u: me.u, name: me.name },
    stats: stats ? JSON.parse(stats) : { quizzes: 0, correct: 0, answered: 0, best: 0, last: null },
    points: Number(total || 0), weekPoints: Number(week || 0),
    rank: rank === null || rank === undefined ? null : Number(rank) + 1,
    weekRank: wrank === null || wrank === undefined ? null : Number(wrank) + 1,
    gift: EV.giftFor(me), week: wk, month: mk, monthPoints: Number(month || 0), monthRank: mrank === null || mrank === undefined ? null : Number(mrank) + 1, earned: Number(earned || 0), events: ev,
    results: (results || []).map(r => { try{ return JSON.parse(r); }catch(e){ return null; } }).filter(Boolean)
  });
});
