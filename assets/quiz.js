/* ===== STEP English — exam-style quiz engine (+ challenges) ===== */
(function(){
  const $ = s => document.querySelector(s);
  const L = Bank.LETTERS;
  const S = { list: [], idx: 0, ans: {}, flag: new Set(), timer: null, left: 0, used: 0, mode: "grammar", topic: "all", count: 20, timed: true, startedAt: 0, challenge: null };
  const MODES = { grammar: "القواعد", vocab: "المفردات", reading: "القراءة", mix: "اختبار شامل", cgrammar: "تجميعات القرامر", clistening: "تجميعات الاستماع", creading: "تجميعات القطع", wrong: "مراجعة أخطائي" };
  const label = t => Bank.topicLabel(t);

  /* ---------- setup ---------- */
  function initSetup(){
    const params = new URLSearchParams(location.search);
    if(params.get("topic")){ S.mode = "grammar"; S.topic = params.get("topic"); }
    if(params.get("mode") && MODES[params.get("mode")]) S.mode = params.get("mode");

    const modeSeg = $("#modeSeg");
    modeSeg.innerHTML = Object.entries(MODES).map(([k, v]) => `<button type="button" data-v="${k}" class="${k === S.mode ? "on" : ""}">${v}</button>`).join("");
    modeSeg.addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; S.mode = b.dataset.v; modeSeg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); syncSetup(); });

    const sel = $("#topicSel");
    sel.innerHTML = `<option value="all">كل المواضيع</option>` + Object.entries(TOPICS).map(([k, v]) => `<option value="${k}" ${k === S.topic ? "selected" : ""}>${v} (${QUESTIONS.filter(q => q.topic === k).length})</option>`).join("");
    sel.addEventListener("change", () => S.topic = sel.value);

    $("#countSeg").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; S.count = b.dataset.v; $("#countSeg").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
    $("#timerChk").addEventListener("change", e => S.timed = e.target.checked);
    $("#startBtn").addEventListener("click", start);
    $("#clearBtn").addEventListener("click", () => { if(confirm("مسح سجل النتائج المحفوظة على هذا الجهاز؟")){ Store.del("step_history"); renderStats(); } });
    syncSetup(); renderStats();
  }
  function syncSetup(){
    $("#topicWrap").hidden = S.mode !== "grammar";
    const wrong = Progress.wrongIds().length;
    $("#wrongInfo").hidden = S.mode !== "wrong";
    $("#wrongInfo").innerHTML = wrong ? `<span class="ic"><i data-i='repeat'></i></span><p>لديك <b>${wrong}</b> سؤالًا كانت آخر إجابتك عليه خاطئة. ستُعرض كلها (لا تُحسب نقاطًا في المنافسة).</p>` : `<span class="ic"><i data-i='sparkles'></i></span><p>لا توجد أخطاء معلّقة. حل اختبارًا أو تدريبًا وستُحفظ الأسئلة التي تخطئ فيها هنا تلقائيًا.</p>`;
    $("#countWrap").hidden = S.mode === "wrong";
  }
  function renderStats(){
    const hist = Store.get("step_history", []), host = $("#stats");
    if(!hist.length){ host.innerHTML = `<h3>آخر النتائج</h3><p class="muted small">لا توجد نتائج سابقة على هذا الجهاز.</p>`; return; }
    host.innerHTML = `<h3>آخر النتائج</h3><div class="table-wrap"><table><thead><tr><th>التاريخ</th><th>النوع</th><th class="en">الدرجة</th><th>النسبة</th></tr></thead><tbody>${hist.slice(-8).reverse().map(h => `<tr><td>${fmtDate(h.d)}</td><td>${MODES[h.mode] || label(h.mode)}</td><td class="en">${h.score} / ${h.total}</td><td><span class="badge ${h.score / h.total >= .7 ? "ok" : "bad"}">${Math.round(h.score / h.total * 100)}٪</span></td></tr>`).join("")}</tbody></table></div>`;
  }

  /* ---------- challenge ---------- */
  async function loadChallenge(id){
    $("#setup").hidden = true; const box = $("#chalBox"); box.hidden = false;
    box.innerHTML = `<div class="card center"><p class="muted">جارٍ تحميل التحدي…</p></div>`;
    try{
      const j = await Auth.api("/api/challenge?id=" + encodeURIComponent(id));
      S.challenge = j.challenge;
      const list = Bank.byIds(j.challenge.qids);
      if(!list.length) throw new Error("أسئلة هذا التحدي غير متوفرة");
      const meta = `<div class="section-title"><span class="badge pink"><i data-i='swords'></i> تحدي</span><h2 style="margin:0">${esc(j.challenge.title)}</h2></div>
        <p class="muted">بواسطة <b>${esc(j.challenge.byName)}</b> · ${label(j.challenge.mode)}${j.challenge.mode === "grammar" && j.challenge.topic !== "all" ? " — " + label(j.challenge.topic) : ""} · ${list.length} سؤال · ${j.challenge.timed ? "<i data-i='timer'></i> بمؤقت" : "بدون مؤقت"} · ${j.board.length} مشارك</p>`;
      if(!Auth.user()){
        box.innerHTML = `<div class="card">${meta}<div class="note warn"><span class="ic"><i data-i='lock'></i></span><p>سجّل الدخول أو أنشئ حسابًا لتشارك في التحدي وتظهر نتيجتك في الترتيب.</p></div><a class="btn btn-primary" href="account.html?next=${encodeURIComponent("quiz.html?challenge=" + id)}">تسجيل الدخول ←</a></div>`;
      } else if(j.mine){
        box.innerHTML = `<div class="card">${meta}<div class="note ok"><span class="ic"><i data-i='check'></i></span><p>أنجزت هذا التحدي: <b>${j.mine.score} / ${j.mine.total}</b> — ترتيبك <b>#${j.mine.rank}</b>. كل تحدٍ يُحسب من أول محاولة فقط.</p></div>
          <h3>الترتيب</h3><div class="lb">${j.board.map(r => lbRow({ ...r, points: r.score + " / " + r.total }, false).replace("نقطة", "")).join("")}</div>
          <div class="btn-row" style="margin-top:14px"><a class="btn" href="compete.html">كل التحديات</a><a class="btn btn-primary" href="quiz.html">اختبار عادي</a></div></div>`;
      } else {
        box.innerHTML = `<div class="card">${meta}<div class="note info"><span class="ic"><i data-i='info'></i></span><p>تُحسب <b>المحاولة الأولى فقط</b>. رتّب وقتك: إذا أغلقت الصفحة قبل الإنهاء تضيع المحاولة. الترتيب حسب الدرجة ثم الوقت.</p></div>
          <button type="button" class="btn btn-warm btn-lg" id="chalStart"><i data-i='fire'></i> ابدأ التحدي الآن</button></div>`;
        $("#chalStart").addEventListener("click", () => { S.list = list; S.mode = "challenge"; S.timed = !!j.challenge.timed; box.hidden = true; startList(); });
      }
    }catch(e){ box.innerHTML = `<div class="card"><div class="note bad"><span class="ic"><i data-i='alert'></i></span><p>${esc(e.message)}</p></div><a class="btn" href="quiz.html">اختبار عادي</a></div>`; }
  }

  /* ---------- run ---------- */
  function build(){
    if(S.mode === "wrong") return Bank.groupPassages(Bank.byIds(Progress.wrongIds()));
    return Bank.groupPassages(Bank.pick(S.mode, S.topic, S.count));
  }
  function start(){
    S.list = build(); S.challenge = null;
    if(!S.list.length){ toast("لا توجد أسئلة لهذا الاختيار"); return; }
    startList();
  }
  function startList(){
    S.idx = 0; S.ans = {}; S.flag = new Set(); S.startedAt = Date.now();
    clearInterval(S.timer);
    $("#setup").hidden = true; $("#results").hidden = true; $("#review").hidden = true; $("#quiz").hidden = false;
    if(S.timed){ S.left = S.list.length * 60; $("#timer").hidden = false; tick(); S.timer = setInterval(tick, 1000); } else { $("#timer").hidden = true; }
    $("#chalBanner").hidden = !S.challenge;
    if(S.challenge) $("#chalBanner").innerHTML = `<i data-i='swords'></i> تحدي: <b>${esc(S.challenge.title)}</b>`;
    renderQ(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function tick(){
    const t = $("#timer"), m = Math.floor(S.left / 60), s = S.left % 60;
    t.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    t.classList.toggle("low", S.left <= 60);
    if(typeof SFX !== "undefined"){ if(S.left <= 0) SFX.timeout(); else if(S.left <= 10) SFX.tick(); }
    if(S.left <= 0){ clearInterval(S.timer); finish(true); return; }
    S.left--;
  }
  function renderQ(){
    const q = S.list[S.idx];
    $("#qCounter").textContent = `السؤال ${S.idx + 1} من ${S.list.length}`;
    $("#bar").style.width = (S.idx / S.list.length * 100) + "%";
    $("#qType").textContent = q.type === "error" ? "اختر الجزء الذي فيه الخطأ" : label(q.kind === "grammar" || q.kind === "coll" ? q.topic : q.kind);
    $("#qType").className = "badge " + (q.type === "error" ? "accent" : "");
    const pb = $("#passageBox");
    if(q.pid){ const p = PASSAGES.find(x => x.id === q.pid); pb.hidden = false; pb.innerHTML = `<details class="passage-box" open><summary><i data-i='bookopen'></i> ${esc(p.title)} — اقرأ القطعة</summary><div class="ptext">${esc(p.text)}</div></details>`; }
    else { pb.hidden = true; pb.innerHTML = ""; }
    $("#qText").innerHTML = q.q;
    $("#opts").innerHTML = q.opts.map((o, k) => `<button type="button" class="opt ${S.ans[S.idx] === k ? "selected" : ""}" data-k="${k}"><span class="letter">${L[k]}</span><span>${esc(o)}</span></button>`).join("");
    $("#opts").querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => { if(typeof SFX !== "undefined") SFX.click(); S.ans[S.idx] = +b.dataset.k; $("#opts").querySelectorAll(".opt").forEach(x => x.classList.toggle("selected", x === b)); }));
    $("#flagBtn").classList.toggle("btn-primary", S.flag.has(S.idx));
    $("#flagBtn").innerHTML = S.flag.has(S.idx) ? "<i data-i='flag'></i> معلَّم للمراجعة" : "<i data-i='flag'></i> علِّم للمراجعة";
    $("#prevBtn").disabled = S.idx === 0;
    $("#nextBtn").textContent = S.idx === S.list.length - 1 ? "صفحة المراجعة ←" : "التالي ←";
  }
  function go(d){ S.idx = Math.max(0, Math.min(S.list.length - 1, S.idx + d)); renderQ(); }
  function showReview(){
    $("#quiz").hidden = true; $("#review").hidden = false;
    const n = S.list.length, answered = Object.keys(S.ans).length;
    $("#reviewSummary").innerHTML = `أجبت على <b>${answered}</b> من <b>${n}</b> — غير مُجاب: <b>${n - answered}</b> — معلَّم: <b>${S.flag.size}</b>`;
    $("#reviewGrid").innerHTML = S.list.map((q, i) => `<button type="button" data-i="${i}" class="${S.ans[i] !== undefined ? "answered" : ""} ${S.flag.has(i) ? "flagged" : ""}">${i + 1}</button>`).join("");
    $("#reviewGrid").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { S.idx = +b.dataset.i; $("#review").hidden = true; $("#quiz").hidden = false; renderQ(); }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- finish ---------- */
  async function finish(timeout){
    clearInterval(S.timer);
    S.used = Math.round((Date.now() - S.startedAt) / 1000);
    let score = 0; const byTopic = {};
    S.list.forEach((q, i) => {
      const ok = S.ans[i] === q.a; if(ok) score++;
      const t = q.kind === "grammar" || q.kind === "coll" ? q.topic : q.kind; byTopic[t] = byTopic[t] || { ok: 0, n: 0 }; byTopic[t].n++; if(ok) byTopic[t].ok++;
      Progress.record(q.id, ok);
    });
    const hist = Store.get("step_history", []); hist.push({ d: new Date().toISOString(), mode: S.mode, score, total: S.list.length }); Store.set("step_history", hist.slice(-100));

    $("#quiz").hidden = true; $("#review").hidden = true; $("#results").hidden = false;
    const pct = Math.round(score / S.list.length * 100), mm = Math.floor(S.used / 60), ss = S.used % 60;
    $("#results").innerHTML = `
      <div class="card center fade-up">
        ${timeout ? `<div class="note warn"><span class="ic"><i data-i='clock'></i></span><p>انتهى الوقت! تم احتساب ما أجبت عليه.</p></div>` : ""}
        <div class="score-ring" style="--p:${pct}"><span>${pct}٪</span></div>
        <h2>${score} من ${S.list.length}</h2>
        <p class="muted">${pct >= 85 ? "ممتاز! مستوى قوي <i data-i='sparkles'></i>" : pct >= 70 ? "جيد جدًا، راجع الأخطاء وستتحسن أكثر <i data-i='check'></i>" : pct >= 50 ? "لا بأس، ركّز على المواضيع الضعيفة في الجدول أدناه <i data-i='zap'></i>" : "تحتاج مراجعة الدروس ثم أعد المحاولة — الاستمرار هو السر <i data-i='plant'></i>"} — الوقت: <span class="en">${mm}:${String(ss).padStart(2, "0")}</span></p>
        <div id="serverBox"></div>
        <div class="btn-row" style="justify-content:center;margin-top:12px">
          <button type="button" class="btn btn-primary" id="againBtn"><i data-i='refresh'></i> اختبار جديد</button>
          <button type="button" class="btn" id="retryWrongBtn" ${score === S.list.length ? "disabled" : ""}><i data-i='x'></i> أعد الأسئلة الخاطئة فقط</button>
          <a class="btn" href="train.html?mode=weak&start=1"><i data-i='target'></i> تدرّب على نقاط ضعفك</a>
          <label class="check"><input type="checkbox" id="onlyWrong"> عرض الأخطاء فقط</label>
        </div>
      </div>
      <div class="card" style="margin-top:16px"><h3>النتيجة حسب الموضوع</h3><div class="table-wrap"><table><thead><tr><th>الموضوع</th><th class="en">صح / الكل</th><th>النسبة</th></tr></thead><tbody>
        ${Object.entries(byTopic).sort((a, b) => (a[1].ok / a[1].n) - (b[1].ok / b[1].n)).map(([t, v]) => `<tr><td>${label(t)} ${v.ok < v.n ? lessonLink(t) : ""}</td><td class="en">${v.ok} / ${v.n}</td><td><span class="badge ${v.ok / v.n >= .7 ? "ok" : "bad"}">${Math.round(v.ok / v.n * 100)}٪</span></td></tr>`).join("")}
      </tbody></table></div></div>
      <h3 style="margin-top:22px">مراجعة الأسئلة</h3>
      <div id="resList">${S.list.map((q, i) => {
        const ua = S.ans[i], ok = ua === q.a, p = q.pid ? PASSAGES.find(x => x.id === q.pid) : null;
        return `<div class="res-item ${ok ? "right" : "wrong"}" data-ok="${ok}">
          <div><span class="badge ${ok ? "ok" : "bad"}">${i + 1}</span> <span class="badge">${label(q.kind === "grammar" || q.kind === "coll" ? q.topic : q.kind)}</span> ${q.src === "real" ? '<span class="badge accent">نموذج حقيقي</span>' : ""}</div>
          ${p ? `<details class="passage-box" style="margin:8px 0"><summary><i data-i='bookopen'></i> ${esc(p.title)}</summary><div class="ptext">${esc(p.text)}</div></details>` : ""}
          <div class="q-text">${q.q}</div>
          <div class="ans">${ua === undefined ? "<span style='color:var(--bad)'>— لم تُجب —</span>" : `Your answer: <b style="color:${ok ? "var(--ok)" : "var(--bad)"}">${L[ua]}) ${esc(q.opts[ua])}</b>`}</div>
          ${explainHtml(q, ua)}</div>`; }).join("")}</div>`;
    if(pct >= 80) confetti();
    $("#againBtn").addEventListener("click", () => { $("#results").hidden = true; $("#setup").hidden = false; S.challenge = null; history.replaceState(null, "", "quiz.html"); renderStats(); syncSetup(); window.scrollTo({ top: 0 }); });
    $("#retryWrongBtn").addEventListener("click", () => { const w = S.list.filter((q, i) => S.ans[i] !== q.a); S.list = w; S.mode = "wrong"; S.challenge = null; S.timed = false; $("#results").hidden = true; startList(); });
    $("#onlyWrong").addEventListener("change", e => { document.querySelectorAll("#resList .res-item").forEach(el => el.hidden = e.target.checked && el.dataset.ok === "true"); });
    window.scrollTo({ top: 0, behavior: "smooth" });

    /* ---- server: points, rank, challenge board ---- */
    const sb = $("#serverBox");
    if(!Auth.user()){ sb.innerHTML = `<p class="small muted"><i data-i='lock'></i> <a href="account.html">سجّل الدخول</a> لتُحسب نقاطك في ترتيب المنافسة.</p>`; return; }
    sb.innerHTML = `<p class="small muted">جارٍ حفظ النتيجة…</p>`;
    try{
      const j = await Auth.api("/api/result", { method: "POST", body: { mode: S.mode, score, total: S.list.length, seconds: S.used, challenge: S.challenge ? S.challenge.id : null, ids: S.list.filter((x, i) => S.ans[i] === x.a).map(x => x.id) } });
      let html = `<div id="ptsBox"></div>`;
      if(j.challengeBoard){
        html += `<h3 style="margin-top:14px"><i data-i='swords'></i> ترتيب التحدي «${esc(j.challenge.title)}»</h3><div class="lb" style="text-align:right">${j.challengeBoard.map(r => `<div class="lb-row ${r.u === Auth.user().u ? "me" : ""} ${r.rank <= 3 ? "top" + r.rank : ""}"><div class="rk ${r.rank <= 3 ? "medal" : ""}">${r.rank <= 3 ? I("medal", "medal-" + r.rank) : r.rank}</div>${avatarHtml(r.name, r.u)}<div class="nm">${esc(r.name)}<div class="sub">${Math.floor(r.seconds / 60)}:${String(r.seconds % 60).padStart(2, "0")} دقيقة</div></div><div class="pt">${r.score} / ${r.total}</div></div>`).join("")}</div><div class="btn-row" style="justify-content:center;margin-top:10px"><a class="btn btn-sm" href="compete.html?c=${j.challenge.id}">صفحة التحدي</a></div>`;
      }
      sb.innerHTML = html; pointsReveal(j, sb.querySelector("#ptsBox"));
      Progress.sync(true);
    }catch(e){ sb.innerHTML = `<p class="small" style="color:var(--bad)">${esc(e.message)}</p>`; }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSetup();
    $("#prevBtn").addEventListener("click", () => go(-1));
    $("#nextBtn").addEventListener("click", () => { if(S.idx === S.list.length - 1) showReview(); else go(1); });
    $("#reviewBtn").addEventListener("click", showReview);
    $("#flagBtn").addEventListener("click", () => { if(S.flag.has(S.idx)) S.flag.delete(S.idx); else S.flag.add(S.idx); renderQ(); });
    $("#backToQuiz").addEventListener("click", () => { $("#review").hidden = true; $("#quiz").hidden = false; renderQ(); });
    $("#finishBtn").addEventListener("click", () => { const un = S.list.length - Object.keys(S.ans).length; if(un && !confirm(`لديك ${un} سؤالًا بدون إجابة. إنهاء الاختبار؟`)) return; finish(false); });
    document.addEventListener("keydown", e => {
      if($("#quiz").hidden || e.target.tagName === "INPUT") return;
      if(e.key === "ArrowLeft"){ if(S.idx < S.list.length - 1) go(1); }
      else if(e.key === "ArrowRight") go(-1);
      else if(/^[1-4]$/.test(e.key)){ const b = $("#opts").querySelectorAll(".opt")[+e.key - 1]; if(b) b.click(); }
    });
    const sp = new URLSearchParams(location.search);
    const c = sp.get("challenge");
    if(c) loadChallenge(c);
    const coll = sp.get("coll"), model = +sp.get("model");
    if(coll && Bank.CKEY[coll] === undefined && Object.values(Bank.CKEY).includes(coll) && model){
      const list = Bank.collModel(coll, model);
      if(list.length){ S.list = list; S.mode = { listening: "clistening", grammar: "cgrammar", reading: "creading" }[coll]; S.challenge = null; S.timed = true;
        $("#setup").hidden = true; const box = $("#chalBox"); box.hidden = false;
        box.innerHTML = `<div class="card"><div class="section-title"><span class="badge teal"><i data-i='library'></i> تجميعات</span><h2 style="margin:0">${Bank.CLABEL[S.mode]} — النموذج ${model}</h2></div><p class="muted">${list.length} سؤالًا من هذا النموذج بالترتيب، مع مؤقت دقيقة لكل سؤال. النتيجة تُحسب نقاطًا في المنافسة.</p><div class="btn-row"><button type="button" class="btn btn-primary btn-lg" id="collStart">ابدأ ←</button><label class="check"><input type="checkbox" id="collTimed" checked> مؤقت</label><a class="btn" href="collections.html?c=${coll}&model=${model}">تصفح النموذج</a></div></div>`;
        $("#collStart").addEventListener("click", () => { S.timed = $("#collTimed").checked; box.hidden = true; startList(); });
      }
    }
  });
})();
