/* إشعارات الجوال (Web Push) — آمنة:
   - المفتاح الخاص في إعدادات السيرفر فقط (VAPID_PRIVATE_KEY)، ما يوصل للمتصفح أبدًا
   - نقبل اشتراكات من خدمات الإشعارات الرسمية فقط (Apple / Google / Mozilla / Microsoft)
   - الإشعار فيه عنوان ونص قصير ورابط داخل الموقع فقط */
const crypto = require("crypto");
const db = require("./db");
let webpush = null;
function wp(){
  if(webpush) return webpush;
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if(!pub || !priv) return null;
  webpush = require("web-push");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "https://step-english-lime.vercel.app", pub, priv);
  return webpush;
}
const HOSTS = [/^fcm\.googleapis\.com$/, /(^|\.)push\.services\.mozilla\.com$/, /^web\.push\.apple\.com$/, /(^|\.)notify\.windows\.com$/, /^android\.googleapis\.com$/];
const B64U = /^[A-Za-z0-9_-]+$/;
function cleanSub(s){
  if(!s || typeof s !== "object") return null;
  let u; try{ u = new URL(String(s.endpoint || "")); }catch(e){ return null; }
  if(u.protocol !== "https:" || !HOSTS.some(re => re.test(u.hostname)) || String(s.endpoint).length > 800) return null;
  const k = s.keys || {};
  if(!B64U.test(k.p256dh || "") || !B64U.test(k.auth || "") || k.p256dh.length < 60 || k.p256dh.length > 120 || k.auth.length < 16 || k.auth.length > 40) return null;
  return { endpoint: String(s.endpoint), keys: { p256dh: k.p256dh, auth: k.auth } };
}
const subId = endpoint => crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 24);
const safeUrl = url => (typeof url === "string" && /^\/[A-Za-z0-9_\-./#?=&%]*$/.test(url) && !url.startsWith("//")) ? url : "/";

async function addSub(u, sub){
  const s = cleanSub(sub); if(!s) return false;
  const key = "push:" + u, all = db.flatToObj(await db.call("HGETALL", key));
  const ids = Object.keys(all);
  if(ids.length >= 5 && !all[subId(s.endpoint)]){ await db.call("HDEL", key, ids[0]); } /* حد أقصى ٥ أجهزة */
  await db.pipeline([["HSET", key, subId(s.endpoint), JSON.stringify({ ...s, at: Date.now() })], ["SADD", "push:users", u]]);
  return true;
}
async function removeSub(u, endpoint){
  const key = "push:" + u;
  if(endpoint) await db.call("HDEL", key, subId(String(endpoint)));
  const left = await db.call("HLEN", key);
  if(!Number(left)) await db.call("SREM", "push:users", u);
}
/* يرسل لكل أجهزة المستخدم؛ يحذف الاشتراكات المنتهية تلقائيًا */
async function sendToUser(u, msg){
  const W = wp(); if(!W) return { sent: 0, error: "no-keys" };
  const all = db.flatToObj(await db.call("HGETALL", "push:" + u));
  const payload = JSON.stringify({ title: String(msg.title || "إنقلش").slice(0, 80), body: String(msg.body || "").slice(0, 200), url: safeUrl(msg.url), tag: String(msg.tag || "general").slice(0, 40) });
  let sent = 0;
  for(const [id, raw] of Object.entries(all)){
    let s; try{ s = JSON.parse(raw); }catch(e){ await db.call("HDEL", "push:" + u, id); continue; }
    try{ await W.sendNotification(s, payload, { TTL: 6 * 3600, urgency: "normal" }); sent++; }
    catch(e){ if(e && (e.statusCode === 404 || e.statusCode === 410)) await db.call("HDEL", "push:" + u, id); }
  }
  if(!sent && !Object.keys(all).length) await db.call("SREM", "push:users", u);
  return { sent };
}
module.exports = { cleanSub, addSub, removeSub, sendToUser, publicKey: () => process.env.VAPID_PUBLIC_KEY || null, enabled: () => !!wp() };
