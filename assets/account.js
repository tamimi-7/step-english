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
      if(typeof giftCheck === "function") setTimeout(giftCheck, 400);
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
      const dl = Store.get("step_daily_last_" + me.u, null), flame = dl && dl.streak ? dl.streak : 0;
      $("#pStats").innerHTML = `<div class="acc-stats">
        <a class="gs" href="#points">${emo("trophy", "gs-emo")}<div class="gs-b"><div class="gs-n">${j.points}</div><div class="gs-l">نقطة${j.rank ? " · #" + j.rank : ""}</div></div></a>
        <a class="gs" href="compete.html">${emo("crown", "gs-emo")}<div class="gs-b"><div class="gs-n">${j.monthPoints != null ? j.monthPoints : "—"}</div><div class="gs-l">البطولة${j.monthRank ? " · #" + j.monthRank : ""}</div></div></a>
        <div class="gs">${emo("calendar", "gs-emo")}<div class="gs-b"><div class="gs-n">${j.weekPoints}</div><div class="gs-l">هذا الأسبوع${j.weekRank ? " · #" + j.weekRank : ""}</div></div></div>
        <div class="gs">${emo("fire", "gs-emo")}<div class="gs-b"><div class="gs-n">${flame}</div><div class="gs-l">${flame === 1 ? "يوم ورا بعض" : "أيام ورا بعض"}</div></div></div></div>
        <p class="small muted acc-activity">${s.quizzes} اختبار وتدريب · الدقة ${s.answered ? Math.round(s.correct / s.answered * 100) : 0}٪ · أفضل نتيجة ${s.best}٪</p>`;
      $("#pResults").innerHTML = j.results.length ? `<div class="table-wrap"><table><thead><tr><th>التاريخ</th><th>النوع</th><th class="en">الدرجة</th><th>النسبة</th></tr></thead><tbody>${j.results.map(r => `<tr><td>${fmtDate(r.at)}</td><td>${r.challenge ? "<i data-i='swords'></i> تحدي" : Bank.topicLabel(r.mode === "mix" ? "اختبار شامل" : r.mode === "wrong" ? "مراجعة أخطائي" : r.mode)}</td><td class="en">${r.score} / ${r.total}</td><td><span class="badge ${r.score / r.total >= .7 ? "ok" : "bad"}">${Math.round(r.score / r.total * 100)}٪</span></td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">لا توجد نتائج بعد — <a href="quiz.html">ابدأ اختبارك الأول</a>.</p>`;
    }catch(e){ $("#pStats").innerHTML = `<div class="note bad"><span class="ic"><i data-i='alert'></i></span><p>${esc(e.message)}</p></div>`; }
    renderPoints(); renderWeak(); renderMarks(); renderNotif();
    const o = Progress.overall();
    $("#pProg").innerHTML = `${o.answered} إجابة · إتقانك ${o.pct}٪ — تقدمك محفوظ على حسابك ويظهر على أي جهاز تسجّل منه.`;
  }

  /* الإشعارات: تفعيل / إيقاف / تجربة + شرح الآيفون */
  async function renderNotif(){
    const host = $("#pNotif"); if(!host || typeof Push === "undefined") return;
    const head = `<div class="section-title"><h2 style="margin:0">${emo("bell")} إشعارات الجوال</h2></div><p class="muted small" style="margin:4px 0 10px">تذكير واحد باليوم بس: لما شعلتك بتنطفي، ومعركة الجمعة، وساعة الذهب، والجوائز. ما نرسل إعلانات ولا نشارك بياناتك.</p>`;
    if(!Push.supported()){
      host.innerHTML = head + (Push.isIOS() && !Push.standalone()
        ? `<div class="note info"><span class="ic">${I("info")}</span><p><b>على الآيفون تحتاج خطوة وحدة قبل:</b><br>١) افتح الموقع في <b>Safari</b><br>٢) اضغط زر <b>المشاركة</b> (المربع وفوقه سهم)<br>٣) اختر <b>«إضافة إلى الشاشة الرئيسية»</b><br>٤) افتح <b>«إنقلش»</b> من شاشة الجوال، وارجع لهالصفحة واضغط تفعيل.</p></div>`
        : `<p class="muted">متصفحك ما يدعم الإشعارات. جرّب Chrome، أو على الآيفون أضف الموقع للشاشة الرئيسية.</p>`);
      hydrateIcons(host); return;
    }
    const sub = await Push.current().catch(() => null), perm = Notification.permission;
    const on = !!sub && perm === "granted";
    host.innerHTML = head + (perm === "denied"
      ? `<div class="note warn"><span class="ic">${I("alert")}</span><p>الإشعارات موقوفة من إعدادات المتصفح/الجوال. فعّلها من الإعدادات ← الإشعارات، ثم ارجع هنا.</p></div>`
      : on ? `<div class="note ok"><span class="ic">${I("check")}</span><p><b>الإشعارات مفعّلة على هذا الجهاز.</b></p></div><div class="btn-row"><button type="button" class="btn btn-primary btn-sm" id="pushTest">${I("bell")} أرسل لي إشعار تجربة</button><button type="button" class="btn btn-sm" id="pushOff">إيقاف الإشعارات</button></div>`
      : `<button type="button" class="btn btn-warm" id="pushOn">${I("bell")} فعّل الإشعارات</button>`);
    hydrateIcons(host);
    const busy = (b, t) => { b.disabled = true; b.textContent = t; };
    const bOn = $("#pushOn"), bOff = $("#pushOff"), bTest = $("#pushTest");
    if(bOn) bOn.addEventListener("click", async () => { busy(bOn, "… جاري التفعيل"); try{ await Push.enable(); toast("تم تفعيل الإشعارات 🔔"); }catch(e){ toast(e.message, 5000); } renderNotif(); });
    if(bOff) bOff.addEventListener("click", async () => { busy(bOff, "…"); await Push.disable(); toast("تم إيقاف الإشعارات"); renderNotif(); });
    if(bTest) bTest.addEventListener("click", async () => { busy(bTest, "… جاري الإرسال"); try{ const r = await Auth.api("/api/push", { method: "POST", body: { action: "test" } }); toast(r.sent ? "انرسل! شيك على الإشعارات" : "ما وصل — جرّب تعطّلها وتفعّلها من جديد", 4000); }catch(e){ toast(e.message, 4000); } renderNotif(); });
  }
  async function renderPoints(){
    const host = $("#pPoints"); if(!host) return;
    const j = await loadPoints(true); if(!j){ host.innerHTML = `<p class="muted">تعذّر التحميل.</p>`; return; }
    const rows = [...j.areas, ...j.extras].filter(r => r.points);
    const max = Math.max(1, ...rows.map(r => r.points));
    host.innerHTML = `<div class="card sheet">${rows.length ? rows.map(r => `<div class="pts-row"><div class="pr-l">${esc(r.label)}</div><div class="pr-bar"><div style="width:${Math.round(r.points / max * 100)}%"></div></div><div class="pr-n">${r.points}</div></div>`).join("") : `<p class="muted">ما جمعت نقاطًا بعد — ابدأ بأي نشاط عليه شارة «نقاط».</p>`}
        <div class="pts-row total"><div class="pr-l">المجموع</div><div class="pr-bar"></div><div class="pr-n">${j.sum}</div></div>
        <p class="small muted" style="margin:10px 0 0">${j.consistent ? `${I("check")} التفصيل يطابق مجموعك تمامًا.` : `${I("info")} فرق ${j.total - j.sum} نقطة من قبل تسجيل التفصيل.`} ${j.stages.length ? `· أتممت ${j.stages.length} ${j.stages.length === 1 ? "مرحلة" : "مراحل"}.` : ""}</p></div>
      <details class="pts-where acc-help"><summary>${I("info")} ليش الأرقام تختلف؟ وكيف تنحسب النقاط؟</summary><p><b>ليش تختلف؟</b> «المجموع الكلي» كل نقاطك من أول يوم. «البطولة» تبدأ من ٩ سبتمبر وهي اللي تحدد الفائز بالجائزة. «هذا الأسبوع» يرجع صفر كل اثنين. ما فيه شي ينقص من نقاطك أبدًا.</p><p><b>كيف تنحسب؟</b> كل سؤال تجيبه صح <b>لأول مرة</b> = نقطة (الإعادة ما تكرر). ساعة الذهب (٩–١٠ مساءً يوميًا) = نقطتين لكل إجابة جديدة. إتمام مرحلة = +${j.stagePoints}. معركة الكلمات (الجمعة ٨–١٠ مساءً): الأول +٣٠، الثاني +٢٠، الثالث +١٠.</p></details>`;
    hydrateIcons(host);
    if(location.hash === "#points") host.scrollIntoView({ block: "start" });
  }
  function renderWeak(){
    const host = $("#pWeak"); if(!host) return;
    const ws = Progress.weakTopics(3).slice(0, 8);
    const sec = $("#weak"); if(sec) sec.hidden = !ws.length;
    host.innerHTML = ws.length ? ws.map(m => `<div class="mastery-row"><div><b>${Bank.topicLabel(m.t)}</b> <span class="muted small">(${m.seen}/${m.total}${m.wrong ? " · " + m.wrong + " خطأ" : ""})</span><div class="btn-row" style="margin-top:6px">${lessonLink(m.t)}<a class="mini-link" href="train.html?topic=${m.t}&start=1">${I("target")} تدرّب عليه</a></div></div><div class="pct">${m.pct}٪</div><div class="bar"><div class="${masteryClass(m.pct)}" style="width:${m.pct}%"></div></div></div>`).join("")
      : `<p class="muted">أجب على بعض الأسئلة في التدريب أو الاختبار أولًا، وستظهر هنا المواضيع الأضعف مع رابط شرح قاعدتها.</p><a class="btn btn-primary btn-sm" href="train.html?mode=smart&start=1">ابدأ التدريب الذكي</a>`;
  }
  function renderMarks(){
    const host = $("#pMarks"); if(!host) return;
    const ids = Progress.marks();
    const secM = $("#marks"); if(secM) secM.hidden = !ids.length;
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
    $("#logoutBtn").addEventListener("click", async () => { try{ if(typeof Push !== "undefined") await Push.disable(); }catch(e){} Auth.clear(); toast("تم تسجيل الخروج"); renderNav(); render(); });
    if(new URLSearchParams(location.search).get("register") === "1") setKind("register"); else setKind("login");
    render();
  });
})();
