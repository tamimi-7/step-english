/* ===== مكتبة القصص — قراءة واستماع مدرّجة من A1 إلى C2 ===== */
(function(){
  const $ = s => document.querySelector(s);
  const LV = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const ALL = (window.STORIES || []).slice().sort((a, b) => LV.indexOf(a.lvl) - LV.indexOf(b.lvl) || a.d - b.d);
  const LVN = { A1: "مبتدئ", A2: "أساسي", B1: "متوسط", B2: "فوق المتوسط", C1: "متقدم", C2: "احتراف" };
  const LVD = { A1: "قصص قصيرة جدًا بجمل بسيطة", A2: "حكايات مشهورة بلغة سهلة", B1: "قصص كلاسيكية مختصرة", B2: "روايات عالمية بلغة أغنى", C1: "أدب متقدم بمفردات راقية", C2: "روايات كبرى بلغة قريبة من الأصل" };
  const LVC = { A1: "#16a34a", A2: "#2563eb", B1: "#d97706", B2: "#7c3aed", C1: "#dc2626", C2: "#64748b" };
  const KIND = { fable: "حكاية رمزية", fairy: "حكاية خرافية", short: "قصة قصيرة", novel: "رواية مختصرة" };
  const TIMES = window.STORY_TIMES || {};
  const byId = id => ALL.find(s => s.id === id);
  const wordsOf = s => s.paras.reduce((n, p) => n + p.en.split(/\s+/).filter(Boolean).length, 0);
  const minutesOf = s => Math.max(1, Math.round(wordsOf(s) / 130));
  /* حالة القارئ: آخر قصة وموضعها، القصص المكتملة، مواضع القراءة */
  const LIB = Object.assign({ last: null, done: {}, pos: {}, listened: {}, speed: 1, ar: true }, Store.get("step_lib", {}));
  const save = () => Store.set("step_lib", LIB);
  const GEN = () => Store.get("step_gen", { xp: 0 });
  const addXP = n => { const g = GEN(); g.xp = (g.xp || 0) + n; Store.set("step_gen", g); toast(`+${n} XP`); };
  const sfx = n => { if(typeof SFX !== "undefined" && SFX[n]) SFX[n](); };
  const SENT_RE = /[^.!?]+[.!?]+["'”’]?|[^.!?]+$/g;
  const sentences = text => (text.match(SENT_RE) || [text]).map(x => x.trim()).filter(Boolean);
  /* أجزاء الجمل: من ملف التوقيت إن وُجد (مزامنة دقيقة مع الصوت)، وإلا تقسيم تلقائي */
  function spansOf(s){
    const t = TIMES[s.id];
    if(t && t.length) return t.map(x => ({ start: x[0], end: x[1], pi: x[2], cs: x[3], ce: x[4] }));
    const out = []; s.paras.forEach((p, pi) => { let at = 0; sentences(p.en).forEach(txt => { const i = p.en.indexOf(txt, at); if(i < 0) return; at = i + txt.length; out.push({ pi, cs: i, ce: at }); }); });
    return out;
  }
  const words = txt => txt.replace(/[A-Za-z][A-Za-z'-]*/g, m => `<span class="w">${m}</span>`);
  function paraHtml(p, pi, spans){
    const mine = spans.map((sp, k) => ({ ...sp, k })).filter(sp => sp.pi === pi).sort((a, b) => a.cs - b.cs);
    if(!mine.length) return words(esc(p.en));
    let out = "", at = 0;
    mine.forEach(sp => { if(sp.cs > at) out += words(esc(p.en.slice(at, sp.cs))); out += `<span class="sent" data-k="${sp.k}">${words(esc(p.en.slice(sp.cs, sp.ce)))}</span>`; at = sp.ce; });
    if(at < p.en.length) out += words(esc(p.en.slice(at)));
    return out;
  }
  /* ---------- قاموس: معنى أي كلمة إنجليزية بضغطة ---------- */
  const DICT = (() => {
    const m = {};
    (window.GEN_VOCAB || []).forEach(t => t.words.forEach(w => { const k = w[0].toLowerCase(); if(!m[k]) m[k] = { ar: w[1], pos: w[2], ex: w[3], exAr: w[4], lvl: t.lvl }; }));
    return m;
  })();
  const STRIP = w => {
    const out = [w];
    if(/ies$/.test(w)) out.push(w.slice(0, -3) + "y");
    if(/(s|es)$/.test(w)) { out.push(w.replace(/es$/, "")); out.push(w.replace(/s$/, "")); }
    if(/ed$/.test(w)) { out.push(w.slice(0, -2)); out.push(w.slice(0, -1)); if(/(.)\1ed$/.test(w)) out.push(w.slice(0, -3)); }
    if(/ing$/.test(w)) { out.push(w.slice(0, -3)); out.push(w.slice(0, -3) + "e"); if(/(.)\1ing$/.test(w)) out.push(w.slice(0, -4)); }
    if(/(er|est)$/.test(w)) { out.push(w.replace(/(er|est)$/, "")); out.push(w.replace(/(er|est)$/, "e")); }
    return [...new Set(out)];
  };
  const IRREG_BASE = { was: "be", were: "be", been: "be", am: "be", is: "be", are: "be", had: "have", has: "have", went: "go", gone: "go", said: "say", took: "take", taken: "take", came: "come", saw: "see", seen: "see", got: "get", made: "make", knew: "know", known: "know", thought: "think", found: "find", gave: "give", given: "give", told: "tell", felt: "feel", left: "leave", put: "put", brought: "bring", began: "begin", kept: "keep", held: "hold", wrote: "write", written: "write", stood: "stand", heard: "hear", let: "let", ran: "run", paid: "pay", met: "meet", sat: "sat", spoke: "speak", lay: "lie", led: "lead", grew: "grow", lost: "lose", fell: "fall", sent: "sent", built: "build", understood: "understand", drew: "draw", broke: "break", broken: "break", spent: "spend", sold: "sell", bought: "buy", caught: "catch", taught: "teach", chose: "choose", ate: "eat", drank: "drink", drove: "drive", flew: "fly", forgot: "forget", slept: "sleep", swam: "swim", wore: "wear", won: "win", woke: "wake", stole: "steal", rose: "rise", rode: "ride", sang: "sing", threw: "throw", laid: "lay", wound: "wind" };
  function lookup(raw, story){
    const w = String(raw).toLowerCase().replace(/[^a-z']/g, "");
    if(!w) return null;
    const g = story && story.glossary && story.glossary.find(x => x.w.toLowerCase() === w);
    if(g) return { ar: g.ar, pos: g.pos, src: "قاموس القصة", word: g.w };
    const cands = [w, IRREG_BASE[w], ...STRIP(w)].filter(Boolean);
    for(const cand of cands){
      const g2 = story && story.glossary && story.glossary.find(x => x.w.toLowerCase() === cand);
      if(g2) return { ar: g2.ar, pos: g2.pos, src: "قاموس القصة", word: g2.w };
      if(DICT[cand]) return { ...DICT[cand], src: "مفردات " + DICT[cand].lvl, word: cand };
    }
    return null;
  }
  const MYW = () => { LIB.words = LIB.words || {}; return LIB.words; };
  const saveWord = (w, ar, sid) => { MYW()[w.toLowerCase()] = { ar, s: sid, at: Date.now() }; save(); };
  const dropWord = w => { delete MYW()[w.toLowerCase()]; save(); };

  const storyStatus = s => LIB.done[s.id] ? "done" : LIB.pos[s.id] > 0 || (LIB.last && LIB.last.id === s.id) ? "started" : "new";
  const levelStats = lv => { const list = ALL.filter(s => s.lvl === lv); const done = list.filter(s => LIB.done[s.id]).length; return { n: list.length, done, pct: list.length ? Math.round(done / list.length * 100) : 0 }; };
  const currentLevel = () => { if(LIB.last){ const s = byId(LIB.last.id); if(s) return s.lvl; } return LV.find(lv => levelStats(lv).n && levelStats(lv).done < levelStats(lv).n) || "A1"; };
  const nextStory = s => ALL.filter(x => x.lvl === s.lvl && x.d > s.d && !LIB.done[x.id])[0] || ALL.filter(x => x.lvl === s.lvl && x.d > s.d)[0] || ALL.filter(x => LV.indexOf(x.lvl) > LV.indexOf(s.lvl))[0] || null;

  /* ---------- router ---------- */
  const routes = {}; let timers = [];
  const after = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  let player = null;
  function stopAll(){ timers.forEach(t => { if(t && typeof t.clear === "function") t.clear(); else clearTimeout(t); }); timers = []; if(player){ player.destroy(); player = null; } try{ speechSynthesis.cancel(); }catch(e){} }
  function route(){ const parts = (location.hash.replace(/^#\/?/, "") || "").split("/"); const fn = routes[parts[0] || "home"] || routes.home; stopAll(); window.scrollTo(0, 0); fn(...parts.slice(1)); }
  const render = html => { $("#lib").innerHTML = html; hydrateIcons($("#lib")); };
  const crumb = items => `<div class="crumbs"><a href="#/">${I("bookopen")} مكتبة القصص</a>${items.map(x => ` <span>›</span> ${x.href ? `<a href="${x.href}">${x.t}</a>` : `<b>${x.t}</b>`}`).join("")}</div>`;
  const bar = (pct, cls) => `<div class="progress"><div class="${cls || ""}" style="width:${pct}%"></div></div>`;
  const lvBadge = lv => `<span class="badge" style="background:${LVC[lv]};color:#fff">${lv}</span>`;

  /* ---------- HOME ---------- */
  routes.home = () => {
    const cur = currentLevel(); const last = LIB.last && byId(LIB.last.id);
    render(`<section class="hero gen-hero gen-simple lib-hero"><span class="badge">إنقلش عام — قراءة واستماع</span><h1>قصص وروايات <mark>تقرأها وتسمعها</mark></h1><p>روايات وحكايات مشهورة مبسّطة ومرتبة من A1 إلى C2، كل قصة بصوت قارئ، وترجمة لكل فقرة، وأسئلة فهم تعطيك نقاطًا.</p>
      ${last ? `<div class="actions"><a class="btn btn-light" href="#/read/${last.id}">${I("zap")} أكمل: ${esc(last.title)} (فقرة ${(LIB.last.para || 0) + 1} من ${last.paras.length})</a></div>` : `<div class="actions"><a class="btn btn-light" href="#/level/${cur}">${I("zap")} ابدأ من مستوى ${cur}</a></div>`}
    </section>
    <div class="events-bar" id="eventsBar"></div>
    ${Object.keys(LIB.words || {}).length ? `<section class="section"><div class="section-title"><h2>${I("bookmark")} كلماتي من القصص</h2><a class="btn btn-sm" href="#/words">كلها (${Object.keys(LIB.words).length})</a></div><div class="gloss-grid">${Object.entries(LIB.words).slice(-8).reverse().map(([w, v]) => `<div class="gl"><b class="en">${esc(w)}</b><button type="button" class="spk sm" data-say="${esc(w)}">${I("headphones")}</button><div>${esc(v.ar)}</div></div>`).join("")}</div></section>` : ""}
    <section class="section"><div class="section-title"><h2>المستويات</h2><span class="muted small">أنت في مستوى <b>${cur}</b> — الشريط يوضح ما أكملته</span></div>
      <div class="lvl-list">${LV.map(lv => { const st = levelStats(lv); return `<a class="lvl-row ${st.pct === 100 ? "done" : lv === cur ? "cur" : ""}" href="#/level/${lv}" style="--c:${LVC[lv]}"><div class="lvl-badge" style="background:${LVC[lv]}">${lv}</div><div class="lvl-body"><div class="lvl-head"><b>${LVN[lv]}</b><span class="lvl-pct">${st.pct}%</span></div>${bar(st.pct)}<div class="small muted">${LVD[lv]} · ${st.done}/${st.n} قصة${lv === cur ? " · <b>أنت هنا</b>" : ""}</div></div>${I("arrow")}</a>`; }).join("")}</div>
    </section>`);
    if(typeof renderEventsBar === "function") renderEventsBar();
  };

  /* ---------- كلماتي ---------- */
  routes.words = () => {
    const ws = Object.entries(LIB.words || {}).sort((a, b) => b[1].at - a[1].at);
    if(!ws.length) return render(crumb([{ t: "كلماتي" }]) + `<div class="card center"><h2>ما حفظت كلمات بعد</h2><p class="muted">افتح أي قصة، فعّل «اضغط كلمة لمعناها»، ثم احفظ الكلمات الجديدة لتراجعها هنا.</p><a class="btn btn-primary" href="#/">المكتبة</a></div>`);
    render(crumb([{ t: "كلماتي" }]) + `<div class="card sheet"><div class="section-title"><h1 style="margin:0">${I("bookmark")} كلماتي</h1><span class="badge">${ws.length} كلمة</span></div><p class="muted small" style="margin:0">الكلمات التي حفظتها أثناء القراءة. اضغط ${I("headphones")} لسماعها، أو احذف ما أتقنته.</p>${ws.length >= 4 ? `<div class="btn-row" style="margin-top:10px"><a class="btn btn-primary" href="#/wordsquiz">${I("pencil")} اختبر نفسك في كلماتي</a></div>` : ""}</div>
      <div class="word-list">${ws.map(([w, v]) => `<div class="word-row"><div class="w-en en"><b>${esc(w)}</b> <button type="button" class="spk sm" data-say="${esc(w)}">${I("headphones")}</button></div><div class="w-ar">${esc(v.ar)}</div><div class="w-ex small muted">${v.s ? "من قصة: " + esc((byId(v.s) || {}).ar || v.s) : ""}</div><button type="button" class="btn btn-sm wdel" data-w="${esc(w)}">${I("x")} حذف</button></div>`).join("")}</div>`);
    document.querySelectorAll(".wdel").forEach(b => b.addEventListener("click", () => { dropWord(b.dataset.w); routes.words(); }));
  };

  /* ---------- اختبار كلماتي المحفوظة ---------- */
  routes.wordsquiz = () => {
    const ws = Object.entries(LIB.words || {});
    if(ws.length < 4) return render(crumb([{ t: "كلماتي", href: "#/words" }, { t: "اختبار" }]) + `<div class="card center"><h2>تحتاج ٤ كلمات على الأقل</h2><p class="muted">احفظ كلمات أكثر أثناء القراءة ثم ارجع لتختبر نفسك.</p><a class="btn btn-primary" href="#/words">كلماتي</a></div>`);
    const pool = ws.map(([w, v]) => ({ w, ar: v.ar }));
    const list = shuffle(pool).slice(0, Math.min(12, pool.length)).map(x => {
      const dis = shuffle(pool.filter(y => y.ar !== x.ar)).slice(0, 3).map(y => y.ar);
      const opts = shuffle([x.ar, ...dis]);
      return { id: "sw-" + x.w, q: x.w, opts, a: opts.indexOf(x.ar), say: x.w };
    });
    let i = 0, score = 0, done = false; const ids = [];
    const show = () => {
      if(i >= list.length) return finish();
      const q = list[i];
      render(crumb([{ t: "كلماتي", href: "#/words" }, { t: "اختبار" }]) + `<div class="quiz-top"><h2 style="margin:0;font-size:1.15rem">${I("bookmark")} اختبار كلماتي</h2><div class="btn-row"><span class="badge ok">${I("check")} ${score}</span><span class="badge info">${i + 1} / ${list.length}</span></div></div>${bar(i / list.length * 100)}
        <div class="card q-card"><div class="btn-row" style="justify-content:space-between"><span class="badge">ما معنى الكلمة؟</span><button type="button" class="spk" data-say="${esc(q.q)}">${I("headphones")}</button></div>
        <div class="q-text en">${esc(q.q)}</div>
        <div class="opts-list" id="gopts">${q.opts.map((o, k) => `<button type="button" class="opt ar" data-k="${k}"><span class="letter">${["A", "B", "C", "D"][k]}</span><span>${esc(o)}</span></button>`).join("")}</div>
        <div class="feedback" id="gfb" hidden></div>
        <div class="quiz-nav" style="justify-content:space-between"><a class="btn btn-sm" href="#/words">خروج</a><button type="button" class="btn btn-primary" id="gnext" disabled>التالي ←</button></div></div>`);
      done = false;
      $("#gopts").querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
        if(done) return; done = true; const ok = +b.dataset.k === q.a;
        $("#gopts").querySelectorAll(".opt").forEach(x => { x.disabled = true; if(+x.dataset.k === q.a) x.classList.add("correct"); else if(x === b) x.classList.add("wrong"); });
        if(typeof Progress !== "undefined") Progress.record(q.id, ok); sfx(ok ? "correct" : "wrong"); if(ok){ score++; ids.push(q.id); }
        const fb = $("#gfb"); fb.hidden = false; fb.className = "feedback " + (ok ? "ok" : "bad");
        fb.innerHTML = `<b>${ok ? I("check") + " صحيح!" : I("x") + " الصحيح: " + esc(q.opts[q.a])}</b>`; hydrateIcons(fb);
        $("#gnext").disabled = false; $("#gnext").focus({ preventScroll: true });
        try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(q.q); u.lang = "en-US"; u.rate = .9; after(() => speechSynthesis.speak(u), 300); }catch(e){}
      }));
      $("#gnext").addEventListener("click", () => { if(!done) return; i++; show(); });
    };
    const finish = async () => {
      const pct = Math.round(score / list.length * 100); if(pct >= 80) confetti();
      addXP(score * 3);
      render(`<div class="card center sheet fade-up"><div class="score-ring" style="--p:${pct}"><span>${pct}%</span></div><h2>${score} من ${list.length}</h2><h3 class="muted" style="font-weight:600">اختبار كلماتي</h3><p class="muted">+${score * 3} XP</p><div id="srv"></div>
        <div class="btn-row" style="justify-content:center;margin-top:12px"><button type="button" class="btn btn-primary" id="again">${I("refresh")} مرة أخرى</button><a class="btn" href="#/words">كلماتي</a><a class="btn" href="#/">المكتبة</a></div></div>`);
      $("#again").addEventListener("click", () => routes.wordsquiz());
      const sb = $("#srv");
      if(!Auth.user() || !ids.length) return;
      try{ const j = await Auth.api("/api/result", { method: "POST", body: { mode: "vocab", score, total: list.length, seconds: 0, ids } }); sb.innerHTML = pointsHtml(j); hydrateIcons(sb); if(typeof Progress !== "undefined") Progress.sync(true); }catch(e){}
    };
    show();
  };

  /* ---------- LEVEL ---------- */
  routes.level = lv => {
    if(!LV.includes(lv)) return routes.home();
    const list = ALL.filter(s => s.lvl === lv); const st = levelStats(lv);
    render(crumb([{ t: `${lv} — ${LVN[lv]}` }]) + `<div class="card sheet lvl-top" style="--c:${LVC[lv]}"><div class="section-title"><div class="lvl-badge" style="background:${LVC[lv]}">${lv}</div><h1 style="margin:0">${LVN[lv]}</h1><span class="lvl-pct big">${st.pct}%</span></div>${bar(st.pct)}<p class="muted small" style="margin:8px 0 0">${LVD[lv]}. القصص مرتبة من الأسهل إلى الأصعب — ${st.done}/${st.n} مكتملة.</p></div>
      <div class="story-list">${list.map((s, i) => { const status = storyStatus(s); const d = LIB.done[s.id]; return `<a class="story ${status}" href="#/read/${s.id}"><div class="story-n" style="background:${status === "done" ? "var(--ok)" : LVC[lv]}">${status === "done" ? I("check") : i + 1}</div><div class="story-body"><div class="story-t en">${esc(s.title)}</div><div class="story-ar">${esc(s.ar)} <span class="muted small">· ${esc(s.author)}</span></div><div class="small muted">${KIND[s.kind] || ""} · ${wordsOf(s)} كلمة · ${I("headphones")} ${minutesOf(s)} دقيقة${d ? ` · <b style="color:var(--ok)">${d.score}/${d.total} في الأسئلة</b>` : status === "started" ? " · <b>بدأتها</b>" : ""}</div></div>${I("arrow")}</a>`; }).join("")}</div>
      ${LV.indexOf(lv) < LV.length - 1 ? `<div class="btn-row" style="justify-content:center;margin-top:16px"><a class="btn" href="#/level/${LV[LV.indexOf(lv) + 1]}">المستوى التالي: ${LV[LV.indexOf(lv) + 1]} ←</a></div>` : ""}`);
  };

  /* ---------- READER ---------- */
  routes.read = id => {
    const s = byId(id); if(!s) return routes.home();
    const spans = spansOf(s);
    const sents = spans.map(sp => ({ t: s.paras[sp.pi].en.slice(sp.cs, sp.ce), pi: sp.pi }));
    const times = TIMES[id] && TIMES[id].length ? spans : null;
    const hasAudio = !!times;
    let listenMode = false, arMode = LIB.arMode || (LIB.ar === false ? "off" : "on"), showGloss = false, dictMode = LIB.dict !== false;
    LIB.last = { id, para: LIB.pos[id] || 0 }; save();
    const draw = () => {
      render(crumb([{ t: `${s.lvl} — ${LVN[s.lvl]}`, href: `#/level/${s.lvl}` }, { t: s.ar }]) + `
      <div class="card sheet story-head"><div class="section-title">${lvBadge(s.lvl)}<span class="badge">${KIND[s.kind] || ""}</span>${LIB.done[id] ? `<span class="badge ok">${I("check")} مكتملة</span>` : ""}</div>
        <h1 class="en story-title">${esc(s.title)}</h1><div class="story-ar-title">${esc(s.ar)}</div>
        <p class="muted small">${esc(s.author)} · ${esc(s.origin || "")} · ${wordsOf(s)} كلمة · ${minutesOf(s)} دقائق استماع</p>
        <p class="story-intro">${esc(s.intro || "")}</p></div>
      <div class="player card" id="player">
        <div class="pl-row"><button type="button" class="btn btn-primary btn-lg" id="playBtn">${I("headphones")} استمع</button>
          <div class="pl-time"><span id="cur">0:00</span> / <span id="dur">${hasAudio ? fmt(times[times.length - 1].end) : "--"}</span></div>
          <div class="seg pl-speed" id="speedSeg">${[0.8, 1, 1.2].map(v => `<button type="button" data-v="${v}" class="${(LIB.speed || 1) === v ? "on" : ""}">${v === 1 ? "عادي" : v < 1 ? "أبطأ" : "أسرع"}</button>`).join("")}</div>
        </div>
        ${hasAudio && LIB.at && LIB.at[id] > 20 ? `<button type="button" class="btn btn-sm resume-chip" id="resumeBtn">${I("clock")} استأنف من ${fmt(LIB.at[id])}</button>` : ""}
        <div class="pl-bar" id="plBar"><div id="plFill"></div></div>
        <div class="btn-row pl-tools"><button type="button" class="btn btn-sm ${listenMode ? "on" : ""}" id="modeBtn">${I("headphones")} ${listenMode ? "أظهر النص" : "وضع الاستماع (أخفِ النص)"}</button><span class="seg seg-sm" id="arSeg"><button type="button" data-v="on" class="${arMode === "on" ? "on" : ""}">الترجمة</button><button type="button" data-v="tap" class="${arMode === "tap" ? "on" : ""}">عند الطلب</button><button type="button" data-v="off" class="${arMode === "off" ? "on" : ""}">بدون</button></span><button type="button" class="btn btn-sm ${dictMode ? "on" : ""}" id="dictBtn">${I("search")} ${dictMode ? "القاموس مفعّل" : "اضغط كلمة لمعناها"}</button><button type="button" class="btn btn-sm" id="glossBtn">${I("type")} المفردات (${s.glossary.length})</button></div>
        ${hasAudio ? "" : `<p class="small muted" style="margin:8px 0 0">${I("info")} الصوت المسجّل غير متوفر لهذه القصة بعد، سيقرأها صوت المتصفح.</p>`}
        <p class="small muted" style="margin:8px 0 0">اضغط أي جملة ليقرأها القارئ من عندها. الجملة الحالية تتلوّن أثناء الاستماع.</p>
      </div>
      ${showGloss ? `<div class="card gloss"><h3>${I("type")} كلمات القصة</h3><div class="gloss-grid">${s.glossary.map(g => `<div class="gl"><b class="en">${esc(g.w)}</b> <span class="muted small">${esc(g.pos || "")}</span><button type="button" class="spk sm" data-say="${esc(g.w)}">${I("headphones")}</button><div>${esc(g.ar)}</div></div>`).join("")}</div></div>` : ""}
      <article class="story-text ${listenMode ? "listen" : ""}" id="text">${s.paras.map((p, pi) => `<div class="para" data-pi="${pi}"><p class="en">${paraHtml(p, pi, spans)}</p>${arMode === "on" ? `<p class="ar-t">${esc(p.ar)}</p>` : arMode === "tap" ? `<details class="ar-tap"><summary>الترجمة</summary><p class="ar-t">${esc(p.ar)}</p></details>` : ""}</div>`).join("")}
        ${s.moral ? `<div class="note tip"><span class="ic">${I("bulb")}</span><p><b>الفكرة:</b> ${esc(s.moral)}</p></div>` : ""}
      </article>
      <div class="card center sheet"><h3>فهمت القصة؟</h3><p class="muted small">${s.qs.length} أسئلة فهم — كل سؤال تجيبه صح لأول مرة يعطيك نقطة في المنافسة.</p><div class="btn-row" style="justify-content:center"><a class="btn btn-warm btn-lg" href="#/quiz/${id}">${I("pencil")} أسئلة الفهم</a>${nextStory(s) ? `<a class="btn" href="#/read/${nextStory(s).id}">القصة التالية: ${esc(nextStory(s).ar)} ←</a>` : ""}</div></div>`);
      bindReader();
    };
    const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    const highlight = k => { document.querySelectorAll(".sent.now").forEach(e => e.classList.remove("now")); const el = document.querySelector(`.sent[data-k="${k}"]`); if(el){ el.classList.add("now"); const r = el.getBoundingClientRect(); if(r.top < 90 || r.bottom > innerHeight - 90) el.scrollIntoView({ block: "center", behavior: "smooth" }); const pi = +el.closest(".para").dataset.pi; if(pi !== LIB.pos[id]){ LIB.pos[id] = pi; LIB.last = { id, para: pi }; save(); } } };
    const bindReader = () => {
      $("#modeBtn").addEventListener("click", () => { listenMode = !listenMode; const st = player ? player.snapshot() : null; draw(); if(st) player.restore(st); });
      $("#arSeg").addEventListener("click", e => { const b = e.target.closest("button"); if(!b || b.dataset.v === arMode) return; arMode = b.dataset.v; LIB.arMode = arMode; save(); const st = player ? player.snapshot() : null; draw(); if(st) player.restore(st); });
      $("#glossBtn").addEventListener("click", () => { showGloss = !showGloss; const st = player ? player.snapshot() : null; draw(); if(st) player.restore(st); });
      $("#speedSeg").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; LIB.speed = +b.dataset.v; save(); $("#speedSeg").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); if(player) player.setRate(LIB.speed); });
      $("#dictBtn").addEventListener("click", () => { dictMode = !dictMode; LIB.dict = dictMode; save(); const st = player ? player.snapshot() : null; draw(); if(st) player.restore(st); toast(dictMode ? "اضغط أي كلمة إنجليزية لترى معناها" : "الضغط على الجملة يشغّل الصوت من عندها"); });
      $("#text").addEventListener("click", e => {
        const wEl = dictMode && e.target.closest(".w");
        if(wEl){ e.stopPropagation(); return showWord(wEl); }
        const el = e.target.closest(".sent"); if(!el) return; ensurePlayer().playFrom(+el.dataset.k);
      });
      $("#playBtn").addEventListener("click", () => ensurePlayer().toggle());
      const rb = $("#resumeBtn"); if(rb) rb.addEventListener("click", () => { ensurePlayer().seekSec(LIB.at[id]); rb.remove(); });
      $("#plBar").addEventListener("click", e => { if(!hasAudio) return; const r = e.currentTarget.getBoundingClientRect(); const frac = 1 - (e.clientX - r.left) / r.width; ensurePlayer().seekFrac(frac); });
      if(player) player.rebind();
      if(LIB.pos[id] > 0 && !listenMode){ const el = document.querySelector(`.para[data-pi="${LIB.pos[id]}"]`); if(el) after(() => el.scrollIntoView({ block: "start", behavior: "smooth" }), 300); }
    };
    function showWord(el){
      document.querySelectorAll(".wpop").forEach(x => x.remove());
      document.querySelectorAll(".w.sel").forEach(x => x.classList.remove("sel"));
      el.classList.add("sel");
      const raw = el.textContent, hit = lookup(raw, s);
      const key = raw.toLowerCase().replace(/[^a-z']/g, "");
      const saved = !!MYW()[key];
      const pop = document.createElement("div");
      pop.className = "wpop";
      pop.innerHTML = hit
        ? `<div class="wp-top"><b class="en">${esc(raw)}</b><span class="badge">${esc(hit.pos || "")}</span><button type="button" class="spk sm" data-say="${esc(raw)}">${I("headphones")}</button><button type="button" class="wp-x" aria-label="إغلاق">${I("x")}</button></div>
           <div class="wp-ar">${esc(hit.ar)}</div>
           ${hit.word && hit.word.toLowerCase() !== key ? `<div class="small muted">الأصل: <span class="en">${esc(hit.word)}</span></div>` : ""}
           ${hit.ex ? `<div class="small muted en">${esc(hit.ex)}</div>` : ""}
           <div class="wp-actions"><button type="button" class="btn btn-sm ${saved ? "" : "btn-primary"}" id="wpSave">${saved ? I("check") + " في كلماتي" : I("bookmark") + " احفظها"}</button></div>
           <div class="small muted">${esc(hit.src)}</div>`
        : `<div class="wp-top"><b class="en">${esc(raw)}</b><button type="button" class="spk sm" data-say="${esc(raw)}">${I("headphones")}</button><button type="button" class="wp-x" aria-label="إغلاق">${I("x")}</button></div><div class="muted small">هذه الكلمة ليست في قاموس الموقع. اضغط ${I("headphones")} لسماع نطقها.</div>`;
      document.body.appendChild(pop);
      if(innerWidth <= 640){ pop.classList.add("sheet-pop"); }
      else {
        const r = el.getBoundingClientRect(), h = 190;
        const below = innerHeight - r.bottom > h;
        pop.style.top = (below ? r.bottom + 8 : Math.max(8, r.top - h)) + scrollY + "px";
        pop.style.left = Math.min(Math.max(8, r.left + r.width / 2 - 130), innerWidth - 268) + "px";
      }
      hydrateIcons(pop);
      pop.querySelector(".wp-x").addEventListener("click", () => { pop.remove(); el.classList.remove("sel"); });
      const sv = pop.querySelector("#wpSave");
      if(sv) sv.addEventListener("click", () => { if(MYW()[key]) { dropWord(key); sv.innerHTML = I("bookmark") + " احفظها"; sv.classList.add("btn-primary"); } else { saveWord(key, hit.ar, s.id); sv.innerHTML = I("check") + " في كلماتي"; sv.classList.remove("btn-primary"); toast("حُفظت في كلماتي"); } hydrateIcons(sv); });
      after(() => document.addEventListener("click", function off(ev){ if(!pop.contains(ev.target)){ pop.remove(); el.classList.remove("sel"); document.removeEventListener("click", off); } }), 50);
    }
    const setBtn = playing => { const b = $("#playBtn"); if(b){ b.innerHTML = playing ? `${I("x")} إيقاف` : `${I("headphones")} استمع`; hydrateIcons(b); } };
    const ensurePlayer = () => { if(!player) player = hasAudio ? audioPlayer() : ttsPlayer(); return player; };
    /* مشغّل الصوت المسجّل مع مزامنة الجمل */
    function audioPlayer(){
      const a = new Audio(`audio/stories/${id}.mp3`); a.preload = "auto"; a.playbackRate = LIB.speed || 1;
      let cur = -1, raf = null, fallen = false, dead = false;
      const tick = () => { const t = a.currentTime; let k = times.findIndex(x => t >= x.start && t < x.end); if(k < 0 && t > 0) k = times.findIndex(x => x.start > t) - 1; if(k >= 0 && k !== cur){ cur = k; highlight(k); } const c = $("#cur"), f = $("#plFill"); if(c) c.textContent = fmt(t); if(f && a.duration) f.style.width = (t / a.duration * 100) + "%"; if(t > 5 && Math.floor(t) % 5 === 0){ LIB.at = LIB.at || {}; if(Math.abs((LIB.at[id] || 0) - t) > 4){ LIB.at[id] = Math.floor(t); save(); } } if(!a.paused) raf = requestAnimationFrame(tick); };
      /* الصوت قد لا يكون حمّل بياناته بعد: أجّل الانتقال حتى تجهز المدة */
      /* المتصفح يتجاهل الانتقال قبل تحميل بيانات الملف، فنعيد المحاولة حتى يستقر عند الجملة المطلوبة */
      let pending = null;
      const trySeek = () => {
        if(pending === null || a.readyState < 1) return;
        if(Math.abs(a.currentTime - pending) < 0.6){ pending = null; return; }
        try{ a.currentTime = pending; }catch(e){}
      };
      const seekTo = t => { pending = t; trySeek(); [120, 400, 900, 1800].forEach(ms => after(trySeek, ms)); };
      ["loadedmetadata", "loadeddata", "canplay", "canplaythrough", "playing", "durationchange", "seeked"].forEach(ev => a.addEventListener(ev, trySeek));
      a.addEventListener("play", () => { setBtn(true); tick(); }); a.addEventListener("pause", () => { setBtn(false); LIB.at = LIB.at || {}; LIB.at[id] = Math.floor(a.currentTime); save(); });
      a.addEventListener("ended", () => { setBtn(false); cur = -1; if(LIB.at) { delete LIB.at[id]; save(); } document.querySelectorAll(".sent.now").forEach(e => e.classList.remove("now")); LIB.listened[id] = true; save(); });
      a.addEventListener("error", () => { if(dead || fallen || !a.error) return; fallen = true; toast("تعذّر تحميل الصوت — سيقرأها صوت المتصفح"); player = ttsPlayer(); player.playFrom(Math.max(0, cur)); });
      const P = {
        toggle(){ if(a.paused){ a.play().catch(() => {}); } else a.pause(); },
        playFrom(k){ cur = -1; seekTo((times[k] ? times[k].start : 0) + 0.02); a.play().catch(() => {}); },
        seekSec(t){ cur = -1; seekTo(t); a.play().catch(() => {}); },
        seekFrac(f){ if(a.duration){ cur = -1; seekTo(Math.max(0, Math.min(a.duration - .1, f * a.duration))); if(a.paused) a.play().catch(() => {}); } },
        setRate(r){ a.playbackRate = r; },
        snapshot(){ return { t: a.currentTime, playing: !a.paused }; },
        restore(st){ cur = -1; seekTo(st.t); if(st.playing) a.play().catch(() => {}); else { setBtn(false); tick(); } },
        rebind(){ setBtn(!a.paused); if(!a.paused) tick(); },
        destroy(){ dead = true; a.pause(); cancelAnimationFrame(raf); try{ a.removeAttribute("src"); a.load(); }catch(e){} }
      };
      return P;
    }
    /* بديل: صوت المتصفح جملة جملة مع التلوين */
    function ttsPlayer(){
      let k = 0, playing = false, voices = [];
      const loadV = () => { try{ voices = speechSynthesis.getVoices(); }catch(e){} }; loadV(); try{ speechSynthesis.onvoiceschanged = loadV; }catch(e){}
      const pick = () => voices.find(v => /en[-_](US|GB)/i.test(v.lang) && /natural|neural|google|andrew|brian|ryan|daniel|samantha|aria|jenny/i.test(v.name)) || voices.find(v => /en[-_]US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
      const step = () => { if(!playing) return; if(k >= sents.length){ playing = false; setBtn(false); LIB.listened[id] = true; save(); document.querySelectorAll(".sent.now").forEach(e => e.classList.remove("now")); return; } highlight(k); const u = new SpeechSynthesisUtterance(sents[k].t); u.lang = "en-US"; u.rate = (LIB.speed || 1) * 0.95; const v = pick(); if(v) u.voice = v; u.onend = u.onerror = () => { if(!playing) return; k++; after(step, 250); }; speechSynthesis.speak(u); };
      const P = {
        toggle(){ if(playing){ playing = false; speechSynthesis.cancel(); setBtn(false); } else { playing = true; setBtn(true); speechSynthesis.cancel(); after(step, 100); } },
        playFrom(i){ speechSynthesis.cancel(); k = i; playing = true; setBtn(true); after(step, 100); },
        seekFrac(){}, seekSec(){}, setRate(){}, snapshot(){ return { k, playing }; },
        restore(st){ k = st.k; if(st.playing){ playing = true; setBtn(true); speechSynthesis.cancel(); after(step, 150); } },
        rebind(){ setBtn(playing); },
        destroy(){ playing = false; try{ speechSynthesis.cancel(); }catch(e){} }
      };
      return P;
    }
    draw();
  };

  /* ---------- QUIZ ---------- */
  routes.quiz = id => {
    const s = byId(id); if(!s) return routes.home();
    const list = s.qs.map((q, i) => ({ ...q, id: `st-${id}-${i}` })); let i = 0, score = 0, done = false; const ids = [];
    const show = () => {
      if(i >= list.length) return finish();
      const q = list[i];
      render(crumb([{ t: `${s.lvl}`, href: `#/level/${s.lvl}` }, { t: s.ar, href: `#/read/${id}` }, { t: "أسئلة الفهم" }]) + `<div class="quiz-top"><h2 style="margin:0;font-size:1.15rem">${esc(s.title)}</h2><div class="btn-row"><span class="badge ok">${I("check")} ${score}</span><span class="badge info">${i + 1} / ${list.length}</span></div></div>${bar(i / list.length * 100)}
        <div class="card q-card"><div class="q-text en">${esc(q.q)}</div>
        <div class="opts-list" id="gopts">${q.o.map((o, k) => `<button type="button" class="opt" data-k="${k}"><span class="letter">${["A", "B", "C", "D"][k]}</span><span>${esc(o)}</span></button>`).join("")}</div>
        <div class="feedback" id="gfb" hidden></div>
        <div class="quiz-nav" style="justify-content:space-between"><a class="btn btn-sm" href="#/read/${id}">${I("bookopen")} ارجع للقصة</a><button type="button" class="btn btn-primary" id="gnext" disabled>التالي ←</button></div></div>`);
      done = false;
      $("#gopts").querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
        if(done) return; done = true; const ok = +b.dataset.k === q.a;
        $("#gopts").querySelectorAll(".opt").forEach(x => { x.disabled = true; if(+x.dataset.k === q.a) x.classList.add("correct"); else if(x === b) x.classList.add("wrong"); });
        if(typeof Progress !== "undefined") Progress.record(q.id, ok); sfx(ok ? "correct" : "wrong"); if(ok){ score++; ids.push(q.id); }
        const fb = $("#gfb"); fb.hidden = false; fb.className = "feedback " + (ok ? "ok" : "bad"); fb.innerHTML = `<b>${ok ? I("check") + " صحيح!" : I("x") + " الصحيح: " + esc(q.o[q.a])}</b>${esc(q.ex || "")}`; hydrateIcons(fb);
        $("#gnext").disabled = false; $("#gnext").focus({ preventScroll: true });
      }));
      $("#gnext").addEventListener("click", () => { if(!done) return; i++; show(); });
    };
    const finish = async () => {
      const pct = Math.round(score / list.length * 100); const first = !LIB.done[id];
      if(!LIB.done[id] || LIB.done[id].score < score) LIB.done[id] = { score, total: list.length, at: Date.now() }; save();
      if(first) addXP(20 + score * 5);
      if(pct >= 80) confetti();
      const nx = nextStory(s);
      render(`<div class="card center sheet fade-up"><div class="score-ring" style="--p:${pct}"><span>${pct}%</span></div><h2>${score} من ${list.length}</h2><h3 class="muted" style="font-weight:600">${esc(s.title)}</h3><div id="srv"></div>
        <div class="btn-row" style="justify-content:center;margin-top:12px">${nx ? `<a class="btn btn-warm btn-lg" href="#/read/${nx.id}">${I("zap")} القصة التالية: ${esc(nx.ar)} ←</a>` : ""}<a class="btn" href="#/read/${id}">أعد القراءة</a><a class="btn" href="#/level/${s.lvl}">قصص ${s.lvl}</a></div></div>`);
      const sb = $("#srv");
      if(!Auth.user()){ sb.innerHTML = `<p class="small muted">${I("lock")} <a href="account.html">سجّل الدخول</a> لتُحسب نقاطك في المنافسة.</p>`; hydrateIcons(sb); return; }
      if(!ids.length){ sb.innerHTML = `<p class="small muted">لا إجابات صحيحة هذه المرة — أعد قراءة القصة وحاول مجددًا.</p>`; return; }
      try{ const j = await Auth.api("/api/result", { method: "POST", body: { mode: "reading", score, total: list.length, seconds: 0, ids } }); sb.innerHTML = pointsHtml(j); hydrateIcons(sb); if(typeof Progress !== "undefined") Progress.sync(true); }catch(e){ sb.innerHTML = `<p class="small" style="color:var(--bad)">${esc(e.message)}</p>`; }
    };
    show();
  };

  document.addEventListener("click", e => { const b = e.target.closest("[data-say]"); if(b){ try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(b.dataset.say); u.lang = "en-US"; u.rate = .9; speechSynthesis.speak(u); }catch(err){} } });
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", async () => { if(Auth.user() && typeof Progress !== "undefined") await Progress.sync(false); route(); });
})();
