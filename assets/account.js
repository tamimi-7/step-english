/* ===== STEP English — account page ===== */
(function(){
  const $ = s => document.querySelector(s);
  const next = new URLSearchParams(location.search).get("next");
  let kind = "login";

  function msg(text, ok){ const m = $("#formMsg"); m.hidden = !text; m.className = "form-msg " + (ok ? "ok" : "err"); m.textContent = text || ""; }
  function setKind(k){ kind = k; $("#tabLogin").classList.toggle("on", k === "login"); $("#tabReg").classList.toggle("on", k === "register"); $("#nameWrap").hidden = k !== "register"; $("#submitBtn").textContent = k === "login" ? "تسجيل الدخول" : "إنشاء الحساب"; msg(""); }

  async function submit(e){
    e.preventDefault();
    const body = { username: $("#username").value.trim(), password: $("#password").value, name: $("#name").value.trim() };
    if(kind === "register" && !body.name){ msg("اكتب الاسم الذي يظهر في الترتيب"); return; }
    $("#submitBtn").disabled = true;
    try{
      const j = await Auth.api("/api/" + kind, { method: "POST", body });
      Auth.set({ token: j.token, user: j.user });
      const owner = Store.get("step_prog_owner", null);
      if(owner && owner !== j.user.u){ Progress.reset(); Store.del("step_history"); Store.del("step_vocab_known"); }
      Store.set("step_prog_owner", j.user.u);
      await Progress.sync(true);
      toast(kind === "login" ? "أهلًا بعودتك " + j.user.name + " " : "تم إنشاء حسابك ");
      if(next) location.href = next; else { renderNav(); render(); }
    }catch(err){ msg(err.message); }
    $("#submitBtn").disabled = false;
  }

  async function render(){
    const me = Auth.user();
    $("#forms").hidden = !!me; $("#profile").hidden = !me;
    if(!me) return;
    $("#pHead").innerHTML = `${avatarHtml(me.name, me.u, "lg")}<div><h2 style="margin:0">${esc(me.name)}</h2><div class="muted en">@${esc(me.u)}</div></div>`;
    $("#pStats").innerHTML = `<p class="muted">جارٍ التحميل…</p>`;
    try{
      const j = await Auth.api("/api/me");
      const s = j.stats;
      $("#pStats").innerHTML = `<div class="grid grid-4">
        <div class="card stat"><span class="ic"><i data-i='trophy'></i></span><span class="num">${j.points}</span><span class="lbl">نقطة${j.rank ? " · الترتيب #" + j.rank : ""}</span></div>
        <div class="card stat"><span class="ic"><i data-i='calendar'></i></span><span class="num">${j.weekPoints}</span><span class="lbl">نقاط هذا الأسبوع${j.weekRank ? " · #" + j.weekRank : ""}</span></div>
        <div class="card stat"><span class="ic"><i data-i='pencil'></i></span><span class="num">${s.quizzes}</span><span class="lbl">اختبار وتدريب</span></div>
        <div class="card stat"><span class="ic"><i data-i='target'></i></span><span class="num">${s.answered ? Math.round(s.correct / s.answered * 100) : 0}٪</span><span class="lbl">الدقة · أفضل نتيجة ${s.best}٪</span></div></div>`;
      $("#pResults").innerHTML = j.results.length ? `<div class="table-wrap"><table><thead><tr><th>التاريخ</th><th>النوع</th><th class="en">الدرجة</th><th>النسبة</th></tr></thead><tbody>${j.results.map(r => `<tr><td>${fmtDate(r.at)}</td><td>${r.challenge ? "<i data-i='swords'></i> تحدي" : Bank.topicLabel(r.mode === "mix" ? "اختبار شامل" : r.mode === "wrong" ? "مراجعة أخطائي" : r.mode)}</td><td class="en">${r.score} / ${r.total}</td><td><span class="badge ${r.score / r.total >= .7 ? "ok" : "bad"}">${Math.round(r.score / r.total * 100)}٪</span></td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">لا توجد نتائج بعد — <a href="quiz.html">ابدأ اختبارك الأول</a>.</p>`;
    }catch(e){ $("#pStats").innerHTML = `<div class="note bad"><span class="ic"><i data-i='alert'></i></span><p>${esc(e.message)}</p></div>`; }
    renderWeak(); renderMarks();
    const o = Progress.overall();
    $("#pProg").innerHTML = `إتقانك الكلي <b>${o.pct}٪</b> · ${o.answered} إجابة · ${Progress.streak()} أيام متتالية — التقدم محفوظ على حسابك ويظهر على أي جهاز تسجّل منه.`;
  }

  function renderWeak(){
    const host = $("#pWeak"); if(!host) return;
    const ws = Progress.weakTopics(3).slice(0, 8);
    host.innerHTML = ws.length ? ws.map(m => `<div class="mastery-row"><div><b>${Bank.topicLabel(m.t)}</b> <span class="muted small">(${m.seen}/${m.total}${m.wrong ? " · " + m.wrong + " خطأ" : ""})</span><div class="btn-row" style="margin-top:6px">${lessonLink(m.t)}<a class="mini-link" href="train.html?topic=${m.t}&start=1">${I("target")} تدرّب عليه</a></div></div><div class="pct">${m.pct}٪</div><div class="bar"><div class="${masteryClass(m.pct)}" style="width:${m.pct}%"></div></div></div>`).join("")
      : `<p class="muted">أجب على بعض الأسئلة في التدريب أو الاختبار أولًا، وستظهر هنا المواضيع الأضعف مع رابط شرح قاعدتها.</p><a class="btn btn-primary btn-sm" href="train.html?mode=smart&start=1">ابدأ التدريب الذكي</a>`;
  }
  function renderMarks(){
    const host = $("#pMarks"); if(!host) return;
    const ids = Progress.marks();
    if(!ids.length){ host.innerHTML = `<p class="muted">لم تعلّم على أي سؤال بعد. في نتائج الاختبار وفي التجميعات تجد زر «علّم» تحت كل سؤال — اضغطه وسيظهر هنا لتذاكره وقت ما تشاء.</p>`; return; }
    const qs = Bank.byIds(ids);
    const groups = {};
    qs.forEach(q => { const t = q.kind === "grammar" || q.kind === "coll" ? q.topic : q.kind; (groups[t] = groups[t] || []).push(q); });
    host.innerHTML = `<div class="btn-row" style="margin-bottom:12px"><a class="btn btn-primary btn-sm" href="train.html?mode=marks&start=1">${I("target")} تدرّب على المعلَّمة (${qs.length})</a><label class="check"><input type="checkbox" id="hideAns"> إخفاء الإجابات للمذاكرة</label></div>` +
      Object.entries(groups).map(([t, list]) => `<div class="mark-group"><h3>${Bank.topicLabel(t)} <span class="badge">${list.length}</span> ${lessonLink(t)}</h3>${list.map(q => `<div class="res-item right"><div class="q-text">${q.q}</div><div class="ans mk-ans">${Bank.LETTERS[q.a]}) ${esc(q.opts[q.a])}</div><div class="exp">${esc(q.ex)}</div><div class="btn-row" style="margin-top:6px">${markBtn(q.id)}</div></div>`).join("")}</div>`).join("");
    $("#hideAns").addEventListener("change", e => host.classList.toggle("hide-ans", e.target.checked));
  }
  document.addEventListener("DOMContentLoaded", () => {
    $("#tabLogin").addEventListener("click", () => setKind("login"));
    $("#tabReg").addEventListener("click", () => setKind("register"));
    $("#authForm").addEventListener("submit", submit);
    $("#logoutBtn").addEventListener("click", () => { Auth.clear(); toast("تم تسجيل الخروج"); renderNav(); render(); });
    if(new URLSearchParams(location.search).get("register") === "1") setKind("register"); else setKind("login");
    render();
  });
})();
