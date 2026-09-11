const crypto = require("crypto");
const SECRET = process.env.SESSION_SECRET || crypto.createHash("sha256").update("step-english|" + (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "dev-secret")).digest("hex");
const TOKEN_DAYS = 365;

function hashPassword(pw, salt){
  salt = salt || crypto.randomBytes(16).toString("hex");
  return { salt, hash: crypto.scryptSync(String(pw), salt, 64).toString("hex") };
}
function verifyPassword(pw, salt, hash){
  try{ return crypto.timingSafeEqual(crypto.scryptSync(String(pw), salt, 64), Buffer.from(hash, "hex")); }catch(e){ return false; }
}
const b64u = b => Buffer.from(b).toString("base64url");
function sign(payload){
  const p = b64u(JSON.stringify({ ...payload, exp: Date.now() + TOKEN_DAYS * 86400000 }));
  const s = b64u(crypto.createHmac("sha256", SECRET).update(p).digest());
  return p + "." + s;
}
function verifyToken(token){
  if(!token || typeof token !== "string" || !token.includes(".")) return null;
  const [p, s] = token.split(".");
  const expect = b64u(crypto.createHmac("sha256", SECRET).update(p).digest());
  if(expect.length !== s.length || !crypto.timingSafeEqual(Buffer.from(expect), Buffer.from(s))) return null;
  try{ const d = JSON.parse(Buffer.from(p, "base64url").toString("utf8")); if(!d.u || (d.exp && d.exp < Date.now())) return null; return d; }catch(e){ return null; }
}
function getUser(req){
  const h = req.headers.authorization || req.headers.Authorization || "";
  return h.startsWith("Bearer ") ? verifyToken(h.slice(7)) : null;
}
const normUser = u => String(u || "").trim().toLowerCase();
const USER_RE = /^[\p{L}\p{N}_]{3,20}$/u;

module.exports = { hashPassword, verifyPassword, sign, verifyToken, getUser, normUser, USER_RE };
