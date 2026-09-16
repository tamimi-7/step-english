/* يتحقق أن معرّف السؤال موجود فعلًا في محتوى الموقع قبل ما يعطي نقطة.
   يحمّل ملفات المحتوى مرة واحدة لكل تشغيل. لو تعذّر التحميل لأي سبب، ما يرفض شي (حتى ما تتعطل النقاط). */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const FILES = [
  "data/general/vocab-a1.js", "data/general/vocab-a2.js", "data/general/vocab-b1.js", "data/general/vocab-b2.js",
  "data/general/grammar-1.js", "data/general/grammar-2.js", "data/general/dialogues.js", "data/general/verbs.js", "data/general/core-words.js",
  "data/stories/lvl-a1.js", "data/stories/lvl-a2.js", "data/stories/lvl-b1.js", "data/stories/lvl-b2.js", "data/stories/lvl-c1.js", "data/stories/lvl-c2.js"
];
let IDX = null, loadError = null;
function build(){
  const c = { window: {} }; vm.createContext(c);
  FILES.forEach(f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), c, { filename: f }));
  const W = c.window, set = new Set(), words = new Set();
  const wordOf = {};
  (W.GEN_VOCAB || []).forEach(t => t.words.forEach((w, i) => { const id = `gw-${t.id}-${i}`, e = String(w[0]).toLowerCase().trim(); set.add(id); words.add(e); wordOf[id] = e; }));
  (W.GEN_GRAMMAR || []).forEach(l => l.practice.forEach((_, i) => set.add(`gg-${l.id}-${i}`)));
  (W.GEN_DIALOGUES || []).forEach(d => d.lines.forEach((ln, i) => { if(i > 0 && ln[0] === "B") set.add(`gd-${d.id}-${i}`); }));
  (W.GEN_VERBS || []).forEach(v => { set.add(`vb-${v[0]}-1`); set.add(`vb-${v[0]}-2`); words.add(String(v[0]).toLowerCase()); });
  const stories = {};
  (W.STORIES || []).forEach(s => { (s.qs || []).forEach((_, i) => set.add(`st-${s.id}-${i}`)); (s.glossary || []).forEach((g, i) => { const id = `sg-${s.id}-${i}`, e = String(g.w).toLowerCase().trim(); set.add(id); words.add(e); wordOf[id] = e; }); stories[s.id] = { lvl: s.lvl, qs: (s.qs || []).length, gloss: (s.glossary || []).length }; });
  (W.CORE_WORDS || []).forEach(x => words.add(String(x[0]).toLowerCase()));
  return { set, words, stories, wordOf };
}
function index(){
  if(IDX || loadError) return IDX;
  try{ IDX = build(); }catch(e){ loadError = e.message; }
  return IDX;
}
/* true = صالح، false = غير موجود. أسئلة STEP تُقبل بشكلها فقط */
function isValid(id){
  const X = index(); if(!X) return true;
  if(id.startsWith("gh-")) return /^gh-\d{4}-\d{2}-\d{2}-(1?\d)$/.test(id); /* تحدي ساعة الذهب: ٢٠ سؤال باليوم */
  if(/^(gw|gg|gd|vb|st|sg)-/.test(id)) return X.set.has(id);
  if(id.startsWith("sw-")) return id.length > 3 && id.length <= 40;
  return true;
}
function status(){ const X = index(); return X ? { ok: true, questions: X.set.size, words: X.words.size } : { ok: false, error: loadError }; }
/* الكلمة اللي يسأل عنها هذا السؤال (المفردات / كلمات القصص / كلماتي) — للتأكد أن الكلمة تنحسب مرة وحدة بس */
function wordKey(id){
  const X = index(); if(!X) return null;
  if(X.wordOf[id]) return X.wordOf[id];
  if(id.startsWith("sw-")) return id.slice(3).toLowerCase().trim() || null;
  return null;
}
const storyInfo = id => { const X = index(); return X && X.stories[id] ? X.stories[id] : null; };
module.exports = { isValid, status, storyInfo, wordKey };
