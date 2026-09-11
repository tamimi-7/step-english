/* Local dev server: static files + /api/* functions with an in-memory database.
   Run:  node dev/server.js   (then open http://localhost:8765) */
process.env.DEV_MEMORY_DB = "1";
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 8765);
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".md": "text/markdown; charset=utf-8", ".mp3": "audio/mpeg", ".woff2": "font/woff2" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if(url.pathname.startsWith("/api/")){
    const name = url.pathname.slice(5).replace(/[^a-z0-9_-]/gi, "");
    const file = path.join(ROOT, "api", name + ".js");
    if(!fs.existsSync(file)){ res.statusCode = 404; return res.end(JSON.stringify({ error: "no such api" })); }
    delete require.cache[require.resolve(file)];
    const fn = require(file);
    req.query = Object.fromEntries(url.searchParams.entries());
    res.status = c => { res.statusCode = c; return res; };
    res.json = d => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(d)); };
    try{ await fn(req, res); }catch(e){ console.error(e); res.statusCode = 500; res.end(JSON.stringify({ error: String(e.message || e) })); }
    return;
  }
  let p = decodeURIComponent(url.pathname); if(p === "/") p = "/index.html";
  const file = path.normalize(path.join(ROOT, p));
  if(!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){ res.statusCode = 404; return res.end("not found"); }
  res.setHeader("Content-Type", MIME[path.extname(file).toLowerCase()] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Accept-Ranges", "bytes");
  const size = fs.statSync(file).size;
  const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
  if(range){ // دعم الانتقال داخل ملفات الصوت (مثل المتصفح على الإنترنت)
    const start = range[1] ? parseInt(range[1], 10) : Math.max(0, size - parseInt(range[2] || "0", 10));
    const end = range[1] && range[2] ? Math.min(parseInt(range[2], 10), size - 1) : size - 1;
    if(start >= size || start > end){ res.statusCode = 416; res.setHeader("Content-Range", `bytes */${size}`); return res.end(); }
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
    res.setHeader("Content-Length", end - start + 1);
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.setHeader("Content-Length", size);
  fs.createReadStream(file).pipe(res);
}).listen(PORT, "127.0.0.1", () => console.log("STEP dev server → http://localhost:" + PORT + "  (in-memory DB, data resets on restart)"));
