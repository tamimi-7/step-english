/* ===== STEP English — collections browser (تجميعات الاستماع / القرامر / القطع) ===== */
(function(){
  const $ = s => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const KEYS = { listening: "الاستماع", grammar: "القرامر", reading: "القطع" };
  const L = Bank.LETTERS;
  let key = KEYS[params.get("c")] ? params.get("c") : "listening";
  let model = null, showAns = Store.get("step_coll_show", true);

  function countQ(m){ return m.items.filter(i => i.q).length; }
  function renderTabs(){
    $("#collTabs").innerHTML = Object.entries(KEYS).map(([k, v]) => `<button type="button" data-k="${k}" class="${k === key ? "on" : ""}">${v} <span class="badge" style="margin-right:4px">${COLLECTIONS[k] ? COLLECTIONS[k].models.length : 0}</span></button>`).join("");
    $("#collTabs").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { key = b.dataset.k; model = null; history.replaceState(null, "", "collections.html?c=" + key); renderTabs(); renderModels(); }));
  }
  function renderModels(){
    const c = COLLECTIONS[key];
    $("#collIntro").innerHTML = key === "listening"
      ? `<span class="ic"><i data-i='headphones'></i></span><p><b>${c.models.length} نموذج استماع</b> من التجميعات — أسئلة وإجابات بدون ملفات صوتية (كما في الملف الأصلي). الفائدة: تعرف شكل الأسئلة والإجابات المتوقعة، وكثير منها يتكرر في الاختبار. الأسئلة المكتوب عندها «الحل حسب الصوت» تُحل في الاختبار حسب ما تسمعه.</p>`
      : key === "grammar"
      ? `<span class="ic"><i data-i='book'></i></span><p><b>${c.models.length} نموذج قرامر</b> — كل نموذج ٤٠ سؤالًا تقريبًا. الإجابة الصحيحة هي التي كانت تحتها خط في الملف. الأسئلة بدون إجابة في الملف تظهر بعلامة «غير محلول».</p>`
      : `<span class="ic"><i data-i='bookopen'></i></span><p><b>${c.models.length} نموذج قطع</b> — لكل نموذج عناوين القطع التي جاءت، وتحت كل قطعة الأسئلة التي سُئلت مع الإجابة المتوقعة (وترجمتها). احفظ فكرة القطعة وإجاباتها، فالقطع تتكرر بنفس الأسئلة.</p>`;
    const grid = $("#modelGrid"); grid.hidden = false; $("#modelView").hidden = true;
    grid.innerHTML = c.models.map(m => { const n = countQ(m), solved = m.items.filter(i => i.q && (typeof i.a === "number" || (typeof i.a === "string" && i.a))).length; const titles = m.items.filter(i => i.t).slice(0, 4).map(i => i.te || i.t).join(" · ");
      return `<button type="button" class="mode-card" data-m="${m.n}" style="display:block"><span class="mt">النموذج ${m.n} ${n ? `<span class="badge">${n} سؤال</span>` : `<span class="badge">ملاحظات المختبرين</span>`}${solved < n ? `<span class="badge accent">${n - solved} غير محلول</span>` : ""}</span>${titles ? `<span class="md en" style="direction:ltr;text-align:left;font-size:.85rem">${esc(titles)}</span>` : ""}</button>`; }).join("");
    grid.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => openModel(+b.dataset.m)));
  }
  function openModel(n){
    const c = COLLECTIONS[key]; model = c.models.find(m => m.n === n); if(!model) return;
    $("#modelGrid").hidden = true; const v = $("#modelView"); v.hidden = false;
    const idx = c.models.indexOf(model);
    const quizable = model.items.filter(i => i.q && ((typeof i.a === "number" && i.o && i.o.length >= 2) || (typeof i.a === "string" && i.a))).length;
    let html = `<div class="card" style="margin-bottom:14px"><div class="btn-row" style="justify-content:space-between">
      <div class="btn-row"><button type="button" class="btn btn-sm" id="backBtn">→ كل النماذج</button><h2 style="margin:0">${KEYS[key]} — النموذج ${model.n}</h2></div>
      <div class="btn-row">
        <label class="check"><input type="checkbox" id="showAns" ${showAns ? "checked" : ""}> إظهار الإجابات</label>
        ${quizable >= 3 ? `<a class="btn btn-sm btn-primary" href="quiz.html?coll=${key}&model=${model.n}"><i data-i='pencil'></i> اختبرني في هذا النموذج (${quizable})</a>` : ""}
        <button type="button" class="btn btn-sm" id="prevM" ${idx === 0 ? "disabled" : ""}>السابق</button><button type="button" class="btn btn-sm" id="nextM" ${idx === c.models.length - 1 ? "disabled" : ""}>التالي</button>
      </div></div></div>`;
    let qn = 0;
    html += `<div class="card coll ${showAns ? "show" : ""}" id="collBody">` + model.items.map((it, i) => {
      if(it.rec) return `<h3 class="rec"><i data-i='headphones'></i> Recording ${it.rec}</h3>`;
      if(it.t) return `<h3 class="ptitle"><i data-i='file'></i> ${esc(it.t)}${it.te ? ` <span class="en muted" style="font-weight:500">(${esc(it.te)})</span>` : ""}</h3>`;
      if(it.n) return `<div class="note" style="margin:6px 0;font-size:.92rem"><span class="ic"><i data-i='pencil'></i></span><p>${esc(it.n)}</p></div>`;
      if(!it.q) return "";
      qn++;
      if(Array.isArray(it.o) && it.o.length){
        return `<div class="cq" data-i="${i}"><div class="qt en">${qn}. ${esc(it.q)}${it.a === null ? ' <span class="badge accent">غير محلول</span>' : ""} ${it.a === null ? "" : markBtn(`c${key[0]}-${model.n}-${i}`)}</div><div class="copts">${it.o.map((o, k) => `<button type="button" class="copt ${it.a === k ? "ans" : ""}" data-k="${k}"><span class="letter">${L[k]}</span>${esc(o)}</button>`).join("")}</div></div>`;
      }
      return `<div class="cq" data-i="${i}"><div class="qt en">${qn}. ${esc(it.q)} ${it.a ? markBtn(`c${key[0]}-${model.n}-${i}`) : ""}</div>${it.a ? `<div class="cans en"><i data-i='check'></i> ${esc(it.a)}</div>` : `<div class="cans"><span class="badge accent">غير محلول</span></div>`}${typeof it.o === "string" && it.o ? `<div class="en muted small">other options: ${esc(it.o)}</div>` : ""}${it.ar ? `<div class="car muted small">${esc(it.ar)}</div>` : ""}</div>`;
    }).join("") + `</div>`;
    v.innerHTML = html;
    $("#backBtn").addEventListener("click", () => { model = null; renderModels(); window.scrollTo({ top: 0 }); });
    $("#showAns").addEventListener("change", e => { showAns = e.target.checked; Store.set("step_coll_show", showAns); $("#collBody").classList.toggle("show", showAns); });
    $("#prevM").addEventListener("click", () => openModel(c.models[idx - 1].n));
    $("#nextM").addEventListener("click", () => openModel(c.models[idx + 1].n));
    v.querySelectorAll(".copt").forEach(b => b.addEventListener("click", () => { const cq = b.closest(".cq"); const it = model.items[+cq.dataset.i]; if(it.a === null) return; cq.querySelectorAll(".copt").forEach(x => { x.classList.toggle("ok", +x.dataset.k === it.a); }); if(+b.dataset.k !== it.a) b.classList.add("bad"); cq.classList.add("revealed"); recordAnswer(`c${key[0]}-${model.n}-${cq.dataset.i}`, +b.dataset.k === it.a); }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.addEventListener("DOMContentLoaded", () => {
    renderTabs(); renderModels();
    const m = params.get("model"); if(m) openModel(+m);
  });
})();
