const crypto = require("crypto");
const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");
const MODES = ["grammar", "vocab", "reading", "mix"];

module.exports = H.handler(["GET", "POST"], async (req, res) => {
  if(req.method === "GET"){
    const me = A.getUser(req);
    const ids = await db.call("LRANGE", "challenges", 0, 39);
    if(!ids.length) return H.ok(res, { challenges: [] });
    const raws = await db.pipeline(ids.map(id => ["GET", "challenge:" + id]));
    const counts = await db.pipeline(ids.map(id => ["HLEN", "challenge:" + id + ":res"]));
    const mine = me ? await db.pipeline(ids.map(id => ["HGET", "challenge:" + id + ":res", me.u])) : [];
    const list = raws.map((r, i) => { try{ const c = JSON.parse(r); return { id: c.id, title: c.title, by: c.by, byName: c.byName, mode: c.mode, topic: c.topic, count: c.qids.length, timed: c.timed, created: c.created, participants: Number(counts[i] || 0), done: !!(mine[i]) }; }catch(e){ return null; } }).filter(Boolean);
    return H.ok(res, { challenges: list });
  }
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  const b = await H.body(req);
  const title = String(b.title || "").trim().slice(0, 40) || "تحدي " + me.name;
  const mode = MODES.includes(b.mode) ? b.mode : "mix";
  const topic = String(b.topic || "all").replace(/[^a-z]/gi, "").slice(0, 20) || "all";
  const qids = Array.isArray(b.qids) ? b.qids.map(x => String(x)).filter(x => /^[\p{L}\p{N}\-_ ']{1,60}$/u.test(x)).slice(0, 80) : [];
  if(qids.length < 3) return H.err(res, 400, "التحدي يحتاج ٣ أسئلة على الأقل");
  const id = crypto.randomBytes(4).toString("hex").slice(0, 7);
  const c = { id, title, by: me.u, byName: me.name, mode, topic, qids, timed: !!b.timed, created: Date.now() };
  await db.pipeline([["SET", "challenge:" + id, JSON.stringify(c)], ["LPUSH", "challenges", id], ["LTRIM", "challenges", 0, 99]]);
  H.ok(res, { id, challenge: c });
});
