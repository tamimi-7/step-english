/* فحص شامل لبيانات المفردات: تكرار الكلمات، تطابق المعاني، الأمثلة، وأخطاء البنية */
const vm = require("vm"), fs = require("fs"), path = require("path");
const R = "C:\\Users\\ARTHUR\\step-English";
const c = { window: {} }; vm.createContext(c);
for (const f of ["a1", "a2", "b1", "b2"]) vm.runInContext(fs.readFileSync(path.join(R, "data/general/vocab-" + f + ".js"), "utf8"), c);
const V = c.window.GEN_VOCAB;
const LV = ["A1", "A2", "B1", "B2"];
const norm = s => String(s).toLowerCase().trim().replace(/\s+/g, " ");
const arKey = s => String(s).replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
const wordRe = w => new RegExp("(^|[^A-Za-z])(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![A-Za-z])", "i");

const all = [];
V.forEach(t => t.words.forEach((w, i) => all.push({ t, i, w, id: `gw-${t.id}-${i}` })));

const out = { totals: { themes: V.length, words: all.length }, dupWordSameLevel: [], dupWordCrossLevel: [], dupWordSameTheme: [], sameArSameLevel: [], sameArSameTheme: [], exampleMissing: [], badArity: [], emptyField: [], suspiciousPos: [], longPhrase: [], themeSize: [], arDupSets: [] };

// 1) نفس الكلمة الإنجليزية
const byWord = {};
all.forEach(x => { const k = norm(x.w[0]); (byWord[k] = byWord[k] || []).push(x); });
Object.entries(byWord).filter(([, v]) => v.length > 1).forEach(([k, v]) => {
  const levels = new Set(v.map(x => x.t.lvl));
  const themes = new Set(v.map(x => x.t.id));
  const rec = { word: k, entries: v.map(x => `${x.t.lvl}:${x.t.id}[${x.i}] = ${x.w[1]}`) };
  if (themes.size === 1) out.dupWordSameTheme.push(rec);
  else if (levels.size === 1) out.dupWordSameLevel.push(rec);
  else out.dupWordCrossLevel.push(rec);
});

// 2) نفس المعنى العربي (يسبب سؤالًا بإجابتين صحيحتين)
const byAr = {};
all.forEach(x => { const k = x.t.lvl + "|" + arKey(x.w[1]); (byAr[k] = byAr[k] || []).push(x); });
Object.entries(byAr).filter(([, v]) => v.length > 1).forEach(([k, v]) => {
  const rec = { lvl: v[0].t.lvl, ar: v[0].w[1], entries: v.map(x => `${x.t.id}[${x.i}] ${x.w[0]}`) };
  if (new Set(v.map(x => x.t.id)).size === 1) out.sameArSameTheme.push(rec); else out.sameArSameLevel.push(rec);
});

// 3) معانٍ متداخلة جزئيًا داخل نفس المستوى (أحد المعنيين جزء من الآخر بين كلمتين مختلفتين)
const arSplit = s => arKey(s).split(/[\/،,]/).map(x => x.trim()).filter(x => x.length > 2);
const bySeg = {};
all.forEach(x => arSplit(x.w[1]).forEach(seg => { const k = x.t.lvl + "|" + seg; (bySeg[k] = bySeg[k] || []).push(x); }));
Object.entries(bySeg).filter(([, v]) => new Set(v.map(x => norm(x.w[0]))).size > 1).forEach(([k, v]) => {
  out.arDupSets.push({ lvl: v[0].t.lvl, seg: k.split("|")[1], entries: v.map(x => `${x.t.id}[${x.i}] ${x.w[0]} = ${x.w[1]}`) });
});

// 4) بنية ومحتوى
all.forEach(x => {
  const w = x.w, where = `${x.t.lvl}:${x.t.id}[${x.i}] ${w[0]}`;
  if (w.length !== 5) out.badArity.push(where + " arity=" + w.length);
  w.forEach((f, k) => { if (!String(f || "").trim()) out.emptyField.push(where + " field " + k); });
  if (w[3] && !wordRe(w[0]).test(w[3])) out.exampleMissing.push({ where, word: w[0], ex: w[3] });
  if (w[0].split(" ").length > 3) out.longPhrase.push(where);
  const pos = String(w[2] || "").toLowerCase();
  if (!/noun|verb|adj|adv|phr|prep|conj|pron|det|num|interj|idiom|expr/.test(pos)) out.suspiciousPos.push(where + " pos=" + w[2]);
});
V.forEach(t => { if (t.words.length < 15 || t.words.length > 32) out.themeSize.push(`${t.lvl}:${t.id} = ${t.words.length}`); });

const brief = {
  totals: out.totals,
  counts: Object.fromEntries(Object.entries(out).filter(([k]) => k !== "totals").map(([k, v]) => [k, v.length])),
};
console.log(JSON.stringify(brief, null, 1));
fs.writeFileSync(process.argv[2] || "audit.json", JSON.stringify(out, null, 1), "utf8");
