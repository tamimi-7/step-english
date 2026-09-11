/* فحص الروابط والملفات المرجعية وسلامة البيانات */
const fs = require("fs"), path = require("path"), vm = require("vm");
const R = "C:\\Users\\ARTHUR\\step-English";
const problems = [];
const htmls = fs.readdirSync(R).filter(f => f.endsWith(".html"));

// 1) روابط ومصادر داخل صفحات HTML
for (const f of htmls) {
  const s = fs.readFileSync(path.join(R, f), "utf8");
  const refs = [...s.matchAll(/(?:href|src)="([^"#][^"]*)"/g)].map(m => m[1]);
  refs.forEach(r => {
    if (/^(https?:|data:|mailto:|\/\/)/.test(r)) return;
    const clean = r.split("?")[0].split("#")[0].replace(/^\//, "");
    if (!clean) return;
    if (!fs.existsSync(path.join(R, clean))) problems.push(`${f}: missing ref -> ${r}`);
  });
  const ids = [...s.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) problems.push(`${f}: duplicate ids -> ${[...new Set(dup)].join(", ")}`);
  if (!/<html lang="ar" dir="rtl">/.test(s)) problems.push(`${f}: missing lang/dir on <html>`);
  if (!/viewport-fit=cover/.test(s)) problems.push(`${f}: viewport missing viewport-fit=cover`);
  if (!/step_theme/.test(s)) problems.push(`${f}: missing inline theme script (causes white flash)`);
}

// 2) روابط داخلية في ملفات JS إلى صفحات
const jsFiles = fs.readdirSync(path.join(R, "assets")).filter(f => f.endsWith(".js"));
for (const f of jsFiles) {
  const s = fs.readFileSync(path.join(R, "assets", f), "utf8");
  [...s.matchAll(/href="([a-z0-9\-]+\.html)[^"]*"/g)].map(m => m[1]).forEach(p => {
    if (!fs.existsSync(path.join(R, p))) problems.push(`assets/${f}: link to missing page -> ${p}`);
  });
}

// 3) بيانات: القصص والصوت والتوقيت
const c = { window: {} }; vm.createContext(c);
for (const f of fs.readdirSync(path.join(R, "data/stories")).sort()) vm.runInContext(fs.readFileSync(path.join(R, "data/stories", f), "utf8"), c);
vm.runInContext(fs.readFileSync(path.join(R, "data/story-times.js"), "utf8"), c);
const S = c.window.STORIES || [], T = c.window.STORY_TIMES || {};
const audio = new Set(fs.readdirSync(path.join(R, "audio/stories")).map(f => f.replace(/\.mp3$/, "")));
S.forEach(st => {
  if (!audio.has(st.id)) problems.push(`story ${st.id}: no audio file`);
  if (!T[st.id]) problems.push(`story ${st.id}: no timings`);
  else {
    const spans = T[st.id];
    spans.forEach((sp, i) => {
      if (sp[2] >= st.paras.length) problems.push(`story ${st.id} span ${i}: paragraph index ${sp[2]} out of range`);
      else if (sp[4] > st.paras[sp[2]].en.length) problems.push(`story ${st.id} span ${i}: char range beyond paragraph`);
      if (i && sp[0] < spans[i - 1][0] - 0.5) problems.push(`story ${st.id} span ${i}: time goes backwards`);
    });
  }
});
[...audio].forEach(a => { if (!S.some(s => s.id === a)) problems.push(`audio ${a}.mp3: no matching story`); });

// 4) بيانات إنقلش عام: الوحدات تشير إلى محتوى موجود
const g = { window: {} }; vm.createContext(g);
["a1", "a2", "b1", "b2"].forEach(l => vm.runInContext(fs.readFileSync(path.join(R, "data/general/vocab-" + l + ".js"), "utf8"), g));
["grammar-1", "grammar-2", "dialogues", "units"].forEach(f => vm.runInContext(fs.readFileSync(path.join(R, "data/general", f + ".js"), "utf8"), g));
const V = g.window.GEN_VOCAB, G = g.window.GEN_GRAMMAR, D = g.window.GEN_DIALOGUES, U = g.window.GEN_UNITS;
U.forEach(u => {
  u.themes.forEach(t => { if (!V.some(x => x.id === t)) problems.push(`unit ${u.id}: missing theme ${t}`); });
  if (u.grammar && !G.some(x => x.id === u.grammar)) problems.push(`unit ${u.id}: missing lesson ${u.grammar}`);
  const uds = Array.isArray(u.dialogue) ? u.dialogue : u.dialogue ? [u.dialogue] : [];
  uds.forEach(id => { if (!D.some(x => x.id === id)) problems.push(`unit ${u.id}: missing dialogue ${id}`); });
  const l = G.find(x => x.id === u.grammar);
  if (l && l.lvl !== u.lvl) problems.push(`unit ${u.id} (${u.lvl}): lesson ${l.id} is ${l.lvl}`);
  uds.map(id => D.find(x => x.id === id)).filter(Boolean).forEach(d => { if (d.lvl !== u.lvl) problems.push(`unit ${u.id} (${u.lvl}): dialogue ${d.id} is ${d.lvl}`); });
  u.themes.forEach(t => { const th = V.find(x => x.id === t); if (th && th.lvl !== u.lvl) problems.push(`unit ${u.id} (${u.lvl}): theme ${t} is ${th.lvl}`); });
});
const usedThemes = new Set(U.flatMap(u => u.themes)), usedLessons = new Set(U.map(u => u.grammar).filter(Boolean)), usedDialogs = new Set(U.flatMap(u => Array.isArray(u.dialogue) ? u.dialogue : u.dialogue ? [u.dialogue] : []));
V.forEach(t => { if (!usedThemes.has(t.id)) problems.push(`theme ${t.id} (${t.lvl}) is not in any unit`); });
G.forEach(l => { if (!usedLessons.has(l.id)) problems.push(`lesson ${l.id} (${l.lvl}) is not in any unit`); });
D.forEach(d => { if (!usedDialogs.has(d.id)) problems.push(`dialogue ${d.id} (${d.lvl}) is not in any unit`); });
G.forEach(l => l.practice.forEach((p, i) => { if (!(p.a >= 0 && p.a < p.o.length)) problems.push(`lesson ${l.id} practice ${i}: bad answer index`); if (new Set(p.o).size !== p.o.length) problems.push(`lesson ${l.id} practice ${i}: duplicate options`); }));
D.forEach(d => { if (d.lines.filter(l => l[0] === "B").length < 3) problems.push(`dialogue ${d.id}: too few B lines for role-play`); });

console.log(problems.length ? problems.join("\n") : "no problems found");
console.log(`\nchecked: ${htmls.length} pages, ${jsFiles.length} scripts, ${S.length} stories, ${V.length} themes, ${G.length} lessons, ${D.length} dialogues, ${U.length} units`);
