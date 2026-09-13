/* يضيف رقم نسخة (?v=hash) لكل ملف JS/CSS محلي في الصفحات، فالمتصفح يحمّل الجديد فورًا بعد كل نشر
   بدل ما يعلق على نسخة قديمة مخزّنة في الجوال. يُشغَّل قبل النشر: node tools/bump.js */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const R = path.join(__dirname, "..");
const hash = f => { try{ return crypto.createHash("md5").update(fs.readFileSync(path.join(R, f))).digest("hex").slice(0, 8); }catch(e){ return null; } };
let files = 0, tags = 0;
for(const html of fs.readdirSync(R).filter(f => f.endsWith(".html"))){
  const p = path.join(R, html), s = fs.readFileSync(p, "utf8");
  const out = s.replace(/(<(?:script|link)\b[^>]*?\b(?:src|href)=")((?:assets|data)\/[^"?]+)(?:\?v=[^"]*)?(")/g, (m, a, f, b) => { const h = hash(f); if(!h) return m; tags++; return a + f + "?v=" + h + b; });
  if(out !== s){ fs.writeFileSync(p, out); files++; }
}
console.log(`bump: ${tags} tags checked, ${files} pages updated`);
