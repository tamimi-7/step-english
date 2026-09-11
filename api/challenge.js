const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");

module.exports = H.handler(["GET"], async (req, res) => {
  const me = A.getUser(req);
  const id = String(H.query(req).id || "").replace(/[^a-z0-9]/gi, "").slice(0, 12);
  if(!id) return H.err(res, 400, "رقم التحدي مطلوب");
  const c = await db.getJSON("challenge:" + id);
  if(!c) return H.err(res, 404, "التحدي غير موجود");
  const resFlat = await db.call("HGETALL", "challenge:" + id + ":res");
  const obj = db.flatToObj(resFlat);
  const board = Object.entries(obj).map(([u, v]) => { try{ return { u, ...JSON.parse(v) }; }catch(e){ return null; } }).filter(Boolean)
    .sort((a, b) => (b.score / b.total) - (a.score / a.total) || a.seconds - b.seconds || a.at - b.at)
    .map((r, i) => ({ rank: i + 1, ...r, me: me && me.u === r.u }));
  H.ok(res, { challenge: c, board, mine: me ? board.find(r => r.u === me.u) || null : null });
});
