/* فحص الحوارات والقصص: نقص، تعارض، أو محتوى غير مكتمل */
const vm = require("vm"), fs = require("fs"), path = require("path");
const R = "C:\\Users\\ARTHUR\\step-English";
const load = files => { const c = { window: {} }; vm.createContext(c); files.forEach(f => vm.runInContext(fs.readFileSync(path.join(R, f), "utf8"), c)); return c.window; };
const problems = [];
const P = (s) => problems.push(s);
const ar = /[\u0600-\u06FF]/, en = /[A-Za-z]/;

/* ============ الحوارات ============ */
const W = load(["data/general/dialogues.js", "data/general/units.js"]);
const D = W.GEN_DIALOGUES, U = W.GEN_UNITS;
D.forEach(d => {
  const id = `حوار ${d.id}`;
  ["id", "lvl", "t", "roles", "lines", "phrases"].forEach(k => { if (!d[k] || (Array.isArray(d[k]) && !d[k].length)) P(`${id}: ينقصه ${k}`); });
  if (!d.icon) P(`${id}: بدون أيقونة`);
  if (d.roles && d.roles.length !== 2) P(`${id}: الأدوار ${d.roles && d.roles.length} بدل 2`);
  const aN = d.lines.filter(l => l[0] === "A").length, bN = d.lines.filter(l => l[0] === "B").length;
  if (Math.abs(aN - bN) > 1) P(`${id}: توزيع غير متوازن A=${aN} B=${bN}`);
  if (d.lines.length < 8) P(`${id}: قصير (${d.lines.length} سطر)`);
  d.lines.forEach((l, i) => {
    if (!["A", "B"].includes(l[0])) P(`${id} سطر ${i}: دور غير معروف "${l[0]}"`);
    if (!l[1] || !en.test(l[1])) P(`${id} سطر ${i}: بلا نص إنجليزي`);
    if (!l[2] || !ar.test(l[2])) P(`${id} سطر ${i}: بلا ترجمة عربية`);
    if (i > 0 && l[0] === d.lines[i - 1][0]) P(`${id} سطر ${i}: نفس المتحدث مرتين متتاليتين`);
  });
  /* أول سطر يجب أن يكون من الدور الأول */
  if (d.lines[0] && d.lines[0][0] !== "A") P(`${id}: يبدأ بالدور B`);
  d.phrases.forEach((p, i) => {
    if (!p[0] || !en.test(p[0])) P(`${id} عبارة ${i}: بلا إنجليزي`);
    if (!p[1] || !ar.test(p[1])) P(`${id} عبارة ${i}: بلا ترجمة`);
    /* العبارة المحفوظة يفترض أن تكون من الحوار نفسه */
    const inLines = d.lines.some(l => l[1].toLowerCase().includes(p[0].toLowerCase().replace(/[.?!]$/, "")));
    if (!inLines) P(`${id} عبارة ${i}: "${p[0]}" غير موجودة في الحوار`);
  });
  if (d.phrases.length < 3) P(`${id}: عبارات قليلة (${d.phrases.length})`);
  /* تمثيل الدور يحتاج ردودًا مميزة */
  const bLines = d.lines.filter((l, i) => l[0] === "B" && i > 0).map(l => l[1].toLowerCase());
  const dup = bLines.filter((x, i) => bLines.indexOf(x) !== i);
  if (dup.length) P(`${id}: ردود مكررة داخل الحوار (${dup[0]})`);
});
/* ردود متطابقة بين حوارين تُربك تمثيل الدور */
const allB = {};
D.forEach(d => d.lines.forEach((l, i) => { if (l[0] === "B" && i > 0) { const k = l[1].toLowerCase().trim(); (allB[k] = allB[k] || []).push(d.id); } }));
Object.entries(allB).filter(([, v]) => new Set(v).size > 1).forEach(([k, v]) => P(`رد مشترك بين حوارات (${[...new Set(v)].join(", ")}): "${k}"`));

