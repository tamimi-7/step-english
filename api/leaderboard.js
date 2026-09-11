const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const EV = require("../data/events.js");

module.exports = H.handler(["GET"], async (req, res) => {
  const me = A.getUser(req);
  const wk = db.weekKey();
  const ev = EV.status();
  const mk = ev.tournament.key || EV.monthKey();
  const [totalFlat, weekFlat, monthFlat, namesFlat, nUsers] = await db.pipeline([
    ["ZREVRANGE", "lb:total", 0, 29, "WITHSCORES"], ["ZREVRANGE", "lb:week:" + wk, 0, 29, "WITHSCORES"], ["ZREVRANGE", "lb:month:" + mk, 0, 29, "WITHSCORES"], ["HGETALL", "names"], ["SCARD", "users"]
  ]);
  const names = db.flatToObj(namesFlat);
  const total = db.flatToPairs(totalFlat), week = db.flatToPairs(weekFlat), month = db.flatToPairs(monthFlat);
  const statsRaw = total.length ? await db.pipeline(total.map(r => ["GET", "stats:" + r.member])) : [];
  const rows = total.map((r, i) => {
    let s = null; try{ s = JSON.parse(statsRaw[i]); }catch(e){}
    return { rank: i + 1, u: r.member, name: names[r.member] || r.member, points: r.score, quizzes: s ? s.quizzes : 0, avg: s && s.answered ? Math.round(s.correct / s.answered * 100) : 0, best: s ? s.best : 0, me: me && me.u === r.member };
  });
  const simple = list => list.map((r, i) => ({ rank: i + 1, u: r.member, name: names[r.member] || r.member, points: r.score, me: me && me.u === r.member }));
  H.ok(res, { week: wk, month: mk, users: Number(nUsers || 0), total: rows, weekly: simple(week), monthly: simple(month), events: ev });
});
