/* فحغ مركّز: هل يشرح الدرس أدوات التركيب التي تختبرها أسئلته؟ (نتجاهل الأفعال نفسها) */
const vm = require("vm"), fs = require("fs"), path = require("path");
const R = "C:\\Users\\ARTHUR\\step-English";
const c = { window: {} }; vm.createContext(c);
["grammar-1", "grammar-2"].forEach(f => vm.runInContext(fs.readFileSync(path.join(R, "data/general", f + ".js"), "utf8"), c));
const G = c.window.GEN_GRAMMAR;

/* أدوات التركيب: لو ظهرت في جواب التدريب فيجب أن تكون مشروحة */
const FUNC = ["am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "can", "could", "should", "must", "might", "shall",
  "going to", "used to", "not", "n't", "to", "as", "than", "the most", "more", "some", "any",
  "ever", "never", "just", "yet", "already", "for", "since", "if", "unless", "who", "which",
  "that", "where", "whose", "when", "while", "because", "although", "though", "despite",
  "however", "therefore", "as long as", "by", "said", "told", "asked"];
const MORPH = { ing: /\w+ing\b/, ed: /\w+ed\b/, est: /\w+est\b/, er: /\w+er\b/, s3: /\b\w+s\b/ };

const teach = l => [l.when, l.form, l.tip, ...(l.frames || []).flat(), ...(l.speak || []),
  ...(l.table ? l.table.head.concat(...l.table.rows) : []), ...l.ex.map(e => e[0]),
  ...l.mistakes.map(m => m[1])].join(" \n ");
const has = (text, tok) => new RegExp("(^|[^a-z'])" + tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "i").test(text);

const gaps = [];
G.forEach(l => {
  const text = teach(l);
  const need = new Set();
  l.practice.forEach(p => {
    const ans = String(p.o[p.a]).toLowerCase();
    FUNC.forEach(f => { if (has(ans, f)) need.add(f); });
    if (MORPH.ing.test(ans)) need.add("__ing");
    if (MORPH.est.test(ans)) need.add("__est");
  });
  need.forEach(tok => {
    if (tok === "__ing") { if (!/ing\b/i.test(text)) gaps.push(`${l.lvl} ${l.id}: الأسئلة تطلب صيغة ing والشرح ما يذكرها`); return; }
    if (tok === "__est") { if (!/est\b/i.test(text)) gaps.push(`${l.lvl} ${l.id}: الأسئلة تطلب صيغة est والشرح ما يذكرها`); return; }
    if (!has(text, tok)) gaps.push(`${l.lvl} ${l.id}: الأسئلة تستخدم "${tok}" والشرح ما يشرحها`);
  });
  /* الأخطاء الشائعة يجب أن تكون مشروحة أيضًا */
  l.mistakes.forEach((m, i) => {
    const right = m[1].toLowerCase();
    FUNC.forEach(f => { if (has(right, f) && !has(text, f) && !has(l.when.toLowerCase(), f)) gaps.push(`${l.lvl} ${l.id}: خطأ شائع ${i} صوابه فيه "${f}" وما شُرح`); });
  });
});
console.log(gaps.length ? [...new Set(gaps)].join("\n") : "لا توجد فجوات حقيقية");
console.log(`\nفُحص ${G.length} درسًا و${G.reduce((n, l) => n + l.practice.length, 0)} سؤالًا و${G.reduce((n, l) => n + l.mistakes.length, 0)} خطأً شائعًا`);