/* ============ القصص ============ */
const S = load(["data/stories/lvl-a1.js", "data/stories/lvl-a2.js", "data/stories/lvl-b1.js", "data/stories/lvl-b2.js", "data/stories/lvl-c1.js", "data/stories/lvl-c2.js"]).STORIES;
const seenD = {};
S.forEach(s => {
  const id = `قصة ${s.id}`;
  ["title", "ar", "author", "origin", "intro", "moral", "kind"].forEach(k => { if (!s[k] || !String(s[k]).trim()) P(`${id}: ينقصه ${k}`); });
  if (!ar.test(s.ar || "")) P(`${id}: العنوان العربي غير عربي`);
  if (!ar.test(s.intro || "")) P(`${id}: المقدمة غير عربية`);
  if (!ar.test(s.moral || "")) P(`${id}: العبرة غير عربية`);
  const key = s.lvl + ":" + s.d;
  if (seenD[key]) P(`${id}: ترتيب ${s.d} مكرر مع ${seenD[key]} في ${s.lvl}`);
  seenD[key] = s.id;
  s.paras.forEach((p, i) => {
    if (!p.en || !en.test(p.en)) P(`${id} فقرة ${i}: بلا نص إنجليزي`);
    if (!p.ar || !ar.test(p.ar)) P(`${id} فقرة ${i}: بلا ترجمة عربية`);
    if (en.test(p.ar || "") && (p.ar.match(/[A-Za-z]{4,}/g) || []).length > 2) P(`${id} فقرة ${i}: الترجمة العربية فيها إنجليزي كثير`);
    const wEn = (p.en || "").split(/\s+/).length, wAr = (p.ar || "").split(/\s+/).length;
    if (wAr < wEn * 0.35) P(`${id} فقرة ${i}: الترجمة قصيرة جدًا (${wAr} مقابل ${wEn})`);
  });
  /* المفردات يجب أن تظهر فعلًا في نص القصة */
  const text = s.paras.map(p => p.en).join(" ").toLowerCase();
  const gWords = new Set();
  (s.glossary || []).forEach(g => {
    if (!g.w || !g.ar) return P(`${id}: مدخل مفردات ناقص`);
    if (gWords.has(g.w.toLowerCase())) P(`${id}: كلمة مكررة في المفردات "${g.w}"`);
    gWords.add(g.w.toLowerCase());
    if (!ar.test(g.ar)) P(`${id}: معنى غير عربي لـ "${g.w}"`);
    const base = g.w.toLowerCase().split(/[\s-]/)[0].replace(/[^a-z']/g, "");
    if (base.length > 2 && !text.includes(base.slice(0, Math.max(4, base.length - 3)))) P(`${id}: "${g.w}" في المفردات وغير موجودة في القصة`);
  });
  if ((s.glossary || []).length < 8) P(`${id}: مفردات قليلة (${(s.glossary || []).length})`);
  /* الأسئلة */
  const want = ["C1", "C2"].includes(s.lvl) ? 6 : 5;
  if (s.qs.length !== want) P(`${id}: عدد الأسئلة ${s.qs.length} بدل ${want}`);
  s.qs.forEach((q, i) => {
    if (!q.q || !en.test(q.q)) P(`${id} سؤال ${i}: بلا نص`);
    if (!q.o || q.o.length !== 4) P(`${id} سؤال ${i}: الخيارات ${q.o && q.o.length}`);
    if (new Set((q.o || []).map(x => String(x).trim().toLowerCase())).size !== 4) P(`${id} سؤال ${i}: خيارات مكررة`);
    if (!(q.a >= 0 && q.a < 4)) P(`${id} سؤال ${i}: رقم إجابة خاطئ`);
    if (!q.ex || !ar.test(q.ex)) P(`${id} سؤال ${i}: بلا شرح عربي`);
    (q.o || []).forEach((o, k) => { if (!String(o).trim()) P(`${id} سؤال ${i}: خيار ${k} فارغ`); });
  });
});
console.log(problems.length ? problems.join("\n") : "لا نقص في الحوارات ولا القصص");
console.log(`\nفُحص ${D.length} حوارًا (${D.reduce((n, d) => n + d.lines.length, 0)} سطرًا) و${S.length} قصة (${S.reduce((n, s) => n + s.paras.length, 0)} فقرة، ${S.reduce((n, s) => n + s.qs.length, 0)} سؤالًا، ${S.reduce((n, s) => n + s.glossary.length, 0)} كلمة)`);
