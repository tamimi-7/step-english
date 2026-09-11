/* ===== STEP English — leaderboard & challenges ===== */
(function(){
  const $ = s => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const C = { mode: "mix", topic: "all", count: 10, timed: true };
  const modeLabel = m => ({ grammar: "القواعد", vocab: "المفردات", reading: "القراءة", mix: "شامل" })[m] || m;

  async function loadBoard(){
    const host = $("#board");
    try{
      const j = await Auth.api("/api/leaderboard");
      $("#boardMeta").textContent = `${j.users} متنافس · الأسبوع ${j.week}`;
      renderTournament(j);
      const render = which => { const rows = which === "week" ? j.weekly : which === "month" ? j.monthly : j.total; host.innerHTML = rows.length ? `<div class="lb">${rows.map(r => lbRow(r, which === "total")).join("")}</div>` : `<p class="muted">لا نقاط بعد. أول اختبار تحله يضعك في الترتيب!</p>`; };
      render(location.hash === "#tournament" ? "month" : "total");
      if(location.hash === "#tournament") $("#boardTabs").querySelectorAll("button").forEach(x => x.classList.toggle("on", x.dataset.v === "month"));
      $("#boardTabs").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; $("#boardTabs").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); render(b.dataset.v); });
    }catch(e){ host.innerHTML = `<div class="note bad"><span class="ic"><i data-i='alert'></i></span><p>${esc(e.message)}</p></div>`; }
  }

  function renderTournament(j){
    const host = $("#tournament"); if(!host || !j.events) return;
    const ev = j.events, T = ev.tournament, top = j.monthly[0];
    const left = T.ended ? "انتهت" : T.upcoming ? "تبدأ بعد " + fmtLeft(T.startsAt - ev.now) : "تنتهي بعد " + fmtLeft(T.endsAt - ev.now);
    host.innerHTML = `<div class="card tour-card"><div class="section-title"><span class="badge pink">${I("trophy")} بطولة معلنة</span><h2 style="margin:0">${esc(T.title)} — ${esc(T.prize)}</h2><span class="badge ${T.active ? "ok" : ""}">${left}</span></div>
      <p>${esc(T.desc)} تُحسم البطولة بترتيب <b>هذا الشهر</b> عند نهاية ${T.to.slice(0, 10)} (توقيت الرياض).</p>
      <div class="tour-grid"><div class="tour-lead">${top ? `<div class="small muted">المتصدر الآن</div><div class="tour-top">${avatarHtml(top.name, top.u)}<b>${esc(top.name)}</b><span class="badge accent">${top.points} نقطة</span></div>` : `<div class="small muted">لا متصدر بعد — أول نقطة تضعك في الصدارة!</div>`}</div>
      <ul class="tour-rules"><li><b>كل سؤال = نقطة واحدة في عمرك.</b> أول مرة تجيبه صح تأخذ نقطته. إعادة الاختبار تعطيك فقط نقاط الأسئلة التي لم تصبها من قبل.</li><li><b>فعاليات ×٢:</b> ${ev.active.length ? "جارية الآن: " + esc(ev.active[0].title) + " — " : ""}${EVENTS.CONFIG.recurring.map(r => esc(r.desc)).join("، ")}${EVENTS.CONFIG.special.map(r => "، " + esc(r.desc)).join("")}.</li><li>مراجعة الأخطاء وبطاقات الحفظ لا تعطي نقاطًا. التحدي يُحسب من أول محاولة فقط.</li></ul></div>
      <div class="btn-row" style="margin-top:12px"><a class="btn btn-warm btn-sm" href="quiz.html">${I("pencil")} اجمع نقاطًا الآن</a><a class="btn btn-sm" href="train.html">${I("target")} تدريب</a></div></div>`;
    hydrateIcons(host);
  }

  async function loadChallenges(){
    const host = $("#chalList");
    try{
      const j = await Auth.api("/api/challenges");
      host.innerHTML = j.challenges.length ? `<div class="grid grid-3">${j.challenges.map(c => `<div class="chal">
          <div class="ct"><i data-i='swords'></i> ${esc(c.title)} ${c.done ? '<span class="badge ok">أنجزته </span>' : ""}</div>
          <div class="cm"><span><i data-i='user'></i> ${esc(c.byName)}</span><span>${modeLabel(c.mode)}${c.mode === "grammar" && c.topic !== "all" ? " — " + Bank.topicLabel(c.topic) : ""}</span><span>${c.count} سؤال</span><span>${c.timed ? "<i data-i='timer'></i> بمؤقت" : "بدون مؤقت"}</span><span><i data-i='users'></i> ${c.participants}</span></div>
          <div class="ca">${c.done ? "" : `<a class="btn btn-sm btn-warm" href="quiz.html?challenge=${c.id}"><i data-i='fire'></i> ابدأ</a>`}<a class="btn btn-sm" href="compete.html?c=${c.id}">الترتيب</a><button type="button" class="btn btn-sm" data-copy="${c.id}"><i data-i='link'></i> نسخ الرابط</button></div></div>`).join("")}</div>`
        : `<p class="muted">لا توجد تحديات بعد — أنشئ أول تحدٍ وأرسل رابطه لإخوانك!</p>`;
      host.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => copyLink(b.dataset.copy)));
    }catch(e){ host.innerHTML = `<div class="note bad"><span class="ic"><i data-i='alert'></i></span><p>${esc(e.message)}</p></div>`; }
  }
  function copyLink(id){
    const url = location.origin + location.pathname.replace(/[^/]*$/, "") + "quiz.html?challenge=" + id;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast("تم نسخ رابط التحدي ")).catch(() => prompt("انسخ الرابط:", url));
  }

  async function loadDetail(id){
    const box = $("#chalDetail"); box.hidden = false;
    box.innerHTML = `<div class="card"><p class="muted">جارٍ التحميل…</p></div>`;
    try{
      const j = await Auth.api("/api/challenge?id=" + encodeURIComponent(id));
      const c = j.challenge;
      box.innerHTML = `<div class="card">
        <div class="section-title"><span class="badge pink"><i data-i='swords'></i> تحدي</span><h2 style="margin:0">${esc(c.title)}</h2></div>
        <p class="muted">بواسطة <b>${esc(c.byName)}</b> · ${modeLabel(c.mode)}${c.mode === "grammar" && c.topic !== "all" ? " — " + Bank.topicLabel(c.topic) : ""} · ${c.qids.length} سؤال · ${c.timed ? "<i data-i='timer'></i> بمؤقت" : "بدون مؤقت"} · ${fmtDate(c.created)}</p>
        ${j.board.length ? `<div class="lb">${j.board.map(r => `<div class="lb-row ${r.me ? "me" : ""} ${r.rank <= 3 ? "top" + r.rank : ""}"><div class="rk ${r.rank <= 3 ? "medal" : ""}">${r.rank <= 3 ? I("medal", "medal-" + r.rank) : r.rank}</div>${avatarHtml(r.name, r.u)}<div class="nm">${esc(r.name)}<div class="sub">${Math.floor(r.seconds / 60)}:${String(r.seconds % 60).padStart(2, "0")} دقيقة · ${fmtDate(r.at)}</div></div><div class="pt">${r.score} / ${r.total}</div></div>`).join("")}</div>` : `<p class="muted">لا أحد أنجز هذا التحدي بعد.</p>`}
        <div class="btn-row" style="margin-top:14px">${j.mine ? "" : `<a class="btn btn-warm" href="quiz.html?challenge=${c.id}"><i data-i='fire'></i> ابدأ التحدي</a>`}<button type="button" class="btn" id="copyDetail"><i data-i='link'></i> نسخ الرابط</button><a class="btn" href="compete.html">كل التحديات</a></div></div>`;
      $("#copyDetail").addEventListener("click", () => copyLink(c.id));
    }catch(e){ box.innerHTML = `<div class="card"><div class="note bad"><span class="ic"><i data-i='alert'></i></span><p>${esc(e.message)}</p></div></div>`; }
  }

  function initCreate(){
    const me = Auth.user();
    $("#createCard").hidden = !me; $("#createLogin").hidden = !!me;
    if(!me) return;
    $("#cModeSeg").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; C.mode = b.dataset.v; $("#cModeSeg").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); $("#cTopicWrap").hidden = C.mode !== "grammar"; });
    $("#cTopic").innerHTML = `<option value="all">كل المواضيع</option>` + Object.entries(TOPICS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
    $("#cTopic").addEventListener("change", e => C.topic = e.target.value);
    $("#cCountSeg").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; C.count = +b.dataset.v; $("#cCountSeg").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
    $("#cTimed").addEventListener("change", e => C.timed = e.target.checked);
    $("#createBtn").addEventListener("click", async () => {
      const qids = Bank.groupPassages(Bank.pick(C.mode, C.topic, C.count)).map(q => q.id);
      $("#createBtn").disabled = true;
      try{
        const j = await Auth.api("/api/challenges", { method: "POST", body: { title: $("#cTitle").value.trim(), mode: C.mode, topic: C.topic, timed: C.timed, qids } });
        toast("تم إنشاء التحدي "); $("#cTitle").value = "";
        await loadChallenges(); copyLink(j.id);
      }catch(e){ toast(e.message, 4000); }
      $("#createBtn").disabled = false;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadBoard(); loadChallenges(); initCreate();
    const c = params.get("c"); if(c) loadDetail(c);
  });
})();
