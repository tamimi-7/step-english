/* ===== STEP English — adaptive training (smart / weak points / spaced review) ===== */
(function(){
  const $ = s => document.querySelector(s);
  const L = Bank.LETTERS;
  const S = { mode: "smart", count: 10, list: [], idx: 0, correct: 0, ids: [], done: false, topics: null, before: {}, startedAt: 0 };
  const MODE_INFO = {
    smart: { t: "تدريب ذكي", ic: "<i data-i='brain'></i>", bg: "linear-gradient(135deg,#6d28d9,#4f46e5)", d: "النظام يختار الأسئلة المناسبة لمستواك: يركّز على ما أخطأت فيه وعلى الأسئلة الجديدة والمواضيع الأضعف تلقائيًا." },
    weak: { t: "نقاط الضعف", ic: "<i data-i='chartdown'></i>", bg: "linear-gradient(135deg,#e11d48,#f97316)", d: "ركّز على المواضيع ذات الإتقان الأقل لتحسين مستواك بسرعة." },
    review: { t: "مراجعة", ic: "<i data-i='repeat'></i>", bg: "linear-gradient(135deg,#d97706,#fbbf24)", d: "أسئلة حان وقت مراجعتها بنظام التكرار المتباعد لتثبيت المعلومة في الذاكرة." },
    marks: { t: "أسئلتي المعلَّمة", ic: "<i data-i='bookmark'></i>", bg: "linear-gradient(135deg,#0d9488,#2dd4bf)", d: "الأسئلة التي علّمت عليها بنفسك من الاختبارات والتجميعات لتذاكرها متى شئت." }
  };
  const fmtWhen = t => { const d = Math.round((t - Date.now()) / 60000); if(d < 60) return `بعد ${Math.max(1, d)} دقيقة`; if(d < 1440) return `بعد ${Math.round(d / 60)} ساعة`; return `بعد ${Math.round(d / 1440)} يوم`; };

  /* ---------- dashboard ---------- */
  function renderDash(){
    const o = Progress.overall(), streak = Progress.streak();
    $("#ring").style.setProperty("--p", o.pct); $("#ring span").textContent = o.pct + "٪";
    $("#dashMeta").innerHTML = `<span class="chip"><i data-i='library'></i> ${o.total} سؤال</span><span class="chip"><i data-i='check'></i> ${o.answered} إجابة</span><span class="chip"><i data-i='target'></i> دقة ${o.acc}٪</span><span class="chip"><i data-i='fire'></i> ${streak} ${streak === 1 ? "يوم" : "أيام"} متتالية</span>`;
    const weak = Progress.weakTopics(3), due = Progress.dueIds().length, nextDue = Progress.nextDue();
    const cards = $("#modeCards");
    cards.innerHTML = Object.entries(MODE_INFO).map(([k, m]) => {
      let meta = "", disabled = false;
      if(k === "smart") meta = `<span><i data-i='library'></i> ${o.total} سؤال</span><span><i data-i='target'></i> ${o.pct}٪ إتقان</span>`;
      if(k === "weak"){ if(weak.length) meta = weak.slice(0, 3).map(w => `<span>${Bank.topicLabel(w.t)} <b>${w.pct}٪</b></span>`).join(""); else { meta = `<span>أجب على بعض الأسئلة أولًا لاكتشاف نقاط ضعفك</span>`; disabled = true; } }
      if(k === "review"){ if(due) meta = `<span><i data-i='bell'></i> ${due} سؤال حان وقت مراجعته</span>`; else { meta = `<span>${nextDue ? "لا شيء الآن — الموعد القادم " + fmtWhen(nextDue) : "أجب على بعض الأسئلة أولًا لبدء المراجعة"}</span>`; disabled = true; } }
      if(k === "marks"){ const nm = Progress.marks().length; if(nm) meta = `<span><i data-i='bookmark'></i> ${nm} سؤال معلَّم</span>`; else { meta = `<span>علّم على أي سؤال من نتائج الاختبار أو التجميعات ليظهر هنا</span>`; disabled = true; } }
      return `<button type="button" class="mode-card ${k === S.mode ? "on" : ""} ${disabled ? "disabled" : ""}" data-mode="${k}" ${disabled ? "disabled" : ""}>
        <span class="mi" style="background:${m.bg}">${m.ic}</span>
        <span><span class="mt">${m.t} ${k === "smart" ? '<span class="badge">موصى به</span>' : ""}</span><span class="md">${m.d}</span><span class="mm">${meta}</span></span></button>`;
    }).join("");
    cards.querySelectorAll(".mode-card:not([disabled])").forEach(b => b.addEventListener("click", () => { S.mode = b.dataset.mode; S.topics = null; cards.querySelectorAll(".mode-card").forEach(x => x.classList.toggle("on", x === b)); $("#topicHint").hidden = true; }));
    if(MODE_INFO[S.mode] && cards.querySelector(`[data-mode="${S.mode}"]`)?.disabled){ S.mode = "smart"; cards.querySelector('[data-mode="smart"]').classList.add("on"); }

    const all = Progress.allTopics().sort((a, b) => a.pct - b.pct);
    $("#topics").innerHTML = all.map(m => `<div class="mastery-row"><div>${Bank.topicLabel(m.t)} <span class="muted small">(${m.seen}/${m.total}${m.wrong ? " · " + m.wrong + " خطأ" : ""})</span> <button type="button" class="btn btn-sm" style="padding:2px 10px;font-size:.8rem" data-topic="${m.t}">تدرّب</button> ${lessonLink(m.t)}</div><div class="pct">${m.pct}٪</div><div class="bar"><div class="${masteryClass(m.pct)}" style="width:${m.pct}%"></div></div></div>`).join("");
    $("#topics").querySelectorAll("[data-topic]").forEach(b => b.addEventListener("click", () => startSession("smart", [b.dataset.topic])));
  }

  /* ---------- session ---------- */
  function startSession(mode, topics){
    let list = mode === "smart" ? Progress.smart(S.count, topics) : mode === "weak" ? Progress.weak(S.count) : mode === "marks" ? Progress.marked(S.count) : Progress.review(S.count);
    if(!list || !list.length){ toast("لا توجد أسئلة متاحة لهذا الوضع الآن"); return; }
    S.mode = mode; S.topics = topics || null; S.list = list; S.idx = 0; S.correct = 0; S.ids = []; S.startedAt = Date.now();
    S.before = {}; for(const m of Progress.allTopics()) S.before[m.t] = m.pct;
    $("#dash").hidden = true; $("#summary").hidden = true; $("#session").hidden = false;
    $("#sessTitle").innerHTML = `${MODE_INFO[mode].ic} ${MODE_INFO[mode].t}${topics && topics.length === 1 ? " — " + Bank.topicLabel(topics[0]) : ""}`;
    renderQ(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function renderQ(){
    const q = S.list[S.idx]; S.done = false;
    $("#tCounter").textContent = `${S.idx + 1} / ${S.list.length}`;
    $("#tScore").innerHTML = `<i data-i='check'></i> ${S.correct}`;
    $("#tBar").style.width = (S.idx / S.list.length * 100) + "%";
    $("#tType").textContent = q.type === "error" ? "اختر الجزء الذي فيه الخطأ" : Bank.topicLabel(q.kind === "grammar" || q.kind === "coll" ? q.topic : q.kind);
    const r = Progress.data.q[q.id];
    $("#tHist").textContent = !r || !r.n ? "سؤال جديد" : r.lvl === 0 ? "أخطأت فيه سابقًا" : `أجبت عليه صح ${r.s} ${r.s === 1 ? "مرة" : "مرات"} متتالية`;
    const pb = $("#tPassage");
    if(q.pid){ const p = PASSAGES.find(x => x.id === q.pid); pb.hidden = false; pb.innerHTML = `<details class="passage-box" open><summary><i data-i='bookopen'></i> ${esc(p.title)}</summary><div class="ptext">${esc(p.text)}</div></details>`; } else { pb.hidden = true; pb.innerHTML = ""; }
    $("#tText").innerHTML = q.q;
    $("#tOpts").innerHTML = q.opts.map((o, k) => `<button type="button" class="opt" data-k="${k}"><span class="letter">${L[k]}</span><span>${esc(o)}</span></button>`).join("");
    $("#tOpts").querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => answer(+b.dataset.k)));
    $("#tFeedback").hidden = true; $("#tNext").disabled = true;
    $("#tNext").textContent = S.idx === S.list.length - 1 ? "إنهاء الجولة ←" : "التالي ←";
  }
  function answer(k){
    if(S.done) return; S.done = true;
    const q = S.list[S.idx], ok = k === q.a;
    $("#tOpts").querySelectorAll(".opt").forEach(b => { b.disabled = true; if(+b.dataset.k === q.a) b.classList.add("correct"); else if(+b.dataset.k === k) b.classList.add("wrong"); });
    Progress.record(q.id, ok); if(ok){ S.correct++; S.ids.push(q.id); }
    if(typeof SFX !== "undefined") SFX[ok ? "correct" : "wrong"]();
    $("#tScore").innerHTML = `<i data-i='check'></i> ${S.correct}`;
    const fb = $("#tFeedback"); fb.hidden = false; fb.className = "feedback " + (ok ? "ok" : "bad");
    fb.innerHTML = ok ? `<b>${I("check")} إجابة صحيحة</b>${I("bulb")} ${esc(q.ex)}<div class="btn-row" style="margin-top:8px">${markBtn(q.id)}${lessonLink(q.kind === "grammar" || q.kind === "coll" ? q.topic : q.kind, "افتح شرح القاعدة")}</div>` : explainHtml(q, k);
    $("#tNext").disabled = false; $("#tNext").focus();
  }
  function next(){ if(!S.done) return; S.idx++; if(S.idx >= S.list.length) finish(); else renderQ(); }
  async function finish(){
    $("#session").hidden = true; $("#summary").hidden = false;
    const total = S.list.length, pct = Math.round(S.correct / total * 100), secs = Math.round((Date.now() - S.startedAt) / 1000);
    const touched = [...new Set(S.list.map(q => q.kind === "grammar" || q.kind === "coll" ? q.topic : q.kind))];
    const rows = touched.map(t => { const now = Progress.topicMastery(t).pct, before = S.before[t] || 0; const d = now - before; return `<div class="mastery-row"><div>${Bank.topicLabel(t)} ${lessonLink(t)}</div><div class="pct">${before}٪ → ${now}٪ <span class="badge ${d > 0 ? "ok" : d < 0 ? "bad" : ""}">${d > 0 ? "+" : ""}${d}</span></div><div class="bar"><div class="${masteryClass(now)}" style="width:${now}%"></div></div></div>`; }).join("");
    $("#summary").innerHTML = `<div class="card center fade-up">
        <div class="score-ring" style="--p:${pct}"><span>${pct}٪</span></div>
        <h2>${S.correct} من ${total}</h2>
        <p class="muted">${pct >= 80 ? "ممتاز! استمر على هذا المستوى <i data-i='fire'></i>" : pct >= 60 ? "جيد — كرر التدريب وستثبت المعلومات <i data-i='check'></i>" : "لا تقلق، الأخطاء هنا هي أفضل معلّم. ستظهر لك هذه الأسئلة مجددًا في المراجعة <i data-i='plant'></i>"}</p>
        <div id="trainServer"></div>
        <div class="btn-row" style="justify-content:center;margin-top:12px">
          <button type="button" class="btn btn-primary" id="againBtn"><i data-i='refresh'></i> جولة أخرى</button>
          <button type="button" class="btn" id="backBtn">لوحة التدريب</button>
          <a class="btn" href="quiz.html"><i data-i='pencil'></i> اختبار بمؤقت</a>
        </div></div>
      <div class="card" style="margin-top:16px"><h3>تغيّر الإتقان في هذه الجولة</h3>${rows}</div>`;
    if(pct >= 80) confetti();
    $("#againBtn").addEventListener("click", () => startSession(S.mode, S.topics));
    $("#backBtn").addEventListener("click", () => { $("#summary").hidden = true; $("#dash").hidden = false; renderDash(); window.scrollTo({ top: 0 }); });
    window.scrollTo({ top: 0, behavior: "smooth" });
    const sb = $("#trainServer");
    if(!Auth.user()){ sb.innerHTML = `<p class="small muted"><i data-i='lock'></i> <a href="account.html">سجّل الدخول</a> لتُحسب نقاط التدريب في المنافسة ويُحفظ تقدمك على حسابك.</p>`; return; }
    try{
      const j = await Auth.api("/api/result", { method: "POST", body: { mode: "train", score: S.correct, total, seconds: secs, ids: S.ids } });
      sb.innerHTML = pointsHtml(j);
      Progress.sync(true);
    }catch(e){ sb.innerHTML = `<p class="small" style="color:var(--bad)">${esc(e.message)}</p>`; }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(location.search);
    if(Auth.user()) await Progress.sync(false);
    renderDash();
    $("#countSeg").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; S.count = +b.dataset.v; $("#countSeg").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
    $("#startBtn").addEventListener("click", () => startSession(S.mode, S.topics));
    $("#tNext").addEventListener("click", next);
    document.addEventListener("keydown", e => {
      if($("#session").hidden || e.target.tagName === "INPUT") return;
      if(/^[1-4]$/.test(e.key)){ const b = $("#tOpts").querySelectorAll(".opt")[+e.key - 1]; if(b && !b.disabled) b.click(); }
      else if(e.key === "Enter" || e.key === "ArrowLeft") next();
    });
    const t = params.get("topic"); const m = params.get("mode");
    if(t && Bank.topics().includes(t)){ S.topics = [t]; $("#topicHint").hidden = false; $("#topicHint").innerHTML = `<span class="ic"><i data-i='target'></i></span><p>التدريب سيقتصر على موضوع: <b>${Bank.topicLabel(t)}</b> — <a href="train.html">إلغاء التحديد</a></p>`; }
    if(m && MODE_INFO[m]){ const b = $(`#modeCards [data-mode="${m}"]`); if(b && !b.disabled) b.click(); }
    if(params.get("start") === "1") startSession(S.mode, S.topics);
  });
})();
