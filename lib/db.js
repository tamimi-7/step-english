/* Redis access — Upstash REST (on Vercel) or in-memory (local dev) */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN || "";
const MEM = process.env.DEV_MEMORY_DB === "1";
const NOT_READY = "قاعدة البيانات غير مربوطة بعد — اربط Upstash Redis بالمشروع من لوحة Vercel ثم أعد النشر";

/* ---------- in-memory Redis subset (dev only) ---------- */
const mem = global.__stepMem || (global.__stepMem = { kv: new Map(), sets: new Map(), z: new Map(), h: new Map(), l: new Map() });
const S = v => (v === null || v === undefined) ? v : String(v);
function memCall(cmd, a){
  const c = cmd.toUpperCase();
  const num = x => Number(x);
  switch(c){
    case "PING": return "PONG";
    case "GET": return mem.kv.has(a[0]) ? mem.kv.get(a[0]) : null;
    case "SET": { if(a[2] && String(a[2]).toUpperCase() === "NX" && mem.kv.has(a[0])) return null; mem.kv.set(a[0], S(a[1])); return "OK"; }
    case "DEL": { let n = 0; for(const k of a){ for(const m of [mem.kv, mem.sets, mem.z, mem.h, mem.l]) if(m.delete(k)) n++; } return n; }
    case "EXISTS": return [mem.kv, mem.sets, mem.z, mem.h, mem.l].some(m => m.has(a[0])) ? 1 : 0;
    case "INCR": { const v = num(mem.kv.get(a[0]) || 0) + 1; mem.kv.set(a[0], String(v)); return v; }
    case "SADD": { const s = mem.sets.get(a[0]) || new Set(); let n = 0; for(const m of a.slice(1)){ if(!s.has(S(m))){ s.add(S(m)); n++; } } mem.sets.set(a[0], s); return n; }
    case "SMEMBERS": return [...(mem.sets.get(a[0]) || [])];
    case "SCARD": return (mem.sets.get(a[0]) || new Set()).size;
    case "SISMEMBER": return (mem.sets.get(a[0]) || new Set()).has(S(a[1])) ? 1 : 0;
    case "SREM": { const st = mem.sets.get(a[0]); let n = 0; if(st) a.slice(1).forEach(x => { if(st.delete(S(x))) n++; }); return n; }
    case "ZADD": { const z = mem.z.get(a[0]) || new Map(); z.set(S(a[2]), num(a[1])); mem.z.set(a[0], z); return 1; }
    case "ZINCRBY": { const z = mem.z.get(a[0]) || new Map(); const v = (z.get(S(a[2])) || 0) + num(a[1]); z.set(S(a[2]), v); mem.z.set(a[0], z); return String(v); }
    case "ZSCORE": { const z = mem.z.get(a[0]); return z && z.has(S(a[1])) ? String(z.get(S(a[1]))) : null; }
    case "ZCARD": return (mem.z.get(a[0]) || new Map()).size;
    case "ZREVRANK": { const z = mem.z.get(a[0]); if(!z || !z.has(S(a[1]))) return null; const sorted = [...z.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)); return sorted.findIndex(e => e[0] === S(a[1])); }
    case "ZREVRANGE": { const z = mem.z.get(a[0]) || new Map(); const sorted = [...z.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)); let stop = num(a[2]); if(stop < 0) stop = sorted.length + stop; const part = sorted.slice(num(a[1]), stop + 1); const ws = a.slice(3).some(x => String(x).toUpperCase() === "WITHSCORES"); return ws ? part.flatMap(e => [e[0], String(e[1])]) : part.map(e => e[0]); }
    case "HSET": { const h = mem.h.get(a[0]) || new Map(); let n = 0; for(let i = 1; i < a.length; i += 2){ if(!h.has(S(a[i]))) n++; h.set(S(a[i]), S(a[i+1])); } mem.h.set(a[0], h); return n; }
    case "EXPIRE": return 1;
    case "INCRBY": { const v = (Number(mem.kv.get(a[0])) || 0) + num(a[1]); mem.kv.set(a[0], String(v)); return v; }
    case "HSETNX": { const h = mem.h.get(a[0]) || new Map(); if(h.has(S(a[1]))) return 0; h.set(S(a[1]), S(a[2])); mem.h.set(a[0], h); return 1; }
    case "HGET": { const h = mem.h.get(a[0]); return h && h.has(S(a[1])) ? h.get(S(a[1])) : null; }
    case "HMGET": { const h = mem.h.get(a[0]); return a.slice(1).map(k => h && h.has(S(k)) ? h.get(S(k)) : null); }
    case "HGETALL": { const h = mem.h.get(a[0]) || new Map(); return [...h.entries()].flat(); }
    case "HINCRBY": { const h = mem.h.get(a[0]) || new Map(); const v = (Number(h.get(S(a[1]))) || 0) + num(a[2]); h.set(S(a[1]), String(v)); mem.h.set(a[0], h); return v; }
    case "HLEN": return (mem.h.get(a[0]) || new Map()).size;
    case "HDEL": { const h = mem.h.get(a[0]); if(!h) return 0; let n = 0; for(const f of a.slice(1)) if(h.delete(S(f))) n++; return n; }
    case "LPUSH": { const l = mem.l.get(a[0]) || []; for(const v of a.slice(1)) l.unshift(S(v)); mem.l.set(a[0], l); return l.length; }
    case "LRANGE": { const l = mem.l.get(a[0]) || []; let stop = num(a[2]); if(stop < 0) stop = l.length + stop; return l.slice(num(a[1]), stop + 1); }
    case "LTRIM": { const l = mem.l.get(a[0]) || []; let stop = num(a[2]); if(stop < 0) stop = l.length + stop; mem.l.set(a[0], l.slice(num(a[1]), stop + 1)); return "OK"; }
    default: throw new Error("mem db: unsupported command " + c);
  }
}

