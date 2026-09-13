/* ===== إنقلش عام — تطبيق تعلم اللغة (SPA) ===== */
(function(){
  const $ = s => document.querySelector(s);
  const V = window.GEN_VOCAB || [], G = window.GEN_GRAMMAR || [], D = window.GEN_DIALOGUES || [], U = window.GEN_UNITS || [];
  const LV = ["A1", "A2", "B1", "B2"], LVN = { A1: "مبتدئ", A2: "أساسي", B1: "متوسط", B2: "متقدم" };
  const LVC = { A1: "#16a34a", A2: "#2563eb", B1: "#d97706", B2: "#7c3aed" };
  const L = ["A", "B", "C", "D"];
  const theme = id => V.find(t => t.id === id), lesson = id => G.find(l => l.id === id), dialog = id => D.find(d => d.id === id);
  const wid = (t, i) => `gw-${t.id}-${i}`;
  const rec = id => Progress.data.q[id];
  const known = id => { const r = rec(id); return !!(r && r.lvl >= 1); };
  const mastered = id => { const r = rec(id); return !!(r && r.lvl >= 3); };
  const themeStats = t => { let k = 0, m = 0; t.words.forEach((w, i) => { if(known(wid(t, i))) k++; if(mastered(wid(t, i))) m++; }); return { k, m, n: t.words.length, pct: Math.round(k / t.words.length * 100) }; };
  const allWords = () => V.flatMap(t => t.words.map((w, i) => ({ t, i, w })));
  const dayKey = () => new Date().toLocaleDateString("en-CA");

  /* ---------- XP / state ---------- */
  const GEN = Object.assign({ xp: 0, daily: {}, units: {}, best: {}, level: "A1" }, Store.get("step_gen", {}));
  const saveGen = () => Store.set("step_gen", GEN);
  function gainXP(n, quiet){
    if(!n) return;
    const before = xpLevel(GEN.xp); GEN.xp += n; const after = xpLevel(GEN.xp); saveGen();
    if(!quiet) toast(`+${n} XP`);
    if(after > before) after0(after);
  }
  const addXP = n => gainXP(n);
  function after0(lv){
    const el = document.createElement("div"); el.className = "levelup";
    el.innerHTML = `<div class="lu-card"><div class="lu-n">${lv}</div><h3>ارتفع مستواك!</h3><p class="muted">صرت <b>${levelTitle(lv)}</b> — واصل، خطوتك التالية تنتظرك.</p><button type="button" class="btn btn-primary">تمام</button></div>`;
    document.body.appendChild(el); hydrateIcons(el); confetti();
    const close = () => el.remove();
    el.querySelector("button").addEventListener("click", close);
    el.addEventListener("click", e => { if(e.target === el) close(); });
    setTimeout(close, 6000);
  }
  const xpLevel = xp => Math.floor(Math.sqrt(xp / 60)) + 1;
  const xpNext = xp => { const l = xpLevel(xp); return { l, cur: xp - 60 * (l - 1) * (l - 1), need: 60 * (l * l) - 60 * (l - 1) * (l - 1) }; };
  const TITLES = ["مبتدئ", "متعلم", "مثابر", "متمكن", "متقدم", "طليق", "خبير", "أستاذ"];
  const levelTitle = l => TITLES[Math.min(TITLES.length - 1, Math.floor((l - 1) / 3))];
  async function postPoints(score, total, seconds, ids, unit){
    if(!Auth.user() || ((!ids || !ids.length) && !unit)) return;
    try{
      const j = await Auth.api("/api/result", { method: "POST", body: { mode: "general", score, total, seconds: seconds || 0, ids: ids || [], unit: unit || null } });
      if(j.stage){ GEN.units[j.stage.unit] = true; saveGen(); }
      const box = $("#ptsBox");
      if(box) pointsReveal(j, box);
      else if(j.points > 0){ toast(`+${j.points} نقطة في المنافسة${j.mult > 1 ? " (×" + j.mult + " فعالية)" : ""}`); if(typeof SFX !== "undefined") SFX.coin(); }
      Progress.sync(true);
    }catch(e){}
  }
  const sfx = n => { if(typeof SFX !== "undefined" && SFX[n]) SFX[n](); };
  const ptsTag = () => `<span class="pts-tag" title="كل سؤال تجيبه صح لأول مرة = نقطة في المنافسة">${I("trophy")} نقاط</span>`;

  /* ---------- speech ---------- */
  let voices = [];
  function loadVoices(){ try{ voices = speechSynthesis.getVoices(); }catch(e){} }
  loadVoices(); try{ speechSynthesis.onvoiceschanged = loadVoices; }catch(e){}
  const hush = () => { try{ speechSynthesis.cancel(); }catch(e){} };
  let speakTimer = null;
  function speak(text, rate){
    try{
      if(!("speechSynthesis" in window)) return toast("النطق غير مدعوم في هذا المتصفح");
      const go = () => {
        const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = rate || 0.92;
        const v = voices.find(v => /en[-_]US/i.test(v.lang) && /female|zira|samantha|aria|jenny/i.test(v.name)) || voices.find(v => /en[-_]US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
        if(v) u.voice = v;
        speechSynthesis.speak(u);
      };
      clearTimeout(speakTimer);
      if(speechSynthesis.speaking || speechSynthesis.pending){ speechSynthesis.cancel(); speakTimer = setTimeout(go, 120); } else go();
    }catch(e){ toast("النطق غير مدعوم في هذا المتصفح"); }
  }
  const SR = typeof Speech !== "undefined" && Speech.supported;
  const spk = (text, cls) => `<button type="button" class="spk ${cls || ""}" data-say="${esc(text)}" title="استمع">${I("headphones")}</button>`;
  document.addEventListener("click", e => { const b = e.target.closest("[data-say]"); if(b){ speak(b.dataset.say); } });

  /* ---------- question builders ---------- */
  const arNorm = x => String(x).replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").trim();
  const arSegs = x => arNorm(x).split(/[\/،,()]/).map(y => y.trim()).filter(y => y.length > 2);
  const arOverlap = (a, b) => { const A = new Set(arSegs(a)); return arSegs(b).some(y => A.has(y)); };
  function pickDistract(pool, correct, n, key){ const out = []; for(const x of shuffle(pool)){ const v = key(x); if(v !== correct && !out.includes(v)) out.push(v); if(out.length === n) break; } return out; }
  function meaningQ(t, i){ const w = t.words[i]; const pool = [...t.words.filter(x => x !== w), ...V.filter(x => x.lvl === t.lvl && x !== t).flatMap(x => x.words)].filter(x => x[0].toLowerCase() !== w[0].toLowerCase() && !arOverlap(x[1], w[1])); const dis = pickDistract(pool, w[1], 3, x => x[1]); const opts = shuffle([w[1], ...dis]); return { id: wid(t, i), kind: "meaning", q: w[0], sub: w[2], opts, a: opts.indexOf(w[1]), ex: `${w[0]} = ${w[1]} — ${w[3]}`, say: w[0] }; }
  function reverseQ(t, i){ const w = t.words[i]; const pool = [...t.words.filter(x => x !== w), ...V.filter(x => x.lvl === t.lvl && x !== t).flatMap(x => x.words)].filter(x => x[1] !== w[1] && !arOverlap(x[1], w[1]) && x[0].toLowerCase() !== w[0].toLowerCase()); const dis = pickDistract(pool, w[0], 3, x => x[0]); const opts = shuffle([w[0], ...dis]); return { id: wid(t, i), kind: "reverse", q: w[1], opts, a: opts.indexOf(w[0]), ex: `${w[1]} = ${w[0]} — ${w[3]}`, sayAfter: w[0] }; }
  /* مطابقة الكلمة داخل المثال مع تصريفاتها: يذاكر/ذاكر/يذاكرون، والعبارات مثل pick (you) up */
  const IRREG = { be: "was were been am is are", begin: "began begun", bite: "bit bitten", break: "broke broken", bring: "brought", build: "built", buy: "bought", can: "could", catch: "caught", choose: "chose chosen", come: "came", cost: "cost", cut: "cut", deal: "dealt", do: "did done does", draw: "drew drawn", drink: "drank drunk", drive: "drove driven", eat: "ate eaten", fall: "fell fallen", feel: "felt", find: "found", fly: "flew flown", forget: "forgot forgotten", get: "got gotten", give: "gave given", go: "went gone goes", grow: "grew grown", have: "had has", hear: "heard", hold: "held", hurt: "hurt", keep: "kept", know: "knew known", lay: "laid", lead: "led", learn: "learnt", leave: "left", lend: "lent", let: "let", lose: "lost", make: "made", may: "might", mean: "meant", meet: "met", pay: "paid", put: "put", read: "read", ride: "rode ridden", rise: "rose risen", run: "ran", say: "said", see: "saw seen", sell: "sold", send: "sent", set: "set", shall: "should", show: "showed shown", sing: "sang sung", sit: "sat", sleep: "slept", speak: "spoke spoken", spend: "spent", stand: "stood", steal: "stole stolen", swim: "swam swum", take: "took taken", teach: "taught", tell: "told", think: "thought", throw: "threw thrown", understand: "understood", wake: "woke woken", wear: "wore worn", will: "would", win: "won", wind: "wound", withdraw: "withdrew withdrawn", write: "wrote written" };
  /* كلمات قد تتغيّر أو تُحذف داخل الجملة (ضمائر، أدوات تعريف، نائب عن شخص) */
  const ANY = /^(someone|somebody|something|sb|sth|one's|someone's|somebody's|i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|its|our|their|the|a|an|this|that|these|those)$/i;
  const reEsc = t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function tokenAlt(w){
    const set = new Set([w, w + "s", w + "es", w + "ed", w + "ing", w + "'s"]);
    if(/y$/.test(w)){ set.add(w.slice(0, -1) + "ies"); set.add(w.slice(0, -1) + "ied"); }
    if(/e$/.test(w)){ set.add(w.slice(0, -1) + "ing"); set.add(w + "d"); }
    if(/[^aeiou][aeiou][^aeiouwxy]$/.test(w)){ set.add(w + w.slice(-1) + "ing"); set.add(w + w.slice(-1) + "ed"); }
    if(/ies$/.test(w)) set.add(w.slice(0, -3) + "y");
    else if(/es$/.test(w)) set.add(w.slice(0, -2));
    if(/s$/.test(w)) set.add(w.slice(0, -1));
    if(IRREG[w]) IRREG[w].split(" ").forEach(x => set.add(x));
    return "(?:" + [...set].sort((a, b) => b.length - a.length).map(reEsc).join("|") + ")";
  }
  function phraseRe(phrase){
    const toks = String(phrase).toLowerCase().split(/[\s\-]+/).map(t => t.replace(/[^a-z']/g, "")).filter(Boolean);
    const content = toks.filter(t => !ANY.test(t)).map(tokenAlt);
    if(!content.length) return null;
    const GAP = "(?:[\\s\\-,.'’]+[A-Za-z']+){0,3}[\\s\\-,.'’]+";
    try{ return new RegExp("(^|[^A-Za-z])(" + content.join(GAP) + ")(?![A-Za-z])", "i"); }catch(e){ return null; }
  }
  const RE_CACHE = {};
  const wordRe = w => (w in RE_CACHE) ? RE_CACHE[w] : (RE_CACHE[w] = phraseRe(w));
  const hasSentence = w => { const re = wordRe(w[0]); return !!(re && re.test(w[3])); };
  function sentenceQ(t, i){ const w = t.words[i]; const re = wordRe(w[0]); const m = re && w[3].match(re); if(!m) return meaningQ(t, i); if(m[2].split(/\s+/).length / w[3].split(/\s+/).length > 0.6) return meaningQ(t, i); const q = w[3].replace(re, "$1______"); const pool = [...t.words.filter(x => x !== w), ...V.filter(x => x.lvl === t.lvl && x !== t).flatMap(x => x.words)]; const dis = pickDistract(pool, w[0], 3, x => x[0]); const opts = shuffle([w[0], ...dis]); return { id: wid(t, i), kind: "sentence", q, sub: w[4], opts, a: opts.indexOf(w[0]), ex: `${w[3]} — ${w[4]}`, sayAfter: w[3], hint: "اختر الكلمة الصحيحة (قد تكون في الجملة بصيغة مختلفة)" }; }
  function grammarQ(l, i){ const p = l.practice[i]; return { id: `gg-${l.id}-${i}`, kind: "grammar", q: p.q, sub: l.t, opts: p.o, a: p.a, ex: p.ex, lesson: l.id }; }
  function dialogQ(d, i){ const lines = d.lines; const line = lines[i]; if(!line || line[0] !== "B" || i === 0) return null; const prev = lines[i - 1]; const others = D.filter(x => x !== d).flatMap(x => x.lines.filter(y => y[0] === "B" && y[1] !== line[1])).map(y => y[1]); const dis = pickDistract(others, line[1], 2, x => x); const opts = shuffle([line[1], ...dis]); return { id: `gd-${d.id}-${i}`, kind: "dialog", q: `${prev[1]}`, sub: `${d.t} · ${d.roles[0]} يقول — ما الرد المناسب؟`, opts, a: opts.indexOf(line[1]), ex: line[2], say: prev[1] }; }
  const randomWordQ = (t, i) => [meaningQ, reverseQ, sentenceQ][Math.floor(Math.random() * 3)](t, i);
  function themeQs(t, n, builder){ const idx = shuffle(t.words.map((_, i) => i)).slice(0, n || t.words.length); return idx.map(i => (builder || randomWordQ)(t, i)); }
  function dueWordIds(){ const now = Date.now(); return Object.entries(Progress.data.q).filter(([id, r]) => id.startsWith("gw-") && r.n && r.due <= now).map(([id]) => id); }
  function qFromWordId(id){ const m = id.match(/^gw-(.+)-(\d+)$/); if(!m) return null; const t = theme(m[1]); return t && t.words[+m[2]] ? randomWordQ(t, +m[2]) : null; }
  function levelThemes(lvl){ return V.filter(t => t.lvl === lvl); }
  const spellable = t => t.words.map((_, i) => i).filter(i => t.words[i][0].length <= 12 && !t.words[i][0].includes(" "));
  function currentLevel(){ for(const lv of LV){ const units = U.filter(u => u.lvl === lv); if(units.some(u => !GEN.units[u.id])) return lv; } return "B2"; }

  /* ---------- router ---------- */
  const routes = {};
  function go(h){ location.hash = "#/" + h; }
  const NAV_STACK = [];
  function route(){
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/");
    const name = parts[0] || "home"; const fn = routes[name] || routes.home;
    /* سجل تنقّل داخلي: زر «رجوع» يرجعك للصفحة اللي جيت منها فعلًا */
    const h = location.hash || "#/";
    if(name !== "next"){ if(NAV_STACK.length > 1 && NAV_STACK[NAV_STACK.length - 2] === h) NAV_STACK.pop(); else if(NAV_STACK[NAV_STACK.length - 1] !== h) NAV_STACK.push(h); if(NAV_STACK.length > 30) NAV_STACK.shift(); }
    stopTimers(); window.scrollTo(0, 0);
    fn(...parts.slice(1));
  }
  let timers = []; const after = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; }; const every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(t); return t; };
  function stopTimers(){ timers.forEach(t => { if(t && typeof t.clear === "function") t.clear(); else { clearTimeout(t); clearInterval(t); } }); timers = []; clearTimeout(speakTimer); hush(); }
  const render = html => { $("#app").innerHTML = html; hydrateIcons($("#app")); };
  const crumb = (items) => { const back = [...items].reverse().find(x => x.href); const prev = NAV_STACK.length > 1 ? NAV_STACK[NAV_STACK.length - 2] : null; return `<div class="crumbs"><a class="back-btn" href="${prev || (back ? back.href : "#/")}">${I("arrow")} رجوع</a><a href="#/">${I("home")} إنقلش عام</a>${items.map(x => ` <span>›</span> ${x.href ? `<a href="${x.href}"><bdi>${x.t}</bdi></a>` : `<b><bdi>${x.t}</bdi></b>`}`).join("")}</div>`; };
  const bar = (pct, cls) => `<div class="progress"><div class="${cls || ""}" style="width:${pct}%"></div></div>`;

  /* ---------- progress helpers ---------- */
  function unitPct(u){
    if(GEN.units[u.id]) return 100;
    const ths = u.themes.map(theme).filter(Boolean);
    let k = 0, n = 0; ths.forEach(t => { const s = themeStats(t); k += s.k; n += s.n; });
    if(!ths.length && u.grammar && lesson(u.grammar)){ const l = lesson(u.grammar); n = l.practice.length; k = l.practice.filter((_, i) => known(`gg-${l.id}-${i}`)).length; }
    return n ? Math.round(k / n * 70) : 0;
  }
  function levelPct(lv){ const units = U.filter(u => u.lvl === lv); if(!units.length) return 0; return Math.round(units.reduce((a, u) => a + unitPct(u), 0) / units.length); }
  function nextUnit(){ return U.find(u => !GEN.units[u.id]) || U[U.length - 1]; }
  const themeDone = t => themeStats(t).pct >= 100;
  const lessonDone = l => { const ids = l.practice.map((_, i) => `gg-${l.id}-${i}`); return ids.filter(known).length >= Math.min(5, ids.length); };
  const dialogDone = d => { const ids = d.lines.map((ln, i) => ln[0] === "B" && i > 0 ? `gd-${d.id}-${i}` : null).filter(Boolean); return ids.length ? ids.filter(known).length >= Math.ceil(ids.length * .5) : true; };
  const dialogsOf = u => (Array.isArray(u.dialogue) ? u.dialogue : u.dialogue ? [u.dialogue] : []).map(dialog).filter(Boolean);
  function unitSteps(u){
    const steps = [];
    u.themes.map(theme).filter(Boolean).forEach(t => steps.push({ kind: "theme", t, done: themeDone(t), href: `#/theme/${t.id}`, label: "كلمات: " + t.t }));
    const l = u.grammar ? lesson(u.grammar) : null; if(l) steps.push({ kind: "lesson", l, done: lessonDone(l), href: `#/lesson/${l.id}`, label: "القاعدة: " + l.t });
    dialogsOf(u).forEach(d => steps.push({ kind: "dialogue", d, done: dialogDone(d), href: `#/dialogue/${d.id}`, label: "المحادثة: " + d.t }));
    steps.push({ kind: "test", done: !!GEN.units[u.id], href: `#/unittest/${u.id}`, label: "اختبار الوحدة" });
    return steps;
  }
  function nextStepOf(u){ return unitSteps(u).find(s => !s.done) || unitSteps(u).slice(-1)[0]; }
  function unitOfTheme(id){ return U.find(u => u.themes.includes(id)); }
  function nextAfterTheme(t){ // بعد إنهاء كلمات موضوع: الخطوة التالية في وحدته
    const u = unitOfTheme(t.id); if(!u) return null; const s = nextStepOf(u); if(!s) return null;
    if(s.kind === "theme" && s.t === t) return null; return s;
  }

  /* مسار الوحدة في الشريط العلوي: A1 › الوحدة 3 › ... */
  const unitPath = u => u ? [{ t: u.lvl, href: `#/level/${u.lvl}` }, { t: `الوحدة ${U.filter(x => x.lvl === u.lvl).indexOf(u) + 1}`, href: `#/unit/${u.id}` }] : [];
  /* تبويبات المستويات: تعرض مستواك الحالي أولًا بدل قائمة طويلة */
  function levelTabs(key){
    const secs = [...document.querySelectorAll("#app .section[data-lv]")]; if(secs.length < 2) return;
    const lvls = secs.map(x => x.dataset.lv);
    let cur = Store.get("gen_tab_" + key, null); if(cur !== "all" && !lvls.includes(cur)) cur = lvls.includes(currentLevel()) ? currentLevel() : lvls[0];
    secs[0].insertAdjacentHTML("beforebegin", `<div class="seg lv-tabs">${lvls.map(lv => `<button type="button" data-v="${lv}" style="--c:${LVC[lv]}">${lv}</button>`).join("")}<button type="button" data-v="all">الكل</button></div>`);
    const bar_ = $("#app .lv-tabs");
    const apply = () => { secs.forEach(x => { x.hidden = cur !== "all" && x.dataset.lv !== cur; }); bar_.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.v === cur)); };
    bar_.addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; cur = b.dataset.v; Store.set("gen_tab_" + key, cur); apply(); });
    apply();
  }
  /* ---------- HOME ---------- */
  /* يوديك مباشرة لخطوتك التالية (من نافذة الحضور اليومي وغيرها) */
  routes.next = () => { const ns = nextStepOf(nextUnit()); location.replace(ns ? ns.href : "#/"); };
  routes.home = () => {
    const xp = xpNext(GEN.xp), meU = Auth.user(), dl = meU ? Store.get("step_daily_last_" + meU.u, null) : null;
    const flame = dl && dl.streak ? dl.streak : Progress.streak();
    const all = allWords(); const kn = all.filter(x => known(wid(x.t, x.i))).length;
    const due = dueWordIds().length; const daily = GEN.daily[dayKey()];
    const cur = currentLevel(), nu = nextUnit(), nuIdx = U.filter(u => u.lvl === nu.lvl).indexOf(nu) + 1, ns = nextStepOf(nu);
    render(`
      <section class="hero gen-hero gen-simple">
        <h1>تعلّم الإنجليزية <mark>خطوة بخطوة</mark></h1>
        <p>مستواك الآن <b>${cur} · ${LVN[cur]}</b> · الوحدة <b>${nuIdx} — ${esc(nu.t)}</b><br><span class="small">خطوتك التالية: ${esc(ns.label)}</span></p>
        <div class="actions"><a class="btn btn-light" href="${ns.href}">${I("zap")} أكمل التعلّم</a><a class="btn btn-outline-light" href="#/daily">${I("calendar")} تحدي اليوم${daily ? " ✓" : ""} ${ptsTag()}</a>${due ? `<a class="btn btn-outline-light" href="#/review">${I("repeat")} راجع ${due} ${due > 10 || due < 3 ? "كلمة" : "كلمات"}</a>` : ""}</div>
      </section>
      <div class="gen-stats">
        <div class="gs">${emo("star", "gs-emo")}<div class="gs-b"><div class="gs-n">${GEN.xp}</div><div class="gs-l">XP · المستوى ${xp.l}</div>${bar(Math.round(xp.cur / xp.need * 100))}</div></div>
        <div class="gs">${emo("fire", "gs-emo")}<div class="gs-b"><div class="gs-n">${flame}</div><div class="gs-l">${flame === 1 ? "يوم ورا بعض" : "أيام ورا بعض"}</div></div></div>
        <div class="gs">${emo("check", "gs-emo")}<div class="gs-b"><div class="gs-n">${kn}</div><div class="gs-l">كلمة تعرفها من ${all.length}</div></div></div>
        <a class="gs pts" href="account.html#points" id="ptsCard">${emo("trophy", "gs-emo")}<div class="gs-b"><div class="gs-n" id="ptsCardN">${Auth.user() ? "…" : "—"}</div><div class="gs-l" id="ptsCardSub">${Auth.user() ? "نقاط المنافسة" : "سجّل الدخول لتجمع نقاطًا"}</div></div></a>
      </div>
      <details class="pts-where small muted"><summary>${I("trophy")} وين تاخذ نقاط؟</summary><p>اختبار الموضوع، اختبار الوحدة، تدريب القاعدة، تحدي اليوم، الألعاب، تمثيل الدور، تصريف الأفعال، وأسئلة القصص — كل سؤال تجيبه صح <b>لأول مرة</b> = نقطة. البطاقات والمراجعة بدون نقاط، و XP لمستواك الشخصي فقط.</p></details>
      <section class="section"><div class="section-title"><h2>المستويات</h2><span class="muted small">التقدم يزيد مع كل كلمة تتعلمها ويكتمل باختبار الوحدة</span></div>
        <div class="lvl-list">${LV.map(lv => { const units = U.filter(u => u.lvl === lv), done = units.filter(u => GEN.units[u.id]).length, pct = levelPct(lv); const st = pct === 100 ? "done" : lv === cur ? "cur" : ""; return `<a class="lvl-row ${st}" href="#/level/${lv}" style="--c:${LVC[lv]}"><div class="lvl-badge" style="background:${LVC[lv]}">${lv}</div><div class="lvl-body"><div class="lvl-head"><b>${LVN[lv]}</b><span class="lvl-pct">${pct}%</span></div>${bar(pct)}<div class="small muted">${done}/${units.length} وحدة مكتملة${lv === cur ? " · <b>أنت هنا</b>" : ""}</div></div>${I("arrow")}</a>`; }).join("")}</div>
      </section>
      <section class="section"><div class="section-title"><h2>كل الأقسام</h2></div>
        <div class="grid grid-4 gen-menu">
          <a class="card link-card c-violet" href="#/vocab"><div class="menu-emo">${emo("books")}</div><h3>المفردات</h3><p class="muted small">${all.length} كلمة في ${V.length} موضوعًا</p></a>
          <a class="card link-card c-green" href="#/grammar"><div class="menu-emo">${emo("memo")}</div><h3>القواعد</h3><p class="muted small">${G.length} درسًا: متى ولماذا</p></a>
          <a class="card link-card c-teal" href="#/talk"><div class="menu-emo">${emo("talk")}</div><h3>المحادثة</h3><p class="muted small">${D.length} حوارًا تسمعه وتنطقه</p></a>
          <a class="card link-card c-rose" href="#/games"><div class="menu-emo">${emo("game")}</div><h3>الألعاب</h3><p class="muted small">سباق، طابق، رتّب الحروف</p></a>
          <a class="card link-card c-amber" href="library.html"><div class="menu-emo">${emo("book")}</div><h3>القصص والروايات</h3><p class="muted small">اقرأ واستمع بصوت قارئ — من A1 إلى C2</p></a>
          <a class="card link-card c-blue" href="#/verbs"><div class="menu-emo">${emo("repeat")}</div><h3>تصريف الأفعال</h3><p class="muted small">${(window.GEN_VERBS || []).length} فعلًا: الماضي، بعد have، وing — مع بحث واختبار</p></a>
        </div>
      </section>`);
    if(Auth.user()) Auth.api("/api/me").then(m => { const n = $("#ptsCardN"), sub = $("#ptsCardSub"); if(n) n.textContent = m.points || 0; if(sub) sub.textContent = "نقطة" + (m.monthRank ? ` · البطولة #${m.monthRank}` : m.rank ? ` · #${m.rank}` : ""); }).catch(() => {});
  };

  /* ---------- تصريف الأفعال ---------- */
  const VB = window.GEN_VERBS || [];
  const CVC = /[^aeiou][aeiou][^aeiouwxy]$/;
  const ingOf = b => b === "be" ? "being" : /ie$/.test(b) ? b.slice(0, -2) + "ying" : /[^e]e$/.test(b) ? b.slice(0, -1) + "ing" : (b.length <= 5 && CVC.test(b) && !/^(open|visit|enter|offer|order|cover|answer|listen|happen|travel|suffer|wonder)$/.test(b)) ? b + b.slice(-1) + "ing" : b + "ing";
  const thirdOf = b => b === "be" ? "is" : b === "have" ? "has" : /[^aeiou]y$/.test(b) ? b.slice(0, -1) + "ies" : /(s|x|z|ch|sh|o)$/.test(b) ? b + "es" : b + "s";
  routes.verbs = () => {
    let f = "all", q = "";
    const rows = () => VB.filter(v => f === "all" || (f === "irr") === !!v[4]).filter(v => !q || [v[0], v[1], v[2], v[3]].join(" ").toLowerCase().includes(q))
      .map(v => `<tr><td class="en"><b>${esc(v[0])}</b> ${spk(v[0], "sm")}</td><td class="en">${esc(v[1])}</td><td class="en">${esc(v[2])}</td><td class="en">${esc(ingOf(v[0]))}</td><td class="en">${esc(thirdOf(v[0]))}</td><td>${esc(v[3])}${v[5] ? `<div class="small muted en" style="direction:ltr;text-align:left">${esc(v[5])}</div><div class="small muted">${esc(v[6] || "")}</div>` : ""}</td></tr>`).join("");
    render(crumb([{ t: "تصريف الأفعال" }]) + `<div class="card sheet"><div class="section-title"><h1 style="margin:0">${I("list")} تصريف الأفعال</h1><span class="badge">${VB.length} فعلًا</span></div>
      <p class="muted small" style="margin:6px 0 10px">الأفعال الشاذة أولًا (اللي ما تأخذ ed)، ثم أفعال منتظمة شائعة. اضغط ${I("headphones")} لتسمع الفعل، وابحث بالإنجليزي أو العربي.</p>
      <input class="input" id="vq" placeholder="ابحث: go, went, ذهب…" autocomplete="off">
      <div class="btn-row" style="margin-top:10px"><span class="seg seg-sm" id="vf"><button type="button" data-f="all" class="on">الكل</button><button type="button" data-f="irr">الشاذة</button><button type="button" data-f="reg">المنتظمة</button></span><a class="btn btn-sm btn-warm" href="#/verbquiz">${I("pencil")} اختبرني ${ptsTag()}</a></div></div>
      <div class="table-wrap"><table class="gtable vtable"><thead><tr><th>الفعل</th><th>الماضي<div class="small muted">yesterday</div></th><th>بعد have / was<div class="small muted">have gone</div></th><th>ing<div class="small muted">is going</div></th><th>مع he / she / it</th><th>المعنى ومثال</th></tr></thead><tbody id="vbody">${rows()}</tbody></table></div>`);
    const refresh = () => { $("#vbody").innerHTML = rows(); hydrateIcons($("#vbody")); };
    $("#vq").addEventListener("input", e => { q = e.target.value.trim().toLowerCase(); refresh(); });
    $("#vf").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; f = b.dataset.f; $("#vf").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); refresh(); });
  };
  routes.verbquiz = () => {
    const pool = shuffle(VB.filter(v => v[4])).slice(0, 12);
    const list = pool.map(v => { const kind = Math.random() < .6 ? 1 : 2; const correct = v[kind].split("/")[0].trim(); const dis = shuffle(VB.filter(x => x !== v).map(x => x[kind].split("/")[0].trim()).filter(x => x !== correct)).slice(0, 3); const opts = shuffle([correct, ...dis]); return { id: `vb-${v[0]}-${kind}`, kind: "verb", q: kind === 1 ? `${v[0]}  →  yesterday I ___` : `${v[0]}  →  I have ___`, sub: v[3], opts, a: opts.indexOf(correct), ex: `${v[0]} · ${v[1]} · ${v[2]} — ${v[3]}`, sayAfter: `${v[0]}, ${v[1].split("/")[0].trim()}, ${v[2].split("/")[0].trim()}` }; });
    runQuiz({ title: "اختبار تصريف الأفعال", list, backHref: "#/verbs", xpPer: 4, onDone: (s, n, secs, ids) => { postPoints(s, n, secs, ids); resultCard("تصريف الأفعال", s, n, `<p class="muted">+${s * 4} XP</p>`, "#/verbs", "#/verbquiz"); } });
  };

  /* ---------- GAMES ---------- */
  routes.games = () => {
    render(crumb([{ t: "الألعاب" }]) + `<h1>${I("timer")} الألعاب</h1><p class="muted">ألعاب سريعة على كلمات مستواك. كل إجابة صحيحة تعطيك XP.</p>
      <a class="card link-card battle-card" href="#/battle"><div class="menu-emo">${emo("swords")}</div><h3>معركة الكلمات ${ptsTag()}</h3><p class="muted small">كل جمعة ٨–١٠ مساءً: نفس الكلمات للجميع، والأول يفوز بـ +٣٠ نقطة</p></a>
      <div class="grid grid-3">
        <a class="card link-card c-rose" href="#/game/speed"><div class="menu-emo">${emo("stopwatch")}</div><h3>سباق ٦٠ ثانية ${ptsTag()}</h3><p class="muted small">أكبر عدد من المعاني قبل انتهاء الوقت. أفضل نتيجة: ${GEN.best.speed || 0}</p></a>
        <a class="card link-card c-blue" href="#/game/match"><div class="menu-emo">${emo("link")}</div><h3>طابق الكلمات ${ptsTag()}</h3><p class="muted small">اربط كل كلمة بمعناها.</p></a>
        <a class="card link-card c-amber" href="#/game/spell"><div class="menu-emo">${emo("abc")}</div><h3>رتّب الحروف ${ptsTag()}</h3><p class="muted small">كوّن الكلمة من حروفها المبعثرة.</p></a>
      </div>`);
  };

  /* ---------- LEVEL ---------- */
  routes.level = lv => {
    if(!LV.includes(lv)) return routes.home();
    const units = U.filter(u => u.lvl === lv), done = units.filter(u => GEN.units[u.id]).length, pct = levelPct(lv);
    render(crumb([{ t: `${lv} — ${LVN[lv]}` }]) + `<div class="card sheet lvl-top" style="--c:${LVC[lv]}"><div class="section-title"><div class="lvl-badge" style="background:${LVC[lv]}">${lv}</div><h1 style="margin:0">${LVN[lv]}</h1><span class="lvl-pct big">${pct}%</span></div>${bar(pct)}<p class="muted small" style="margin:8px 0 0">${done}/${units.length} وحدة مكتملة. أكمل الوحدات بالترتيب: مفردات ← قاعدة ← محادثة ← اختبار قصير.</p></div>
      <div class="units">${units.map((u, i) => { const d = !!GEN.units[u.id], p = unitPct(u), here = !d && u === units.find(x => !GEN.units[x.id]); const dots = unitSteps(u).map(st => `<span class="ustep ${st.done ? "ok" : ""}" title="${esc(st.label)}">${st.kind === "theme" ? "📚" : st.kind === "lesson" ? "📝" : st.kind === "dialogue" ? "💬" : "🏆"}</span>`).join(""); return `<a class="unit ${d ? "done" : ""} ${here ? "here" : ""}" href="#/unit/${u.id}">${d ? `<span class="stamp">${I("check")} مكتملة</span>` : ""}<div class="unit-n" style="background:${d ? "var(--ok)" : LVC[lv]}">${d ? I("check") : i + 1}</div><div class="unit-body"><div class="unit-head"><span class="unit-t">${esc(u.t)}</span>${here ? `<span class="badge accent">أنت هنا</span>` : `<span class="lvl-pct">${p}%</span>`}</div>${here ? `<div class="muted small">${esc(u.goal)}</div>` : ""}<div class="ustep-row">${dots}</div>${bar(p)}</div></a>`; }).join("")}</div>`);
    const hereEl = $("#app .unit.here"); if(hereEl && units.indexOf(units.find(x => !GEN.units[x.id])) > 2) after(() => hereEl.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
  };

  /* ---------- UNIT ---------- */
  routes.unit = id => {
    const u = U.find(x => x.id === id); if(!u) return routes.home();
    const steps = unitSteps(u); const ns = steps.find(s => !s.done); const done = !!GEN.units[u.id];
    const cls = s => `step-card ${s.done ? "done" : ""} ${s === ns ? "next" : ""}`;
    const tag = s => s.done ? `<span class="badge ok">${I("check")} مكتمل</span>` : s === ns ? `<span class="badge accent">${I("zap")} الخطوة التالية</span>` : "";
    const num = (s, k) => `<div class="step-n">${s.done ? I("check") : s.kind === "test" ? I("trophy") : k + 1}</div>`;
    render(crumb([{ t: u.lvl, href: `#/level/${u.lvl}` }, { t: u.t }]) + `<div class="card sheet"><div class="section-title"><span class="badge" style="background:${LVC[u.lvl]};color:#fff">${u.lvl}</span><h1 style="margin:0">${esc(u.t)}</h1>${done ? '<span class="badge ok">مكتملة</span>' : ""}</div><p class="muted">${esc(u.goal)}</p>${bar(unitPct(u))}<p class="small muted" style="margin:6px 0 0">${steps.filter(s => s.done).length} من ${steps.length} خطوات مكتملة${ns ? ` · التالي: <b>${esc(ns.label)}</b>` : ""}</p></div>
      <div class="steps">
        ${steps.map((s, k) => {
          if(s.kind === "theme"){ const st = themeStats(s.t); return `<div class="${cls(s)}">${num(s, k)}<div style="flex:1"><div class="step-head"><h3>${I("type")} المفردات: ${esc(s.t.t)}</h3>${tag(s)}</div><p class="muted small">${s.t.words.length} كلمة · تعرف ${st.k} · متقنة ${st.m}</p>${bar(st.pct)}<div class="btn-row"><a class="btn btn-sm ${s.done ? "" : "btn-primary"}" href="#/theme/${s.t.id}">${s.done ? "راجع الكلمات" : "تعلّم الكلمات"}</a><a class="btn btn-sm" href="#/game/flash/${s.t.id}">بطاقات</a><a class="btn btn-sm" href="#/game/quiz/${s.t.id}">اختبار</a></div></div></div>`; }
          if(s.kind === "lesson") return `<div class="${cls(s)}">${num(s, k)}<div style="flex:1"><div class="step-head"><h3>${I("book")} القاعدة: ${esc(s.l.t)}</h3>${tag(s)}</div><p class="muted small">${esc(s.l.why)}</p><div class="btn-row"><a class="btn btn-sm ${s.done ? "" : "btn-primary"}" href="#/lesson/${s.l.id}">${s.done ? "راجع القاعدة" : "افهم القاعدة"}</a><a class="btn btn-sm" href="#/practice/${s.l.id}">تدرّب</a></div></div></div>`;
          if(s.kind === "dialogue") return `<div class="${cls(s)}">${num(s, k)}<div style="flex:1"><div class="step-head"><h3>${I("mic")} المحادثة: ${esc(s.d.t)}</h3>${tag(s)}</div><p class="muted small">${s.d.lines.length} جملة · استمع، مثّل دورك، وانطق. (يكتمل بتمثيل الدور)</p><div class="btn-row"><a class="btn btn-sm ${s.done ? "" : "btn-primary"}" href="#/dialogue/${s.d.id}">افتح المحادثة</a><a class="btn btn-sm" href="#/roleplay/${s.d.id}">مثّل دورك</a></div></div></div>`;
          return `<div class="${cls(s)}">${num(s, k)}<div style="flex:1"><div class="step-head"><h3>اختبار الوحدة</h3>${tag(s)}</div><p class="muted small">١٢ سؤالًا من محتوى الوحدة. النجاح ٧٠٪ فأكثر يكمل الوحدة ويمنحك ١٠٠ XP.</p><div class="btn-row"><a class="btn btn-sm btn-warm" href="#/unittest/${u.id}">${done ? "أعد الاختبار" : "ابدأ الاختبار"} ${ptsTag()}</a></div></div></div>`;
        }).join("")}
      </div>`);
  };

  /* ---------- VOCAB ---------- */
  routes.vocab = () => {
    render(crumb([{ t: "المفردات" }]) + `<h1>${I("type")} المفردات</h1><p class="muted">اختر موضوعًا. الشريط يوضح نسبة الكلمات التي تعرفها (أجبت عليها صحيحًا مرة على الأقل).</p>` +
      LV.map(lv => `<div class="section" data-lv="${lv}"><div class="section-title"><h2 style="color:${LVC[lv]}">${lv} · ${LVN[lv]}</h2></div><div class="grid grid-3 theme-grid">${levelThemes(lv).map(t => { const s = themeStats(t); return `<a class="card link-card theme-card" href="#/theme/${t.id}" style="--c:${LVC[lv]}"><div class="icon" style="background:${LVC[lv]}22">${I(t.icon || "star")}</div><h3>${esc(t.t)}</h3><p class="muted small">${arN(t.words.length, "كلمة", "كلمات")} · ${s.k} تعرفها</p>${bar(s.pct)}</a>`; }).join("")}</div></div>`).join(""));
    levelTabs("vocab");
  };

  routes.theme = id => {
    const t = theme(id); if(!t) return routes.vocab();
    const s = themeStats(t);
    render(crumb(unitOfTheme(t.id) ? [...unitPath(unitOfTheme(t.id)), { t: t.t }] : [{ t: "المفردات", href: "#/vocab" }, { t: t.t }]) + `<div class="card sheet"><div class="section-title"><span class="badge" style="background:${LVC[t.lvl]};color:#fff">${t.lvl}</span><h1 style="margin:0">${esc(t.t)}</h1></div><div class="chips t-chips"><span class="chip">${t.words.length} كلمة</span><span class="chip ok">${I("check")} تعرف ${s.k}</span><span class="chip">${I("star")} متقنة ${s.m}</span></div>${bar(s.pct)}<p class="small muted" style="margin:6px 0 0">اضغط ${I("headphones")} بجانب أي كلمة لتسمع نطقها.</p>
      ${(() => { const ns = themeDone(t) ? nextAfterTheme(t) : null; return ns ? `<div class="note ok" style="margin-top:10px"><span class="ic">${I("check")}</span><p>أنهيت كلمات هذا الموضوع. <a href="${ns.href}"><b>الخطوة التالية: ${esc(ns.label)} ←</b></a></p></div>` : ""; })()}
      <div class="btn-row" style="margin-top:12px"><a class="btn ${themeDone(t) ? "" : "btn-primary"}" href="#/game/flash/${t.id}">${I("cards")} ١) احفظ بالبطاقات</a><a class="btn btn-warm" href="#/game/quiz/${t.id}">${I("pencil")} ٢) اختبر نفسك ${ptsTag()}</a></div><div class="mini-games"><span class="small muted">ألعاب إضافية:</span>${spellable(t).length >= 8 ? `<a class="mg" href="#/game/spell/${t.id}">${I("type")} رتّب الحروف</a>` : ""}<a class="mg" href="#/game/match/${t.id}">${I("cards")} طابق</a>${t.words.filter(hasSentence).length >= 6 ? `<a class="mg" href="#/game/sentence/${t.id}">${I("bookopen")} أكمل الجملة</a>` : ""}</div></div>
      <div class="word-list">${t.words.map((w, i) => { const r = rec(wid(t, i)); const st = mastered(wid(t, i)) ? "ok" : known(wid(t, i)) ? "info" : ""; return `<div class="word-row"><div class="w-en en"><b>${esc(w[0])}</b> <span class="muted small">${esc(w[2])}</span> ${spk(w[0])}</div><div class="w-ar">${esc(w[1])}</div><div class="w-ex en small muted">${esc(w[3])} ${spk(w[3], "sm")}</div><div class="w-exar small muted">${esc(w[4])}</div><span class="badge ${st}" style="justify-self:start">${mastered(wid(t, i)) ? "متقنة" : known(wid(t, i)) ? "تعرفها" : "جديدة"}</span></div>`; }).join("")}</div>`);
  };

  let LAST_WRONG = [], LAST_OPTS = null;
  /* ---------- generic quiz runner (immediate feedback) ---------- */
  function runQuiz(opts){
    // opts: {title, list, backHref, onDone(score,total,secs), xpPer, timed}
    const S = { i: 0, score: 0, done: false, start: Date.now(), list: opts.list, ids: [], lastLeft: null, wrong: [] };
    LAST_WRONG = [];
    const show = () => {
      const q = S.list[S.i]; if(!q) return finish();
      render(`${opts.header || ""}<div class="quiz-top"><h2 style="margin:0;font-size:1.15rem">${opts.title}</h2><div class="btn-row"><span class="badge ok">${I("check")} ${S.score}</span><span class="badge info">${S.i + 1} / ${S.list.length}</span>${opts.timed ? `<span class="timer" id="gt">--</span>` : ""}</div></div>${bar(S.i / S.list.length * 100)}
        <div class="card q-card"><div class="btn-row" style="justify-content:space-between"><span class="badge">${q.kind === "meaning" ? "ما معنى الكلمة؟" : q.kind === "reverse" ? "ما الكلمة الإنجليزية؟" : q.kind === "sentence" ? "أكمل الجملة" : q.kind === "grammar" ? "قاعدة: " + esc(q.sub || "") : q.kind === "dialog" ? "محادثة" : "سؤال"}</span>${q.say ? spk(q.say) : ""}</div>
        <div class="q-text ${q.kind === "reverse" ? "" : "en"}" style="${q.kind === "reverse" ? "direction:rtl;text-align:right;font-family:inherit" : ""}">${esc(q.q)}</div>${q.sub && q.kind !== "grammar" ? `<div class="muted small" style="margin-top:-8px;margin-bottom:10px">${esc(q.sub)}</div>` : ""}${q.hint ? `<div class="muted small" style="margin-bottom:10px">${I("bulb")} ${esc(q.hint)}</div>` : ""}
        <div class="opts-list" id="gopts">${q.opts.map((o, k) => `<button type="button" class="opt ${q.kind === "meaning" ? "ar" : ""}" data-k="${k}"><span class="letter">${L[k]}</span><span>${esc(o)}</span></button>`).join("")}</div>
        <div class="feedback" id="gfb" hidden></div>
        <div class="quiz-nav" style="justify-content:space-between"><a class="btn btn-sm" href="${opts.backHref || "#/"}">خروج</a><button type="button" class="btn btn-primary" id="gnext" disabled>التالي ←</button></div></div>`);
      if(q.say && opts.autoSay) after(() => speak(q.say), 150);
      $("#gopts").querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => answer(+b.dataset.k)));
      $("#gnext").addEventListener("click", next);
      if(opts.timed) tick();
    };
    const answer = k => {
      if(S.done) return; S.done = true; const q = S.list[S.i]; const ok = k === q.a;
      $("#gopts").querySelectorAll(".opt").forEach(b => { b.disabled = true; if(+b.dataset.k === q.a) b.classList.add("correct"); else if(+b.dataset.k === k) b.classList.add("wrong"); });
      const wasM = mastered(q.id); Progress.record(q.id, ok); sfx(ok ? "correct" : "wrong"); if(!ok) S.wrong.push({ q, chosen: k }); if(ok){ S.score++; S.ids.push(q.id); if(opts.xpPer && !wasM) gainXP(opts.xpPer, true); else saveGen(); }
      const fb = $("#gfb"); fb.hidden = false; fb.className = "feedback " + (ok ? "ok" : "bad");
      const sayNow = q.sayAfter || (!opts.autoSay && q.kind !== "dialog" ? q.say : null);
      fb.innerHTML = `<b>${ok ? I("check") + " صحيح!" : I("x") + " الصحيح: " + esc(q.opts[q.a])}</b>${esc(q.ex || "")} ${sayNow ? spk(sayNow, "sm") : ""}${q.lesson ? ` <a class="mini-link" href="#/lesson/${q.lesson}">${I("book")} افهم القاعدة</a>` : ""}`;
      hydrateIcons(fb); $("#gnext").disabled = false; $("#gnext").focus({ preventScroll: true });
      if(sayNow) after(() => speak(sayNow), 350);
      /* الإجابة الصحيحة تنتقل تلقائيًا (الخطأ ينتظرك تقرأ التصحيح) */
      if(ok && !opts.noAuto){ const my = S.i, wait = sayNow ? Math.min(5000, 1000 + String(sayNow).split(/\s+/).length * 380) : 1100; const nb = $("#gnext"); nb.classList.add("auto"); nb.style.setProperty("--wait", wait + "ms"); after(() => { if(S.i === my && S.done) next(); }, wait); }
    };
    const next = () => { if(!S.done) return; hush(); S.i++; S.done = false; show(); };
    const tick = () => { if(!opts.timed) return; const el = $("#gt"); if(!el) return; const left = Math.max(0, opts.timed - Math.round((Date.now() - S.start) / 1000)); el.textContent = left + "s"; el.classList.toggle("low", left <= 10); if(left !== S.lastLeft){ S.lastLeft = left; if(left <= 0) sfx("timeout"); else if(left <= 10) sfx("tick"); } if(left <= 0) return finish(); after(tick, 500); };
    const finish = () => { hush(); LAST_WRONG = S.wrong.slice(); LAST_OPTS = opts; const secs = Math.round((Date.now() - S.start) / 1000); opts.onDone(S.score, S.list.length, secs, S.ids); };
    const keyH = e => { if(/^[1-4]$/.test(e.key)){ const b = document.querySelectorAll("#gopts .opt")[+e.key - 1]; if(b && !b.disabled) b.click(); } else if(e.key === "Enter" || e.key === "ArrowLeft") next(); };
    document.addEventListener("keydown", keyH); timers.push({ clear(){ document.removeEventListener("keydown", keyH); } });
    show();
  }
  function resultCard(title, score, total, extra, backHref, againHref, nextStep){
    hush(); stopTimers();
    const pct = total ? Math.round(score / total * 100) : 0; if(pct >= 80 && total) confetti();
    render(`<div class="card center sheet fade-up"><div class="score-ring" style="--p:${pct}"><span>${pct}%</span></div><h2>${score} من ${total}</h2><h3 class="muted" style="font-weight:600">${title}</h3>${extra || ""}<div id="ptsBox" class="pts-slot">${Auth.user() ? "" : `<p class="small muted">${I("lock")} <a href="account.html">سجّل الدخول</a> لتُحسب نقاطك في المنافسة.</p>`}</div>
      ${nextStep ? `<a class="btn btn-warm btn-lg next-btn" href="${nextStep.href}"><span>${I("zap")} الخطوة التالية ←</span><small>${mixed(nextStep.label)}</small></a>` : ""}
      ${total ? `<p class="res-cheer">${pct >= 100 ? `${emo("party")} كاملة! ما شاء الله` : pct >= 80 ? `${emo("muscle")} ممتاز، قربت تتقنها` : pct >= 50 ? "زين! أعد الأخطاء وتصير أقوى" : "لا بأس — الكلمات الجديدة تحتاج تكرار. أعد الأخطاء بس"}</p>` : ""}
      <div class="btn-row res-actions">${LAST_WRONG.length ? `<button type="button" class="btn ${nextStep ? "" : "btn-primary"}" id="retryWrong">${I("target")} أعد الأخطاء (${LAST_WRONG.length})</button>` : ""}${againHref ? `<button type="button" class="btn ${nextStep || LAST_WRONG.length ? "" : "btn-primary"}" id="againBtn">${I("refresh")} مرة أخرى</button>` : ""}<a class="btn" href="${backHref || "#/"}">رجوع</a></div>
      ${LAST_WRONG.length ? `<details class="mistakes" ${LAST_WRONG.length <= 3 ? "open" : ""}><summary>${I("list")} شوف أخطاءك وتصحيحها (${LAST_WRONG.length})</summary>${LAST_WRONG.map(x => `<div class="mk"><div class="mk-q en">${esc(x.q.q)}</div><div class="mk-a"><span class="bad-ans">${esc(x.q.opts[x.chosen])}</span> <span class="ok-ans">${esc(x.q.opts[x.q.a])}</span>${x.q.sayAfter || x.q.say ? `<button type="button" class="spk sm" data-say="${esc(x.q.sayAfter || x.q.say)}">${I("headphones")}</button>` : ""}</div>${x.q.ex ? `<div class="small muted">${esc(x.q.ex)}</div>` : ""}</div>`).join("")}</details>` : ""}</div>`);
    if(againHref) $("#againBtn").addEventListener("click", () => { if(location.hash === againHref) route(); else location.hash = againHref; });
    const rw = $("#retryWrong");
    if(rw) rw.addEventListener("click", () => {
      const list = LAST_WRONG.map(x => x.q); const base = LAST_OPTS || {};
      runQuiz({ title: "مراجعة أخطائك", list, backHref: base.backHref || backHref, xpPer: 0, autoSay: base.autoSay,
        onDone: (sc, n) => resultCard("مراجعة أخطائك", sc, n, `<p class="muted">هذه الجولة للمراجعة فقط — بلا نقاط جديدة.</p>`, backHref || "#/", againHref) });
    });
  }

  routes.game = (kind, tid) => {
    const t = tid && tid !== "all" ? theme(tid) : null;
    if(kind === "quiz" || kind === "sentence"){
      const src = t || levelThemes(currentLevel())[0]; const n = Math.min(12, src.words.length);
      const list = themeQs(src, n, kind === "sentence" ? sentenceQ : null);
      return runQuiz({ title: (kind === "sentence" ? "أكمل الجملة — " : "اختبار المعنى — ") + src.t, list, backHref: `#/theme/${src.id}`, xpPer: 5, onDone: (s, n2, secs, ids) => { postPoints(s, n2, secs, ids); resultCard(src.t, s, n2, `<p class="muted">+${s * 5} XP</p>`, `#/theme/${src.id}`, `#/game/${kind}/${src.id}`, nextAfterTheme(src)); } });
    }
    if(kind === "flash") return flashGame(t || levelThemes(currentLevel())[0]);
    if(kind === "spell") return spellGame(t);
    if(kind === "match") return matchGame(t);
    if(kind === "speed") return speedGame();
    routes.home();
  };

  /* ---------- flashcards ---------- */
  function flashGame(t){
    const all = t.words.map((_, i) => i); const fresh = shuffle(all.filter(i => !known(wid(t, i)))), old = shuffle(all.filter(i => known(wid(t, i))));
    let deck = [...fresh, ...old], pos = 0, flipped = false, ok = 0, mark = null; const total0 = deck.length; const again = {};
    const keyH = e => { if(!$("#fc")) return; if(e.key === " "){ e.preventDefault(); $("#fc").click(); } else if(e.key === "ArrowLeft" && mark) mark(true); else if(e.key === "ArrowRight" && mark) mark(false); };
    document.addEventListener("keydown", keyH); timers.push({ clear(){ document.removeEventListener("keydown", keyH); } });
    const show = () => {
      if(pos >= deck.length){ mark = null; return resultCard("بطاقات " + t.t, ok, total0, `<p class="muted">${fresh.length ? "بدأنا بالكلمات الجديدة أولًا. " : ""}الكلمات التي قلت «ما أعرفها» سترجع لك في المراجعة.</p>`, `#/theme/${t.id}`, `#/game/flash/${t.id}`, { href: `#/game/quiz/${t.id}`, label: "اختبر نفسك في كلمات " + t.t + " (فيه نقاط)" }); }
      const w = t.words[deck[pos]];
      render(crumb([{ t: t.t, href: `#/theme/${t.id}` }, { t: "بطاقات" }]) + `<div class="flash-wrap"><div class="muted small">${Math.min(pos + 1, deck.length)} / ${deck.length}${deck.length > total0 ? " (منها " + (deck.length - total0) + " معادة)" : ""}</div>${bar(pos / deck.length * 100)}
        <div class="flashcard ${flipped ? "flipped" : ""}" id="fc"><div class="inner"><div class="face front">${esc(w[0])}<small>${esc(w[2])} · اضغط لعرض المعنى</small></div><div class="face back"><div class="syn">${esc(w[1])}</div><div class="ar en small" style="opacity:.95">${esc(w[3])}</div><div class="small" style="opacity:.9">${esc(w[4])}</div></div></div></div>
        <div class="btn-row" style="justify-content:center">${spk(w[0], "big")}${SR ? `<button type="button" class="btn" id="fmic" title="انطق الكلمة">${I("mic")}</button>` : ""}<button type="button" class="btn" id="fno">${I("x")} ما أعرفها</button><button type="button" class="btn btn-primary" id="fyes">${I("check")} أعرفها</button></div>
        <div id="fsay" class="fsay" hidden></div>
        <p class="small muted touch-hint">اسحب البطاقة: يسار = أعرفها · يمين = ما أعرفها · ${I("mic")} جرّب تنطقها</p>
        <p class="small muted kbd-hint">مسافة = اقلب · سهم يسار = أعرفها · سهم يمين = ما أعرفها</p></div>`);
      after(() => speak(w[0]), 120);
      $("#fc").addEventListener("click", () => { if(swiped){ swiped = false; return; } flipped = !flipped; $("#fc").classList.toggle("flipped", flipped); });
      /* سحب البطاقة بالإصبع */
      let sx = null, sy = 0, swiped = false; const fcEl = $("#fc");
      fcEl.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      fcEl.addEventListener("touchmove", e => { if(sx === null) return; const dx = e.touches[0].clientX - sx; if(Math.abs(dx) > Math.abs(e.touches[0].clientY - sy)){ fcEl.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`; fcEl.classList.toggle("sw-yes", dx < -50); fcEl.classList.toggle("sw-no", dx > 50); } }, { passive: true });
      fcEl.addEventListener("touchend", e => { if(sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; fcEl.style.transform = ""; fcEl.classList.remove("sw-yes", "sw-no"); if(Math.abs(dx) > 70){ swiped = true; setTimeout(() => { swiped = false; }, 400); mark(dx < 0); } });
      const fm = $("#fmic");
      if(fm) fm.addEventListener("click", () => {
        if(fm.classList.contains("on")) return; hush(); fm.classList.add("on");
        const box = $("#fsay"); box.hidden = false; box.className = "fsay"; box.textContent = "… قلها الحين";
        Speech.listen(res => {
          fm.classList.remove("on"); const b2 = $("#fsay"); if(!b2) return;
          if(!res){ b2.className = "fsay bad"; b2.textContent = "ما سمعت شي — قرّب الجوال وجرّب"; return; }
          const r = Speech.evaluate(w[0], res);
          const good = r.score >= 70;
          b2.className = "fsay " + (good ? "ok" : "bad");
          b2.innerHTML = good ? `${I("check")} ${r.score >= 100 ? "نطق ممتاز!" : "زين!"}` : `${I("x")} سمعت: <b class="en">${esc(res[0])}</b> — اسمعها وجرّب مرة ثانية`;
          hydrateIcons(b2); sfx(good ? "correct" : "wrong");
          if(!good) after(() => speak(w[0], .8), 500);
        }, null, { silence: 900, max: 5000, first: 5000 });
      });
      mark = yes => {
        hush(); const idx = deck[pos]; const wasM = mastered(wid(t, idx));
        Progress.record(wid(t, idx), yes);
        if(yes){ ok++; if(!wasM) gainXP(2, true); else saveGen(); }
        else { again[idx] = (again[idx] || 0) + 1; if(again[idx] <= 2){ deck.push(idx); toast("سترجع لك هذه الكلمة قبل نهاية الجولة", 1800); } }
        pos++; flipped = false; show();
      };
      $("#fyes").addEventListener("click", () => mark(true)); $("#fno").addEventListener("click", () => mark(false));
    };
    show();
  }

  /* ---------- spelling ---------- */
  function spellGame(t){
    const src = t || levelThemes(currentLevel())[Math.floor(Math.random() * 3)];
    const idx = shuffle(spellable(src)).slice(0, 10);
    if(!idx.length){ toast("هذا الموضوع عبارات وليس كلمات مفردة — جرّب «طابق» أو الاختبار"); return go("theme/" + src.id); }
    let pos = 0, score = 0, built = [], sids = [], checked = false;
    const show = () => {
      if(pos >= idx.length){ postPoints(score, idx.length, 0, sids); return resultCard("رتّب الحروف — " + src.t, score, idx.length, `<p class="muted">+${score * 8} XP</p>`, `#/theme/${src.id}`, `#/game/spell/${src.id}`, nextAfterTheme(src)); }
      checked = false;
      const w = src.words[idx[pos]]; const letters = shuffle(w[0].toLowerCase().split("")); built = [];
      render(crumb([{ t: src.t, href: `#/theme/${src.id}` }, { t: "رتّب الحروف" }]) + `<div class="quiz-top"><h2 style="margin:0;font-size:1.15rem">رتّب الحروف</h2><span class="badge info">${pos + 1} / ${idx.length}</span></div>${bar(pos / idx.length * 100)}
        <div class="card q-card center"><div class="muted">المعنى</div><div class="spell-ar">${esc(w[1])}</div><div class="small muted en">${esc(w[3].replace(new RegExp(w[0], "i"), "______"))}</div>
        <div class="spell-out en" id="sout">${"_".repeat(w[0].length).split("").map(() => `<span class="slot"></span>`).join("")}</div>
        <div class="letters" id="letters">${letters.map((c, i) => `<button type="button" class="letter-btn" data-i="${i}" data-c="${c}">${c}</button>`).join("")}</div>
        <div class="feedback" id="sfb" hidden></div>
        <div class="btn-row" style="justify-content:center;margin-top:10px"><button type="button" class="btn btn-sm" id="sundo">${I("refresh")} تراجع</button><button type="button" class="btn btn-sm" id="shint">${I("bulb")} تلميح</button>${spk(w[0])}<button type="button" class="btn btn-primary" id="snext" hidden>التالي ←</button></div></div>`);
      const update = () => { const slots = $("#sout").querySelectorAll(".slot"); slots.forEach((s, i) => s.textContent = built[i] ? built[i].c : ""); if(built.length === w[0].length) check(); };
      const check = () => { if(checked) return; checked = true; $("#sundo").disabled = true; $("#shint").disabled = true; const word = built.map(b => b.c).join(""); const ok = word === w[0].toLowerCase(); const wasM = mastered(wid(src, idx[pos])); Progress.record(wid(src, idx[pos]), ok); sfx(ok ? "correct" : "wrong"); const fb = $("#sfb"); fb.hidden = false; fb.className = "feedback " + (ok ? "ok" : "bad"); fb.innerHTML = ok ? `<b>${I("check")} ممتاز! ${esc(w[0])}</b>` : `<b>${I("x")} الصحيح: ${esc(w[0])}</b>`; hydrateIcons(fb); if(ok){ score++; sids.push(wid(src, idx[pos])); if(!wasM) gainXP(8, true); else saveGen(); } speak(w[0]); $("#snext").hidden = false; $("#letters").querySelectorAll("button").forEach(b => b.disabled = true); };
      $("#letters").querySelectorAll(".letter-btn").forEach(b => b.addEventListener("click", () => { if(b.disabled) return; built.push({ c: b.dataset.c, i: +b.dataset.i }); b.disabled = true; b.classList.add("used"); update(); }));
      $("#sundo").addEventListener("click", () => { const last = built.pop(); if(last){ const b = $("#letters").querySelector(`[data-i="${last.i}"]`); b.disabled = false; b.classList.remove("used"); update(); } });
      $("#shint").addEventListener("click", () => { const n = built.length; const need = w[0].toLowerCase()[n]; const b = [...$("#letters").querySelectorAll(".letter-btn")].find(x => !x.disabled && x.dataset.c === need); if(b) b.click(); });
      $("#snext").addEventListener("click", () => { hush(); pos++; show(); });
    };
    show();
  }

  /* ---------- matching ---------- */
  function matchGame(t){
    const src = t || levelThemes(currentLevel())[Math.floor(Math.random() * 3)];
    const idx = []; const seenAr = new Set(), seenEn = new Set();
    for(const i of shuffle(src.words.map((_, i) => i))){ const w = src.words[i]; if(seenAr.has(w[1]) || seenEn.has(w[0].toLowerCase())) continue; seenAr.add(w[1]); seenEn.add(w[0].toLowerCase()); idx.push(i); if(idx.length === 8) break; }
    const tiles = shuffle([...idx.map(i => ({ i, side: "en", txt: src.words[i][0] })), ...idx.map(i => ({ i, side: "ar", txt: src.words[i][1] }))]);
    let first = null, matched = 0, moves = 0; const start = Date.now();
    render(crumb([{ t: src.t, href: `#/theme/${src.id}` }, { t: "طابق الكلمات" }]) + `<div class="quiz-top"><h2 style="margin:0;font-size:1.15rem">طابق الكلمة بمعناها</h2><div class="btn-row"><span class="badge" id="mmoves">0 حركة</span><span class="timer" id="mt">0s</span></div></div>
      <div class="match-grid">${tiles.map((x, k) => `<button type="button" class="tile ${x.side}" data-k="${k}">${esc(x.txt)}</button>`).join("")}</div><p class="small muted center">اضغط كلمة ثم معناها. ٨ أزواج.</p>`);
    every(() => { const el = $("#mt"); if(el) el.textContent = Math.round((Date.now() - start) / 1000) + "s"; }, 1000);
    document.querySelectorAll(".tile").forEach(b => b.addEventListener("click", () => {
      if(b.classList.contains("done") || b === first) return;
      b.classList.add("sel");
      if(!first){ first = b; if(tiles[+b.dataset.k].side === "en") speak(tiles[+b.dataset.k].txt); return; }
      moves++; $("#mmoves").textContent = moves + " حركة";
      const a = tiles[+first.dataset.k], c = tiles[+b.dataset.k];
      if(a.i === c.i && a.side !== c.side){ first.classList.add("done"); b.classList.add("done"); first.classList.remove("sel"); b.classList.remove("sel"); matched++; Progress.record(wid(src, a.i), true); sfx("coin"); first = null;
        if(matched === idx.length){ const secs = Math.round((Date.now() - start) / 1000); const xp = Math.max(20, 80 - moves * 2); gainXP(xp, true); if(!GEN.best.match || secs < GEN.best.match) GEN.best.match = secs; saveGen(); postPoints(idx.length, idx.length, secs, idx.map(i => wid(src, i))); after(() => resultCard("طابق الكلمات — " + src.t, idx.length, idx.length, `<p class="muted">${moves} حركة · ${secs} ثانية · +${xp} XP</p>`, `#/theme/${src.id}`, `#/game/match/${src.id}`, nextAfterTheme(src)), 500); }
      } else { const f = first; first = null; after(() => { f.classList.remove("sel"); b.classList.remove("sel"); }, 350); if(a.side !== c.side) Progress.record(wid(src, a.side === "en" ? a.i : c.i), false); sfx("wrong"); }
    }));
  }

  /* ---------- speed ---------- */
  function speedGame(){
    const pool = allWords().filter(x => x.t.lvl === "A1" || x.t.lvl === "A2" || known(wid(x.t, x.i)));
    let score = 0, answered = 0, combo = 0, best = GEN.best.speed || 0, lastLeft = null; const sids = []; const start = Date.now(); const DUR = 60;
    const nextQ = () => {
      const x = pool[Math.floor(Math.random() * pool.length)]; const q = Math.random() < .7 ? meaningQ(x.t, x.i) : reverseQ(x.t, x.i);
      render(`<div class="quiz-top"><h2 style="margin:0;font-size:1.15rem">${I("timer")} سباق ٦٠ ثانية</h2><div class="btn-row"><span class="badge ok">${score} نقطة</span>${combo >= 3 ? `<span class="badge accent">${I("fire")} ×${combo}</span>` : ""}<span class="timer" id="st">${DUR}s</span></div></div>
        <div class="card q-card"><div class="badge">${q.kind === "meaning" ? "ما معنى" : "ما الكلمة"}</div><div class="q-text ${q.kind === "meaning" ? "en" : ""}" style="${q.kind === "meaning" ? "" : "direction:rtl;text-align:right;font-family:inherit"}">${esc(q.q)}</div>
        <div class="opts-list" id="gopts">${q.opts.map((o, k) => `<button type="button" class="opt" data-k="${k}"><span class="letter">${L[k]}</span><span>${esc(o)}</span></button>`).join("")}</div></div><p class="small muted center">أفضل نتيجة: ${best} · الأرقام ١–٤ للإجابة</p>`);
      $("#gopts").querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => { const ok = +b.dataset.k === q.a; answered++; Progress.record(q.id, ok); if(ok){ combo++; score += combo >= 3 ? 2 : 1; sids.push(q.id); sfx(combo >= 3 ? "combo" : "correct"); b.classList.add("correct"); } else { combo = 0; sfx("wrong"); b.classList.add("wrong"); $("#gopts").querySelectorAll(".opt")[q.a].classList.add("correct"); } $("#gopts").querySelectorAll(".opt").forEach(x => x.disabled = true); after(nextQ, ok ? 250 : 900); }));
    };
    const keyH = e => { if(/^[1-4]$/.test(e.key)){ const b = document.querySelectorAll("#gopts .opt")[+e.key - 1]; if(b && !b.disabled) b.click(); } };
    document.addEventListener("keydown", keyH); timers.push({ clear(){ document.removeEventListener("keydown", keyH); } });
    const tick = () => { const left = DUR - Math.round((Date.now() - start) / 1000); const el = $("#st"); if(el){ el.textContent = Math.max(0, left) + "s"; el.classList.toggle("low", left <= 10); } if(left !== lastLeft){ lastLeft = left; if(left <= 0) sfx("timeout"); else if(left <= 10) sfx("tick"); } if(left <= 0){ stopTimers(); const nb = score > best; if(nb) GEN.best.speed = score; gainXP(score * 3, true); saveGen(); postPoints(score, Math.max(answered, 1), DUR, sids); resultCard("سباق ٦٠ ثانية", score, Math.max(answered, score), `<p class="muted">${answered} سؤال · +${score * 3} XP ${nb ? "· 🏆 رقم قياسي جديد!" : "· أفضل نتيجة " + best}</p>`, "#/", "#/game/speed"); return; } after(tick, 250); };
    nextQ(); tick();
  }

  /* ---------- معركة الكلمات ---------- */
  function seeded(seed){ let h = 2166136261; for(const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
  routes.battle = async () => {
    render(crumb([{ t: "معركة الكلمات" }]) + `<div class="card center"><p class="muted">جارٍ التحميل…</p></div>`);
    let info; try{ info = await Auth.api("/api/battle"); }catch(e){ return render(crumb([{ t: "معركة الكلمات" }]) + `<div class="note bad"><span class="ic">${I("alert")}</span><p>${esc(e.message)}</p></div>`); }
    const B = info.config, now = info.now;
    const board = rows => rows.length ? `<div class="lb">${rows.map(r => `<div class="lb-row ${r.me ? "me" : ""} ${r.rank <= 3 ? "top" + r.rank : ""}"><div class="rk ${r.rank <= 3 ? "medal" : ""}">${r.rank <= 3 ? I("medal", "medal-" + r.rank) : r.rank}</div><div class="nm">${esc(r.name)}</div><div class="pt">${r.score}${r.prize ? ` · +${r.prize}` : ""}</div></div>`).join("")}</div>` : `<p class="muted small">ما أحد لعب بعد — كن الأول!</p>`;
    const lastHtml = info.last && info.last.winners.length ? `<div class="card sheet"><h3>${I("trophy")} فائزو آخر معركة (${esc(info.last.key)})</h3>${board(info.last.winners)}</div>` : "";
    if(!info.active){
      return render(crumb([{ t: "معركة الكلمات" }]) + `<div class="card sheet battle-hero"><div class="gift-box live">${I("swords")}</div><h1>${esc(B.title)}</h1><p>${esc(B.desc)}</p>
        ${info.next ? `<div class="battle-count"><div class="small muted">تبدأ بعد</div><div class="bc-num" id="bcNum">${fmtLeft(info.next.start - now)}</div><div class="small muted">${new Date(info.next.start).toLocaleString("ar-SA", { weekday: "long", hour: "numeric", minute: "2-digit" })}</div></div>` : ""}
        <div class="btn-row" style="justify-content:center"><a class="btn btn-warm" href="#/game/speed">${I("timer")} تدرّب الحين على سباق ٦٠ ثانية</a></div>
        <p class="small muted">بنذكّرك قبل البداية بساعة، ولما تبدأ يطلع لك إعلان.</p></div>${lastHtml}`);
    }
    const rand = seeded(info.seed);
    const pool = allWords().filter(x => x.t.lvl === "A1" || x.t.lvl === "A2");
    const order = pool.map(x => [rand(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]).slice(0, 80);
    const intro = () => render(crumb([{ t: "معركة الكلمات" }]) + `<div class="card sheet battle-hero"><div class="gift-box live">${I("swords")}</div><h1>${esc(B.title)} — قائمة الآن!</h1><p>${esc(B.desc)}</p>
      <div class="battle-count"><div class="small muted">تنتهي بعد</div><div class="bc-num">${fmtLeft(info.active.end - Date.now())}</div>${info.mine ? `<div class="small">أفضل نتيجة لك: <b>${info.mine.score}</b> · المركز #${info.mine.rank}</div>` : ""}</div>
      <button type="button" class="btn btn-warm btn-lg" id="bStart">${I("swords")} ابدأ الجولة (${B.seconds} ثانية)</button></div>
      <div class="card sheet"><h3>${I("trophy")} الترتيب الآن</h3>${board(info.board)}</div>${lastHtml}`);
    intro();
    $("#bStart").addEventListener("click", () => {
      let i = 0, score = 0, answered = 0, combo = 0, lastLeft = null; const sids = []; const start = Date.now(); const DUR = B.seconds;
      const nextQ = () => {
        const x = order[i++ % order.length]; const q = (i % 3 === 0) ? reverseQ(x.t, x.i) : meaningQ(x.t, x.i);
        render(`<div class="quiz-top"><h2 style="margin:0;font-size:1.15rem">${I("swords")} معركة الكلمات</h2><div class="btn-row"><span class="badge ok">${score}</span>${combo >= 3 ? `<span class="badge accent">${I("fire")} ×${combo}</span>` : ""}<span class="timer" id="st">${DUR}s</span></div></div>
          <div class="card q-card"><div class="badge">${q.kind === "meaning" ? "ما معنى" : "ما الكلمة"}</div><div class="q-text ${q.kind === "meaning" ? "en" : ""}" style="${q.kind === "meaning" ? "" : "direction:rtl;text-align:right;font-family:inherit"}">${esc(q.q)}</div>
          <div class="opts-list" id="gopts">${q.opts.map((o, k) => `<button type="button" class="opt" data-k="${k}"><span class="letter">${L[k]}</span><span>${esc(o)}</span></button>`).join("")}</div></div>`);
        $("#gopts").querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => { const ok = +btn.dataset.k === q.a; answered++; Progress.record(q.id, ok); if(ok){ combo++; score += combo >= 3 ? 2 : 1; sids.push(q.id); sfx(combo >= 3 ? "combo" : "correct"); btn.classList.add("correct"); } else { combo = 0; sfx("wrong"); btn.classList.add("wrong"); $("#gopts").querySelectorAll(".opt")[q.a].classList.add("correct"); } $("#gopts").querySelectorAll(".opt").forEach(o => o.disabled = true); after(nextQ, ok ? 220 : 800); }));
      };
      const tick = async () => {
        const left = DUR - Math.round((Date.now() - start) / 1000); const el = $("#st"); if(el){ el.textContent = Math.max(0, left) + "s"; el.classList.toggle("low", left <= 10); }
        if(left !== lastLeft){ lastLeft = left; if(left <= 0) sfx("timeout"); else if(left <= 10) sfx("tick"); }
        if(left > 0) return after(tick, 250);
        stopTimers();
        let res = null; try{ res = await Auth.api("/api/battle", { method: "POST", body: { score } }); }catch(e){}
        postPoints(sids.length, Math.max(answered, 1), DUR, sids);
        const mine = res && res.mine;
        resultCard("معركة الكلمات", score, Math.max(answered, score), `<p class="muted">${answered} سؤال · نتيجة المعركة <b>${score}</b>${mine ? ` · أفضل نتيجة لك ${mine.score} (المركز #${mine.rank})` : ""}</p>${res ? `<div class="card sheet" style="text-align:start">${board(res.board)}</div>` : ""}`, "#/battle", "#/battle");
      };
      nextQ(); tick();
    });
  };

  /* ---------- review (SRS) ---------- */
  routes.review = () => {
    const ids = dueWordIds(); const list = shuffle(ids).slice(0, 20).map(qFromWordId).filter(Boolean);
    if(!list.length){
      const now = Date.now(), DAY = 864e5;
      const due = Object.entries(Progress.data.q).filter(([k, r]) => k.startsWith("gw-") && r.n && r.due).map(([, r]) => r.due);
      const days = Array.from({ length: 7 }, (_, i) => due.filter(d => d > now + (i - 1) * DAY && d <= now + i * DAY).length);
      const next = due.filter(d => d > now).sort((a, b) => a - b)[0];
      const left = next ? Math.max(1, Math.round((next - now) / 36e5)) : 0;
      const max = Math.max(1, ...days);
      return render(crumb([{ t: "المراجعة" }]) + `<div class="card center sheet"><h2>${I("check")} ما فيه كلمات حان وقتها الآن</h2>
        <p class="muted">${next ? `أقرب كلمة ترجع بعد <b>${left} ${left === 1 ? "ساعة" : "ساعات"}</b>.` : "ابدأ بتعلّم كلمات جديدة وسيظهر جدول مراجعتك هنا."}</p>
        <div class="forecast">${days.map((n, i) => `<div class="fc"><div class="fc-bar" style="height:${Math.round(n / max * 60) + 6}px"></div><div class="fc-n">${n}</div><div class="fc-d">${i === 0 ? "اليوم" : i === 1 ? "غدًا" : "+" + i}</div></div>`).join("")}</div>
        <div class="btn-row" style="justify-content:center;margin-top:14px"><a class="btn btn-primary" href="#/vocab">${I("type")} تعلّم كلمات جديدة</a><a class="btn" href="#/daily">${I("calendar")} تحدي اليوم</a></div></div>`);
    }
    runQuiz({ title: "مراجعة " + arN(list.length, "كلمة", "كلمات"), list, backHref: "#/", xpPer: 4, autoSay: true, onDone: (s, n, secs, ids) => { postPoints(s, n, secs, ids); resultCard("المراجعة", s, n, `<p class="muted">+${s * 4} XP · الكلمات الصحيحة تأجلت لموعد أبعد، والخاطئة سترجع قريبًا.</p>`, "#/", "#/review"); } });
  };

  /* ---------- daily ---------- */
  routes.daily = () => {
    const key = dayKey(); const already = GEN.daily[key];
    const lv = currentLevel(); const ths = levelThemes(lv);
    const dueQs = shuffle(dueWordIds()).slice(0, 3).map(qFromWordId).filter(Boolean);
    const dueSet = new Set(dueQs.map(q => q.id));
    let cand = shuffle(ths.flatMap(t => t.words.map((_, i) => ({ t, i })))).filter(x => !dueSet.has(wid(x.t, x.i)));
    const fresh = cand.filter(x => !known(wid(x.t, x.i))); if(fresh.length >= 5) cand = fresh; else { const notM = cand.filter(x => !mastered(wid(x.t, x.i))); if(notM.length >= 5) cand = notM; }
    const newQs = cand.slice(0, 5 - dueQs.length).map(x => randomWordQ(x.t, x.i));
    const lessons = G.filter(l => l.lvl === lv); const gq = shuffle(lessons).slice(0, 3).map(l => grammarQ(l, Math.floor(Math.random() * l.practice.length)));
    const ds = shuffle(D.filter(d => d.lvl === lv)); const dq = []; for(const d of ds){ const cand = d.lines.map((_, i) => dialogQ(d, i)).filter(Boolean); if(cand.length) dq.push(cand[Math.floor(Math.random() * cand.length)]); if(dq.length === 2) break; }
    const list = shuffle([...dueQs, ...newQs, ...gq, ...dq]);
    runQuiz({ title: "تحدي اليوم", header: already ? `<div class="note info"><span class="ic">${I("info")}</span><p>أنجزت تحدي اليوم (${already.score}/${already.total}). هذه جولة تدريب بدون نقاط.</p></div>` : "", list, backHref: "#/", xpPer: already ? 0 : 5, onDone: (s, n, secs, ids) => { if(!already){ GEN.daily[key] = { score: s, total: n }; gainXP(50, true); saveGen(); postPoints(s, n, secs, ids); } resultCard("تحدي اليوم", s, n, already ? "" : `<p class="muted">+${50 + s * 5} XP · عد غدًا لتحدٍ جديد وحافظ على سلسلتك ${I("fire")}</p>`, "#/", "#/daily"); } });
  };

  /* ---------- unit test ---------- */
  routes.unittest = id => {
    const u = U.find(x => x.id === id); if(!u) return routes.home();
    const ths = u.themes.map(theme).filter(Boolean); const l = u.grammar ? lesson(u.grammar) : null; const ds = dialogsOf(u);
    let list = [];
    const extra = (l ? 0 : 3) + (ds.length ? 0 : 2);
    const per = ths.length ? Math.ceil((7 + extra) / ths.length) : 0; ths.forEach(t => list.push(...themeQs(t, per)));
    if(l) list.push(...shuffle(l.practice.map((_, i) => grammarQ(l, i))).slice(0, ths.length ? 3 : 8));
    ds.forEach(d => { const cand = d.lines.map((_, i) => dialogQ(d, i)).filter(Boolean); list.push(...shuffle(cand).slice(0, ds.length > 1 ? 1 : 2)); });
    list = shuffle(list).slice(0, 12);
    runQuiz({ title: "اختبار الوحدة: " + u.t, list, backHref: `#/unit/${u.id}`, xpPer: 5, onDone: (s, n, secs, ids) => { const pass = s / n >= .7; if(pass && !GEN.units[u.id]){ GEN.units[u.id] = true; gainXP(100, true); saveGen(); } postPoints(s, n, secs, ids, u.id); const next = U[U.indexOf(u) + 1]; resultCard("اختبار الوحدة: " + u.t, s, n, pass ? `<p class="muted">${I("trophy")} اكتملت الوحدة! +100 XP</p>${next ? `<a class="btn btn-warm" href="#/unit/${next.id}">الوحدة التالية: ${esc(next.t)} ←</a>` : ""}` : `<p class="muted">تحتاج ٧٠٪ لإكمال الوحدة. راجع المفردات والقاعدة ثم أعد المحاولة.</p>`, `#/unit/${u.id}`, `#/unittest/${u.id}`); } });
  };

  /* ---------- GRAMMAR ---------- */
  routes.grammar = () => {
    render(crumb([{ t: "القواعد" }]) + `<h1>${I("book")} كيف تقولها صح</h1><p class="muted">بدون مسميات معقدة: كل درس يعلّمك متى تقول الشيء، ويعطيك قوالب جاهزة تعبّيها وتنطقها، ثم تجرّبها.</p><a class="card link-card c-blue" href="#/verbs" style="margin-bottom:14px"><div class="icon p-blue">${I("list")}</div><h3>تصريف الأفعال</h3><p class="muted small">go → went → gone: جدول ${VB.length} فعلًا مع البحث والنطق واختبار</p></a>` +
      LV.map(lv => { const ls = G.filter(l => l.lvl === lv); return ls.length ? `<div class="section" data-lv="${lv}"><div class="section-title"><h2 style="color:${LVC[lv]}">${lv} · ${LVN[lv]}</h2></div><div class="grid grid-2">${ls.map(l => { const ids = l.practice.map((_, i) => `gg-${l.id}-${i}`); const k = ids.filter(known).length; return `<a class="card link-card" href="#/lesson/${l.id}" style="--c:${LVC[lv]}"><h3>${esc(l.t)}</h3><p class="muted small en" style="direction:ltr;text-align:left">${esc(l.en)}</p><p class="small">${esc(l.why)}</p>${bar(Math.round(k / ids.length * 100))}</a>`; }).join("")}</div></div>` : ""; }).join(""));
    levelTabs("grammar");
  };
  /* يعزل المقاطع الإنجليزية داخل النص العربي ويقسّم الشرح إلى نقاط */
  const mixed = txt => esc(txt).replace(/([A-Za-z][A-Za-z0-9'’.\-]*(?:\s+[A-Za-z][A-Za-z0-9'’.\-]*)*)/g, m => `<bdi class="${m.trim().split(/\s+/).length > 3 ? "en-line" : "en-in"}">${m}</bdi>`);
  const arPoints = txt => String(txt).split(/(?<=[.؟!])\s+(?=[^\s])/).map(x => x.trim()).filter(Boolean)
    .flatMap(seg => (seg.match(/\([^()]*[A-Za-z][^()]*\)/g) || []).length >= 2 ? seg.split(/،\s+/).map(x => x.trim()).filter(Boolean) : [seg]);
  /* يفصل المثال الإنجليزي بين قوسين عن نص القاعدة العربي */
  function pointHtml(p){
    const m = p.match(/^(.*?)[\s،]*\(([^()]*[A-Za-z][^()]*)\)[\s،.]*$/);
    if(m && m[1].trim()) return `<div class="pt-ar">${mixed(m[1].trim())}</div><div class="pt-en en">${esc(m[2].trim())}</div>`;
    return mixed(p);
  }
  const formRows = txt => String(txt).split(/\s+—\s+|\s+\|\s+/).map(x => x.trim()).filter(Boolean);

  routes.lesson = id => {
    const l = lesson(id); if(!l) return routes.grammar();
    const frames = l.frames || [], speakP = l.speak || [];
    render(crumb(U.find(x => x.grammar === l.id) ? [...unitPath(U.find(x => x.grammar === l.id)), { t: l.t }] : [{ t: "القواعد", href: "#/grammar" }, { t: l.t }]) + `<article class="lesson focus-none"><h2><span class="n" style="background:${LVC[l.lvl]}">${l.lvl}</span> ${esc(l.t)}</h2><div class="en-title lesson-en">${esc(l.en)}</div>
      <div class="why-box"><h3>${I("bulb")} وش بتقدر تقول بعد الدرس؟</h3><p>${mixed(l.why)}</p></div>
      <div class="when-box"><h3>${I("clock")} متى تقولها؟</h3><ul class="when-list">${arPoints(l.when).map(x => `<li>${pointHtml(x)}</li>`).join("")}</ul></div>
      ${frames.length ? `<h3>${I("type")} قوالب جاهزة — عبّي الفراغ وقلها بصوت عالٍ</h3><div class="frames">${frames.map(f => `<div class="frame"><div class="fr-en en">${esc(f[0]).replace(/___/g, '<span class="slot">___</span>')} ${spk(f[0].replace(/___/g, "something"), "sm")}</div><div class="fr-ar">${esc(f[1])}</div></div>`).join("")}</div>` : ""}
      ${l.table ? `<h3>${I("list")} الخلاصة في جدول</h3><div class="table-wrap"><table class="gtable"><thead><tr>${l.table.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${l.table.rows.map(r => `<tr>${r.map((cell, i) => `<td class="${/[A-Za-z]/.test(cell) && i > 0 ? "en" : ""}">${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
      <h3>${I("bookopen")} أمثلة من الحياة</h3>${l.ex.map(e => `<div class="ex right"><span class="en">${esc(e[0])} ${spk(e[0], "sm")}</span><span class="ar">${esc(e[1])}</span></div>`).join("")}
      ${speakP.length ? `<div class="speak-box"><h3>${I("mic")} قلها عن نفسك</h3><ol>${speakP.map(p => `<li>${mixed(p)}</li>`).join("")}</ol><p class="small muted">ما تحتاج تكتب — قلها بصوتك وأنت تمشي أو تسوق. التكرار بصوت عالٍ هو اللي يثبّتها.</p></div>` : ""}
      <details class="shape" open><summary>${I("list")} شكل الجملة كامل</summary><div class="formula-rows">${formRows(l.form).map(x => `<div class="frow">${mixed(x)}</div>`).join("")}</div></details>
      <h3>${I("alert")} أخطاء يقع فيها الكثير</h3><div class="table-wrap"><table><thead><tr><th class="en">✗ خطأ</th><th class="en">✓ صحيح</th><th>ليش</th></tr></thead><tbody>${l.mistakes.map(m => `<tr><td class="en" style="color:var(--bad)">${esc(m[0])}</td><td class="en" style="color:var(--ok)">${esc(m[1])}</td><td>${mixed(m[2])}</td></tr>`).join("")}</tbody></table></div>
      <div class="note tip"><span class="ic">${I("sparkles")}</span><p>${mixed(l.tip)}</p></div>
      ${/past|perfect|passive|third|used-to/.test(l.id) ? `<div class="note info"><span class="ic">${I("list")}</span><p>تبي تعرف ماضي أي فعل و«بعد have»؟ <a href="#/verbs"><b>جدول تصريف الأفعال</b></a> فيه ${VB.length} فعلًا مع البحث والنطق.</p></div>` : ""}
      ${l.jargon ? `<p class="small muted jargon">اسمها في كتب القواعد (للمرجع فقط، ما تحتاج تحفظه): ${mixed(l.jargon)}</p>` : ""}
      <div class="btn-row"><a class="btn btn-primary" href="#/practice/${l.id}">${I("pencil")} جرّبها (${l.practice.length} ${l.practice.length > 10 ? "سؤالًا" : "أسئلة"}) ${ptsTag()}</a><a class="btn" href="#/grammar">كل الدروس</a></div></article>`);
    /* تنقّل سريع داخل الدرس + زر «جرّبها» عائم */
    const art = $("#app .lesson"); const hs = [...art.querySelectorAll("h3")];
    const short = t => /متى/.test(t) ? "متى" : /قوالب/.test(t) ? "قوالب" : /جدول/.test(t) ? "الجدول" : /أمثلة/.test(t) ? "أمثلة" : /قلها/.test(t) ? "قلها" : /أخطاء/.test(t) ? "الأخطاء" : null;
    const toc = hs.map((h, k) => { const n = short(h.textContent); if(!n) return ""; h.id = "ls" + k; return `<button type="button" data-go="ls${k}">${n}</button>`; }).join("");
    art.querySelector(".lesson-en").insertAdjacentHTML("afterend", `<div class="lesson-toc">${toc}<button type="button" class="go-practice" data-href="#/practice/${l.id}">${I("pencil")} جرّبها</button></div>`);
    art.querySelector(".lesson-toc").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; if(b.dataset.href){ location.hash = b.dataset.href; return; } const el = document.getElementById(b.dataset.go); if(el) el.scrollIntoView({ behavior: "smooth", block: "start" }); });
    hydrateIcons(art.querySelector(".lesson-toc"));
    document.body.insertAdjacentHTML("beforeend", `<a class="float-cta" id="floatCta" href="#/practice/${l.id}">${I("pencil")} جرّبها (${l.practice.length})</a>`);
    const fc = $("#floatCta"); hydrateIcons(fc);
    const onScroll = () => { const btm = art.querySelector(".btn-row:last-child"); const r = btm ? btm.getBoundingClientRect() : null; fc.classList.toggle("show", scrollY > 500 && !(r && r.top < innerHeight)); };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    timers.push({ clear(){ removeEventListener("scroll", onScroll); fc.remove(); } });
  };
  routes.practice = id => {
    const l = lesson(id); if(!l) return routes.grammar();
    const list = shuffle(l.practice.map((_, i) => grammarQ(l, i)));
    runQuiz({ title: "تدريب: " + l.t, list, backHref: `#/lesson/${l.id}`, xpPer: 6, onDone: (s, n, secs, ids) => { postPoints(s, n, secs, ids); resultCard(l.t, s, n, `<p class="muted">+${s * 6} XP</p>`, `#/lesson/${l.id}`, `#/practice/${l.id}`); } });
  };

  /* ---------- TALK ---------- */
  routes.talk = () => {
    render(crumb([{ t: "تكلّم" }]) + `<h1>${I("mic")} محادثات المواقف</h1><p class="muted">استمع للحوار جملة جملة، أخفِ الترجمة وتحدَّ نفسك، مثّل دورك بالاختيار، ثم انطق الجمل ويقيّمك الموقع كلمة كلمة (يشتغل على Chrome وSafari الآيفون).</p>
      <div class="card sheet"><div class="section-title"><h3 style="margin:0">${I("mic")} مستوى النطق: ${SPK_TIERS[spkTierIdx()].t}</h3><span class="badge">${spkDone()} جملة ناجحة</span></div><p class="muted small" style="margin:0">${SPK_TIERS[spkTierIdx()].desc}. ${SPK_TIERS[spkTierIdx()].upto === Infinity ? "أنت في أعلى مستوى — أحسنت!" : `كل جملة تنجح فيها تقرّبك، وبعد ${Math.max(0, SPK_TIERS[spkTierIdx()].upto - spkDone())} جملة يرتفع المستوى وتصير أصعب شوي.`}</p>${bar(SPK_TIERS[spkTierIdx()].upto === Infinity ? 100 : Math.round(spkDone() / SPK_TIERS[spkTierIdx()].upto * 100))}</div>` +
      LV.map(lv => { const ds = D.filter(d => d.lvl === lv); return ds.length ? `<div class="section" data-lv="${lv}"><div class="section-title"><h2 style="color:${LVC[lv]}">${lv} · ${LVN[lv]}</h2></div><div class="grid grid-3">${ds.map(d => `<a class="card link-card" href="#/dialogue/${d.id}" style="--c:${LVC[lv]}"><div class="icon" style="background:${LVC[lv]}22">${I(d.icon || "chat")}</div><h3>${esc(d.t)}</h3><p class="muted small">${d.roles[0]} و ${d.roles[1]} · ${d.lines.length} جملة</p></a>`).join("")}</div></div>` : ""; }).join(""));
    levelTabs("talk");
  };
  routes.dialogue = id => {
    const d = dialog(id); if(!d) return routes.talk();
    let showAr = true;
    const draw = () => {
      render(crumb(U.find(x => dialogsOf(x).includes(d)) ? [...unitPath(U.find(x => dialogsOf(x).includes(d))), { t: d.t }] : [{ t: "تكلّم", href: "#/talk" }, { t: d.t }]) + `<div class="card sheet"><div class="section-title"><span class="badge" style="background:${LVC[d.lvl]};color:#fff">${d.lvl}</span><h1 style="margin:0">${esc(d.t)}</h1></div>
        <div class="btn-row"><button type="button" class="btn btn-primary" id="playAll">${I("headphones")} استمع للحوار كاملًا</button><button type="button" class="btn" id="toggleAr">${showAr ? "أخفِ الترجمة" : "أظهر الترجمة"}</button><a class="btn" href="#/roleplay/${d.id}">${I("users")} مثّل دور ${d.roles[1]} ${ptsTag()}</a><a class="btn btn-warm" href="#/speak/${d.id}">${I("mic")} انطق الجمل</a></div></div>
        <div class="dialog">${d.lines.map((ln, i) => `<div class="dl ${ln[0] === "A" ? "a" : "b"}"><div class="who">${ln[0] === "A" ? d.roles[0] : d.roles[1]}</div><div class="bubble"><div class="en">${esc(ln[1])} ${spk(ln[1], "sm")}</div>${showAr ? `<div class="ar small">${esc(ln[2])}</div>` : ""}</div></div>`).join("")}</div>
        <div class="card"><h3>${I("star")} عبارات تحفظها</h3>${d.phrases.map(p => `<div class="ex right"><span class="en">${esc(p[0])} ${spk(p[0], "sm")}</span><span class="ar">${esc(p[1])}</span></div>`).join("")}</div>`);
      $("#toggleAr").addEventListener("click", () => { showAr = !showAr; draw(); });
      let playing = false, run = 0;
      const btn = $("#playAll"); const setBtn = () => { btn.innerHTML = playing ? `${I("x")} إيقاف` : `${I("headphones")} استمع للحوار كاملًا`; hydrateIcons(btn); };
      const clearNow = () => document.querySelectorAll(".dl.now").forEach(x => x.classList.remove("now"));
      btn.addEventListener("click", () => {
        if(playing){ playing = false; run++; hush(); clearNow(); setBtn(); return; }
        playing = true; const my = ++run; setBtn(); let i = 0;
        const step = () => { if(my !== run) return; if(i >= d.lines.length){ playing = false; clearNow(); setBtn(); return; } const ln = d.lines[i]; document.querySelectorAll(".dl").forEach((x, k) => x.classList.toggle("now", k === i)); const el = document.querySelectorAll(".dl")[i]; if(el && el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" }); const u = new SpeechSynthesisUtterance(ln[1]); u.lang = "en-US"; u.rate = .9; const v = voices.find(v => /en[-_]US/i.test(v.lang) && (ln[0] === "A" ? /male|david|guy|mark|andrew|brian/i.test(v.name) : /female|zira|aria|jenny|samantha|ava|emma/i.test(v.name))) || voices.find(v => /^en/i.test(v.lang)); if(v) u.voice = v; u.onend = u.onerror = () => { if(my !== run) return; i++; after(step, 350); }; speechSynthesis.speak(u); };
        hush(); after(step, 150);
      });
      timers.push({ clear(){ run++; playing = false; } });
    };
    draw();
  };
  routes.roleplay = id => {
    const d = dialog(id); if(!d) return routes.talk();
    const list = d.lines.map((_, i) => dialogQ(d, i)).filter(Boolean);
    runQuiz({ title: "مثّل دور " + d.roles[1] + " — " + d.t, list, backHref: `#/dialogue/${d.id}`, xpPer: 6, autoSay: true, onDone: (s, n, secs, ids) => { postPoints(s, n, secs, ids); resultCard("تمثيل الدور: " + d.t, s, n, `<p class="muted">+${s * 6} XP</p>`, `#/dialogue/${d.id}`, `#/roleplay/${d.id}`); } });
  };
  /* ---------- النطق: يبدأ سهلًا ثم يصعب تدريجيًا ---------- */
  const SPK_TIERS = [
    { t: "تمهيدي", pass: 40, auto: true, ar: true, hint: true, short: true, upto: 15, desc: "الجملة تُقرأ لك أولًا، والترجمة ظاهرة، والنجاح من ٤٠٪" },
    { t: "متوسط", pass: 55, auto: false, ar: true, hint: true, short: false, upto: 40, desc: "اسمع بنفسك إذا احتجت، والنجاح من ٥٥٪" },
    { t: "متقدم", pass: 70, auto: false, ar: false, hint: false, short: false, upto: Infinity, desc: "بدون ترجمة ولا تلميح، والنجاح من ٧٠٪" }
  ];
  const spkDone = () => GEN.spk || 0;
  const spkTierIdx = () => { const n = spkDone(); return n < SPK_TIERS[0].upto ? 0 : n < SPK_TIERS[1].upto ? 1 : 2; };
  /* الجملة كلمات: الأخضر انقال صح، والأحمر باقي — اضغط أي كلمة تسمعها */
  const wordChips = (words, state) => words.map((w, i) => `<button type="button" class="wq ${state ? state[i] : ""}" data-say="${esc(w.replace(/[^A-Za-z0-9' -]/g, ""))}">${esc(w)}</button>`).join(" ");
  routes.speak = id => {
    const d = dialog(id); if(!d) return routes.talk();
    const ti = spkTierIdx(), T = SPK_TIERS[ti];
    let lines = d.lines.map((ln, i) => ({ ln, i })).filter(x => x.ln[0] === "B");
    if(T.short) lines = lines.slice().sort((a, b) => a.ln[1].split(/\s+/).length - b.ln[1].split(/\s+/).length);
    let pos = 0, total = 0, passedCount = 0, perfect = 0;
    const show = () => {
      if(pos >= lines.length){
        const avg = Math.round(total / lines.length);
        GEN.xp += Math.round(avg / 5); saveGen();
        const nextNeed = T.upto === Infinity ? 0 : Math.max(0, T.upto - spkDone());
        if(avg >= 90) try{ confetti(); }catch(e){}
        return resultCard("النطق: " + d.t, passedCount, lines.length, `<p class="muted">متوسط الدقة ${avg}٪ · ${perfect} ${perfect === 1 ? "جملة" : "جمل"} ١٠٠٪ · مستوى النطق: <b>${T.t}</b>${nextNeed ? ` · باقي ${nextNeed} جملة ناجحة للمستوى التالي` : ""}</p>`, `#/dialogue/${d.id}`, `#/speak/${d.id}`);
      }
      const cur = lines[pos], ln = cur.ln;
      let hit = [], best = 0, tries = 0, rec = null, counted = false;
      const words = String(ln[1]).split(/\s+/).filter(Boolean);
      render(crumb([{ t: "تكلّم", href: "#/talk" }, { t: d.t, href: `#/dialogue/${d.id}` }, { t: "انطق" }]) + `<div class="quiz-top"><h2 style="margin:0;font-size:1.15rem">${I("mic")} انطق الجملة</h2><div class="btn-row"><span class="badge accent">مستوى ${T.t}</span><span class="badge info">${pos + 1} / ${lines.length}</span></div></div>${bar(pos / lines.length * 100)}
        <div class="card q-card center speak-card">
          <div class="muted small">${esc(d.roles[1])} يقول:</div>
          <div class="wq-line en speak-line" id="tw">${wordChips(words)}</div>
          ${T.ar ? `<div class="muted">${esc(ln[2])}</div>` : `<button type="button" class="btn btn-sm" id="showAr">${I("info")} أظهر الترجمة</button>`}
          <div class="sp-meter" id="meter" hidden><div class="sp-ring" id="ring" style="--p:0"><span id="ringN">0٪</span></div><div class="sp-msg" id="spMsg"></div></div>
          <div class="btn-row" style="justify-content:center;margin-top:12px">${spk(ln[1], "big")}${T.hint ? `<button type="button" class="btn btn-sm" id="slow">${I("headphones")} ببطء</button>` : ""}</div>
          <button type="button" class="mic-btn" id="rec" ${SR ? "" : "disabled"}><span class="mic-ic">${I("mic")}</span><span class="mic-t" id="recT">اضغط وتكلّم</span></button>
          <div class="live small en" id="live" hidden></div>
          <p class="small muted" style="margin:6px 0 0">تكلّم براحتك — ما يوقف إلا إذا سكتّ ثانيتين أو ضغطت «خلصت». الكلمات اللي تقولها صح تبقى خضراء، وتقدر تعيد الحمراء بس.</p>
          <div class="btn-row" style="justify-content:center;margin-top:10px"><button type="button" class="btn" id="skip">تخطَّ</button><button type="button" class="btn btn-primary" id="nx" hidden>التالي ←</button></div>
          ${SR ? "" : `<div class="note warn"><span class="ic">${I("alert")}</span><p>التعرف على الصوت غير مدعوم في هذا المتصفح. استخدم Chrome على الجوال أو الكمبيوتر، أو Safari على الآيفون.</p></div>`}
        </div>`);
      if(T.auto) after(() => speak(ln[1], .8), 350);
      if(T.hint) $("#slow").addEventListener("click", () => speak(ln[1], .55));
      if(!T.ar) $("#showAr").addEventListener("click", e => { e.target.closest("button").outerHTML = `<div class="muted">${esc(ln[2])}</div>`; });
      const finishLine = () => { if(counted) return; counted = true; total += best; if(best >= T.pass){ passedCount++; GEN.spk = spkDone() + 1; saveGen(); } if(best >= 100) perfect++; };
      const stopRec = () => { if(rec){ rec.stop(); } };
      timers.push({ clear(){ try{ stopRec(); }catch(e){} } });
      $("#skip").addEventListener("click", () => { stopRec(); finishLine(); pos++; show(); });
      $("#nx").addEventListener("click", () => { stopRec(); finishLine(); pos++; show(); });
      const setBtn = on => { const b = $("#rec"); if(!b) return; b.classList.toggle("on", on); $("#recT").textContent = on ? "خلصت ⏹" : tries ? "أعد المحاولة" : "اضغط وتكلّم"; };
      $("#rec").addEventListener("click", () => {
        if(rec){ stopRec(); return; }
        hush(); setBtn(true);
        const live = $("#live"); live.hidden = false; live.textContent = "… أسمعك";
        rec = Speech.listen(res => {
          rec = null; setBtn(false); tries++;
          const live2 = $("#live"); if(!live2) return;
          const meter = $("#meter"); meter.hidden = false;
          if(!res){ live2.hidden = true; $("#spMsg").innerHTML = `<b>ما سمعت شي.</b><div class="small">تأكد إن المايك مسموح، وقرّب الجوال وتكلّم بصوت واضح.</div>`; $("#nx").hidden = tries < 2 && best < T.pass; return; }
          const r = Speech.evaluate(ln[1], res, hit);
          hit = r.hit; const gained = r.score - best; best = Math.max(best, r.score);
          const pass = best >= T.pass;
          Progress.record(`gd-${d.id}-${cur.i}`, pass);
          $("#tw").innerHTML = wordChips(words, r.state);
          $("#ring").style.setProperty("--p", best); $("#ringN").textContent = best + "٪";
          meter.className = "sp-meter " + (best >= 100 ? "perfect" : pass ? "ok" : "bad");
          live2.textContent = "سمعت: " + res[0];
          const miss = r.missing.filter(Boolean);
          $("#spMsg").innerHTML = best >= 100 ? `<b>${emo("party")} ممتاز! ١٠٠٪</b>`
            : pass ? `<b>أحسنت — ناجح</b><div class="small">${miss.length ? `تبي ١٠٠٪؟ قل بس: <b class="en">${miss.slice(0, 4).map(esc).join(" · ")}</b>` : ""}</div>`
            : `<b>${gained > 0 && tries > 1 ? `تحسّنت +${gained}٪` : `تحتاج ${T.pass}٪`}</b><div class="small">${miss.length ? `قل الكلمات الحمراء: <b class="en">${miss.slice(0, 4).map(esc).join(" · ")}</b> — اضغطها تسمعها` : "حاول مرة ثانية بصوت أوضح"}</div>`;
          sfx(best >= 100 ? "win" : pass ? "correct" : "wrong");
          if(best >= 100) try{ confetti(); }catch(e){}
          if(pass){ $("#nx").hidden = false; $("#nx").focus({ preventScroll: true }); } else $("#nx").hidden = tries < 3;
        }, txt => { const l = $("#live"); if(l) l.textContent = "أسمع: " + txt; });
      });
    };
    show();
  };

  window.addEventListener("hashchange", route);
  document.addEventListener("points:loaded", e => { const st = (e.detail && e.detail.stages) || []; let changed = false; st.forEach(id => { if(!GEN.units[id]){ GEN.units[id] = true; changed = true; } }); if(changed){ saveGen(); if(/^#\/(|level|unit)/.test(location.hash) || !location.hash) route(); } });
  document.addEventListener("DOMContentLoaded", async () => { if(Auth.user()) await Progress.sync(false); route(); if(typeof loadPoints === "function") loadPoints(); });
})();
