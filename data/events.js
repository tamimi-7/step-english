/* ===== الفعاليات والبطولة — ملف واحد يقرأه المتصفح والخادم =====
   توقيت الرياض (UTC+3). عدّل هنا فقط: البطولة، الفعاليات المتكررة، والفعاليات الخاصة. */
(function(root){
  const TZ = 3; // ساعات فرق التوقيت عن UTC (الرياض)
  const CONFIG = {
    tournament: {
      id: "sep-2026", title: "بطولة سبتمبر", prize: "هدية بقيمة ٣٠٠ ريال",
      desc: "المركز الأول في ترتيب هذا الشهر يفوز بهدية بقيمة ٣٠٠ ريال.",
      from: "2026-09-09T00:00:00+03:00", to: "2026-09-30T23:59:59+03:00",
      key: "2026-09" // مفتاح لوحة الشهر التي تُحسم بها البطولة
    },
    recurring: [
      { id: "friday", title: "جمعة مضاعفة", desc: "كل جمعة، طوال اليوم، نقاط ×٢", dow: 5, mult: 2 },
      { id: "golden", title: "ساعة الذهب", desc: "كل يوم من ٩ إلى ١٠ مساءً نقاط ×٢", fromH: 21, toH: 22, mult: 2 }
    ],
    /* هدايا شخصية: تُطابَق بالاسم أو اسم المستخدم، وتعطي مضاعف نقاط لصاحبها فقط */
    gifts: [
      { id: "salma-2026-09", names: ["سلمى", "سلمي", "salma", "salmaa"], mult: 2, from: "2026-09-13T00:00:00+03:00", to: "2026-09-30T23:59:59+03:00",
        title: "هدية خاصة لسلمى", msg: "عشان شغلناك عن الموقع وزعلتِ… خذي هذي: كل نقطة تجمعينها تُحسب لك مضاعفة ×٢ حتى نهاية الشهر. رحّبنا فيك من جديد!", icon: "gift" }
    ],
    special: [
      { id: "kickoff", title: "انطلاقة البطولة", desc: "أول ٤٨ ساعة من البطولة نقاط ×٢", from: "2026-09-09T00:00:00+03:00", to: "2026-09-10T23:59:59+03:00", mult: 2 }
    ]
  };
  const H = 3600e3, D = 24 * H;
  const local = t => new Date(t + TZ * H); // "محلي" باستخدام دوال UTC
  const dayStart = t => { const l = local(t); return Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate()) - TZ * H; };
  function windows(t){ // كل نوافذ الفعاليات القريبة: [{ev, start, end}]
    const out = []; const ds = dayStart(t);
    for(let k = -1; k <= 8; k++){ const d0 = ds + k * D; const dow = local(d0).getUTCDay();
      CONFIG.recurring.forEach(ev => {
        if(ev.dow !== undefined){ if(dow === ev.dow) out.push({ ev, start: d0, end: d0 + D }); }
        else if(ev.fromH !== undefined) out.push({ ev, start: d0 + ev.fromH * H, end: d0 + ev.toH * H });
      }); }
    CONFIG.special.forEach(ev => out.push({ ev, start: Date.parse(ev.from), end: Date.parse(ev.to) + 1000 }));
    return out;
  }
  function status(t){
    t = t || Date.now();
    const ws = windows(t);
    const active = ws.filter(w => w.start <= t && t < w.end).map(w => ({ id: w.ev.id, title: w.ev.title, desc: w.ev.desc, mult: w.ev.mult, endsAt: w.end }));
    const mult = Math.min(3, active.reduce((m, a) => Math.max(m, a.mult), 1));
    const upcoming = ws.filter(w => w.start > t).sort((a, b) => a.start - b.start)[0];
    const next = upcoming ? { id: upcoming.ev.id, title: upcoming.ev.title, desc: upcoming.ev.desc, mult: upcoming.ev.mult, startsAt: upcoming.start } : null;
    const T = CONFIG.tournament; const tFrom = Date.parse(T.from), tTo = Date.parse(T.to) + 1000;
    const tournament = { ...T, startsAt: tFrom, endsAt: tTo, active: t >= tFrom && t < tTo, ended: t >= tTo, upcoming: t < tFrom };
    return { now: t, mult, active, next, tournament };
  }
  const monthKey = t => { const l = local(t || Date.now()); return `${l.getUTCFullYear()}-${String(l.getUTCMonth() + 1).padStart(2, "0")}`; };
  /* تطبيع الاسم العربي لمطابقة الهدية */
  const normName = s => String(s || "").toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
  function giftFor(user, t){
    if(!user) return null; t = t || Date.now();
    const nm = normName(user.name), un = normName(user.u);
    for(const g of CONFIG.gifts || []){
      const active = t >= Date.parse(g.from) && t < Date.parse(g.to) + 1000; if(!active) continue;
      if(g.names.some(n => { const k = normName(n); return k && (nm === k || nm.startsWith(k + " ") || nm.includes(k) || un === k || un.includes(k)); })) return { ...g, endsAt: Date.parse(g.to) + 1000 };
    }
    return null;
  }
  const api = { CONFIG, status, monthKey, TZ, giftFor, normName };
  if(typeof module !== "undefined" && module.exports) module.exports = api; else root.EVENTS = api;
})(typeof window !== "undefined" ? window : globalThis);
