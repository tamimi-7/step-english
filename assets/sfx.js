/* ===== أصوات الواجهة — مولّدة بـ Web Audio بدون ملفات ===== */
const SFX = (() => {
  const KEY = "step_sfx";
  let ctx = null;
  const on = () => Store.get(KEY, true) !== false;
  function ac(){
    if(!ctx){ try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return null; } }
    if(ctx.state === "suspended"){ try{ ctx.resume(); }catch(e){} }
    return ctx;
  }
  function tone(f, dur, type, vol, when, slide){
    if(!on()) return; const c = ac(); if(!c) return;
    const o = c.createOscillator(), g = c.createGain(); o.type = type || "sine";
    const t0 = c.currentTime + (when || 0);
    o.frequency.setValueAtTime(f, t0); if(slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || .15, t0 + .012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + .05);
  }
  const S = {
    click(){ tone(1000, .045, "square", .045); },
    correct(){ tone(660, .12, "sine", .16); tone(880, .2, "sine", .16, .1); },
    wrong(){ tone(240, .28, "sawtooth", .09, 0, 150); },
    tick(){ tone(1300, .04, "square", .07); },
    timeout(){ tone(520, .35, "sine", .18, 0, 180); tone(380, .4, "sine", .16, .3, 120); },
    win(){ [523, 659, 784, 1046].forEach((f, i) => tone(f, .22, "triangle", .16, i * .11)); },
    combo(){ tone(1000, .07, "sine", .1); tone(1400, .1, "sine", .1, .06); },
    coin(){ tone(1600, .06, "square", .08); tone(2100, .14, "square", .08, .06); },
    enabled: on,
    toggle(){ Store.set(KEY, !on()); S.render(); if(on()) S.correct(); },
    render(){ const b = document.getElementById("sfxBtn"); if(!b) return; b.innerHTML = I(on() ? "volume" : "mute"); b.classList.toggle("off", !on()); b.title = on() ? "إيقاف الأصوات" : "تشغيل الأصوات"; b.setAttribute("aria-label", b.title); }
  };
  // صوت ضغطة لكل الأزرار والبطاقات (خيارات الأسئلة لها صوت صح/خطأ خاص)
  document.addEventListener("click", e => {
    const el = e.target.closest("button,.btn,.tabbar a,.nav .link,a.card,.unit,.lvl-row,.tile,.letter-btn,.mode-card,.tabs button,.seg button");
    if(!el || el.classList.contains("opt") || el.id === "sfxBtn") return;
    S.click();
  }, true);
  document.addEventListener("DOMContentLoaded", S.render);
  return S;
})();
function toggleSfx(){ SFX.toggle(); }
