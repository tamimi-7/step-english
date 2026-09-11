/* ===== STEP English — vocabulary page ===== */
(function(){
  const $ = s => document.querySelector(s);
  let known = new Set(Store.get("step_vocab_known", []));
  const saved = Store.get("step_vocab_deck", null) || {};
  let deck = [], pos = 0, deckMode = saved.mode || (known.size ? "unknown" : "all"), order = saved.order || null;
  const saveDeck = () => Store.set("step_vocab_deck", { mode: deckMode, pos, order: deckMode === "random" ? order : null });

  function renderTable(filter){
    const f = (filter || "").trim().toLowerCase();
    const rows = VOCAB.map((v, i) => ({v, i})).filter(({v}) => !f || v.w.toLowerCase().includes(f) || v.s.join(" ").toLowerCase().includes(f) || v.ar.includes(f));
    $("#vocabCount").textContent = rows.length === VOCAB.length ? `${VOCAB.length} كلمة` : `${rows.length} من ${VOCAB.length}`;
    $("#vocabBody").innerHTML = rows.map(({v, i}) => `<tr>
      <td class="muted">${i+1}</td>
      <td class="en"><b>${esc(v.w)}</b></td>
      <td class="en">${esc(v.s.join(" / "))}${v.orig ? `<div class="small muted" dir="rtl" style="text-align:right">في التجميعات: <span class="en">${esc(v.orig)}</span></div>` : ""}</td>
      <td>${esc(v.ar)}</td>
      <td class="center">${known.has(v.w) ? '<span class="badge ok">أعرفها</span>' : ""}</td>
    </tr>`).join("") || `<tr><td colspan="5" class="center muted">لا توجد نتائج</td></tr>`;
  }

  function buildDeck(restore){
    let src = VOCAB.slice();
    if(deckMode === "unknown") src = src.filter(v => !known.has(v.w));
    if(deckMode === "random"){ if(!(restore && order && order.length === src.length)) order = shuffle(src.map(v => v.w)); const byW = Object.fromEntries(src.map(v => [v.w, v])); deck = order.map(w => byW[w]).filter(Boolean); }
    else deck = src;
    pos = restore && saved.mode === deckMode && Number.isInteger(saved.pos) ? Math.min(Math.max(0, saved.pos), deck.length) : 0;
    $("#deckSeg").querySelectorAll("button").forEach(x => x.classList.toggle("on", x.dataset.v === deckMode));
    saveDeck();
    renderCard(true);
  }
  function renderCard(snap){
    const card = $("#card");
    if(card.classList.contains("flipped")){ card.classList.add("no-anim"); card.classList.remove("flipped"); void card.offsetWidth; setTimeout(() => card.classList.remove("no-anim"), 30); }
    const front = card.querySelector(".front"), back = card.querySelector(".back");
    const ended = !deck.length || pos >= deck.length;
    $("#knowBtn").disabled = $("#dontBtn").disabled = ended;
    if(!deck.length){ front.innerHTML = `<i data-i='sparkles'></i><small>لا توجد كلمات في هذه المجموعة — كل الكلمات معلّمة «أعرفها»</small><div class="end-actions"><button type="button" class="btn btn-sm" data-deck="all">راجع كل الكلمات</button></div>`; back.innerHTML = ""; $("#flashProg").textContent = ""; $("#flashBar").style.width = "0%"; hydrateIcons(card); return; }
    if(pos >= deck.length){
      const left = VOCAB.filter(x => !known.has(x.w)).length;
      front.innerHTML = `<i data-i='check'></i><small>انتهت المجموعة — أحسنت!</small><div class="small" style="opacity:.9;margin-top:4px">${left ? `بقي ${left} كلمة لا تعرفها` : "تعرف كل الكلمات"}</div><div class="end-actions">${left ? `<button type="button" class="btn btn-sm btn-primary" data-deck="unknown">أعد التي لا أعرفها (${left})</button>` : ""}<button type="button" class="btn btn-sm" data-deck="all">ابدأ من جديد</button><a class="btn btn-sm btn-warm" href="quiz.html?mode=vocab">اختبر نفسك</a></div>`;
      back.innerHTML = ""; $("#flashProg").textContent = `${deck.length} / ${deck.length}`; $("#flashBar").style.width = "100%"; hydrateIcons(card); return;
    }
    const v = deck[pos];
    front.innerHTML = `${esc(v.w)}<small>اضغط لعرض المعنى</small>`;
    back.innerHTML = `<div class="syn">${esc(v.s.join(" / "))}</div><div class="ar">${esc(v.ar)}</div>${v.orig ? `<div class="small" style="opacity:.85">في التجميعات: <span class="en">${esc(v.orig)}</span></div>` : ""}`;
    $("#flashProg").textContent = `${pos+1} / ${deck.length}`;
    $("#flashBar").style.width = (pos / deck.length * 100) + "%";
  }
  function mark(isKnown){
    if(pos >= deck.length || !deck.length) return;
    const v = deck[pos];
    if(isKnown) known.add(v.w); else known.delete(v.w);
    Store.set("step_vocab_known", [...known]);
    pos++; saveDeck();
    renderCard();
    $("#knownCount").textContent = known.size;
    renderTable($("#search").value);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderTable("");
    $("#search").addEventListener("input", e => renderTable(e.target.value));
    $("#knownCount").textContent = known.size;
    $("#card").addEventListener("click", e => { const a = e.target.closest("[data-deck]"); if(a){ e.stopPropagation(); deckMode = a.dataset.deck; pos = 0; buildDeck(false); return; } if(e.target.closest("a,button")) return; if(pos < deck.length && deck.length) $("#card").classList.toggle("flipped"); });
    $("#knowBtn").addEventListener("click", () => mark(true));
    $("#dontBtn").addEventListener("click", () => mark(false));
    $("#deckSeg").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; if(b.dataset.v === deckMode && pos < deck.length) return; deckMode = b.dataset.v; buildDeck(false); });
    $("#resetKnown").addEventListener("click", () => { if(confirm(`سيتم مسح علامات «أعرفها» عن ${known.size} كلمة وتبدأ من الصفر. متأكد؟`)){ known = new Set(); Store.set("step_vocab_known", []); $("#knownCount").textContent = 0; renderTable($("#search").value); deckMode = "all"; buildDeck(false); } });
    document.addEventListener("keydown", e => {
      if(e.target.tagName === "INPUT") return;
      if(e.key === " "){ e.preventDefault(); if(pos < deck.length) $("#card").classList.toggle("flipped"); }
      else if(e.key === "ArrowLeft") mark(true);
      else if(e.key === "ArrowRight") mark(false);
    });
    buildDeck(true);
  });
})();