/* ---------- Upstash REST ---------- */
async function rest(body, path){
  const r = await fetch(URL_ + (path || ""), { method: "POST", headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if(!r.ok) throw new Error("redis http " + r.status + " " + JSON.stringify(j).slice(0, 200));
  return j;
}

async function call(cmd, ...args){
  if(MEM) return memCall(cmd, args);
  if(!URL_ || !TOKEN) throw new Error(NOT_READY);
  const j = await rest([cmd, ...args]);
  if(j.error) throw new Error("redis: " + j.error);
  return j.result;
}
async function pipeline(cmds){
  if(MEM) return cmds.map(c => memCall(c[0], c.slice(1)));
  if(!URL_ || !TOKEN) throw new Error(NOT_READY);
  const j = await rest(cmds, "/pipeline");
  return j.map(x => { if(x.error) throw new Error("redis: " + x.error); return x.result; });
}

/* ---------- helpers ---------- */
const getJSON = async k => { const v = await call("GET", k); try{ return v ? JSON.parse(v) : null; }catch(e){ return null; } };
const setJSON = (k, v) => call("SET", k, JSON.stringify(v));
const flatToObj = flat => { const o = {}; for(let i = 0; i < (flat || []).length; i += 2) o[flat[i]] = flat[i+1]; return o; };
const flatToPairs = flat => { const o = []; for(let i = 0; i < (flat || []).length; i += 2) o.push({ member: flat[i], score: Number(flat[i+1]) }); return o; };
function weekKey(d){ // ISO week e.g. 2026-W37
  d = d ? new Date(d) : new Date();
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear(); const wk = Math.ceil((((t - Date.UTC(y, 0, 1)) / 86400000) + 1) / 7);
  return `${y}-W${String(wk).padStart(2, "0")}`;
}

module.exports = { call, pipeline, getJSON, setJSON, flatToObj, flatToPairs, weekKey, isMemory: MEM };
