/* tiny helpers for Vercel Node functions */
function send(res, status, data){
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}
const ok = (res, data) => send(res, 200, data);
const err = (res, status, message) => send(res, status, { error: message });

async function body(req){
  if(req.body !== undefined && req.body !== null){
    if(typeof req.body === "string"){ try{ return JSON.parse(req.body || "{}"); }catch(e){ return {}; } }
    if(Buffer.isBuffer(req.body)){ try{ return JSON.parse(req.body.toString("utf8") || "{}"); }catch(e){ return {}; } }
    return req.body;
  }
  return new Promise(resolve => {
    let raw = ""; req.on("data", c => raw += c); req.on("end", () => { try{ resolve(JSON.parse(raw || "{}")); }catch(e){ resolve({}); } }); req.on("error", () => resolve({}));
  });
}
function query(req){
  if(req.query && typeof req.query === "object") return req.query;
  try{ return Object.fromEntries(new URL(req.url, "http://x").searchParams.entries()); }catch(e){ return {}; }
}
/* wrap a handler: method check + error catching */
function handler(methods, fn){
  return async (req, res) => {
    if(req.method === "OPTIONS"){ res.statusCode = 204; return res.end(); }
    if(!methods.includes(req.method)) return err(res, 405, "Method not allowed");
    try{ await fn(req, res); }
    catch(e){ console.error(e); err(res, 500, /غير مربوطة/.test(e.message || "") ? e.message : "خطأ في الخادم: " + (e.message || e)); }
  };
}
module.exports = { send, ok, err, body, query, handler };
