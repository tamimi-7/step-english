const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");

function clean(p){
  const out = { v: 1, updated: Number(p && p.updated) || 0, q: {}, days: {}, marks: [], unmarked: [] };
  if(!p || typeof p !== "object") return out;
  const okId = id => /^[\p{L}\p{N}\-_ ']{1,60}$/u.test(id);
  out.marks = [...new Set((Array.isArray(p.marks) ? p.marks : []).filter(x => typeof x === "string" && okId(x)).slice(0, 3000))];
  out.unmarked = [...new Set((Array.isArray(p.unmarked) ? p.unmarked : []).filter(x => typeof x === "string" && okId(x)).slice(0, 3000))];
  let n = 0;
  for(const [id, r] of Object.entries(p.q || {})){
    if(n++ > 6000) break;
    if(!/^[\p{L}\p{N}\-_ ']{1,60}$/u.test(id) || !r || typeof r !== "object") continue;
    out.q[id] = { n: Math.max(0, Number(r.n) || 0), c: Math.max(0, Number(r.c) || 0), s: Math.max(0, Number(r.s) || 0), lvl: Math.min(5, Math.max(0, Number(r.lvl) || 0)), last: Number(r.last) || 0, due: Number(r.due) || 0 };
  }
  let d = 0;
  for(const [k, v] of Object.entries(p.days || {})){ if(d++ > 800) break; if(/^\d{4}-\d{2}-\d{2}$/.test(k)) out.days[k] = Math.max(0, Number(v) || 0); }
  return out;
}
function merge(a, b){
  const out = { v: 1, updated: Math.max(a.updated || 0, b.updated || 0), q: { ...(a.q || {}) }, days: { ...(a.days || {}) }, marks: [], unmarked: [] };
  const removed = new Set(b.unmarked || []);
  out.marks = [...new Set([...(a.marks || []), ...(b.marks || [])])].filter(id => !removed.has(id));
  out.unmarked = [...new Set(b.unmarked || [])];
  for(const [id, r] of Object.entries(b.q || {})){ const cur = out.q[id]; if(!cur || (r.last || 0) > (cur.last || 0)) out.q[id] = r; }
  for(const [d, n] of Object.entries(b.days || {})) out.days[d] = Math.max(out.days[d] || 0, n);
  return out;
}

module.exports = H.handler(["GET", "POST"], async (req, res) => {
  const me = A.getUser(req);
  if(!me) return H.err(res, 401, "سجّل الدخول أولًا");
  const key = "progress:" + me.u;
  const server = clean(await db.getJSON(key));
  if(req.method === "GET") return H.ok(res, { prog: server });
  const b = await H.body(req);
  const raw = JSON.stringify(b.prog || {});
  if(raw.length > 600000) return H.err(res, 413, "بيانات التقدم كبيرة جدًا");
  const merged = merge(server, clean(b.prog));
  await db.setJSON(key, merged);
  H.ok(res, { prog: merged });
});
