/* ===== الفعاليات والبطولة، ملف واحد يقرأه المتصفح والخادم =====
   توقيت الرياض (UTC+3). عدّل هنا فقط: البطولة، الفعاليات، معركة الكلمات، والهدايا. */
(function(root){
  const TZ = 3; // ساعات فرق التوقيت عن UTC (الرياض)
  const CONFIG = {
    tournament: {
      id: "sep-2026", title: "بطولة سبتمبر", prize: "هدية بقيمة ٣٠٠ ريال",
      desc: "المركز الأول في ترتيب هذا الشهر يفوز بهدية بقيمة ٣٠٠ ريال.",
      from: "2026-09-09T00:00:00+03:00", to: "2026-09-30T23:59:59+03:00",
      key: "2026-09" // مفتاح لوحة الشهر التي تُحسم بها البطولة
    },
    /* فعاليات مضاعفة متكررة، نفس الوقت للجميع، ومُعلنة مسبقًا */
    recurring: [
      { id: "golden", title: "ساعة الذهب", desc: "كل يوم من ٩ إلى ١٠ مساءً: تحدي خاص من ٢٠ سؤال جديد على مستواك، كل سؤال بنقطتين", fromH: 21, toH: 22, mult: 2, icon: "zap" }
    ],
    /* معركة الكلمات: لعبة أسبوعية، نفس الكلمات للجميع، ٦٠ ثانية، وأفضل ثلاثة يفوزون بجوائز */
    battle: {
      id: "word-battle", title: "معركة الكلمات", icon: "swords",
      dow: 5, fromH: 20, toH: 22, // كل جمعة من ٨ إلى ١٠ مساءً
      prizes: [30, 20, 10], seconds: 60,
      desc: "كل جمعة ٨–١٠ مساءً: ٦٠ ثانية، نفس الكلمات للجميع، وتقدر تعيد قد ما تبي، أفضل نتيجة لك هي اللي تنحسب. الأول +٣٠، الثاني +٢٠، الثالث +١٠."
    },
    /* هدايا شخصية: تُطابَق بالاسم أو اسم المستخدم، وتبدأ مدتها من أول دخول لصاحبها */
    gifts: [
      { id: "salma-2026-09", names: ["سلمى", "سلمي", "salma", "salmaa"], mult: 2, hours: 24,
        from: "2026-09-13T00:00:00+03:00", to: "2026-09-30T23:59:59+03:00",
        title: "هدية خاصة لسلمى", msg: "عشان شغلناك عن الموقع وزعلتِ… خذي هذي: كل نقطة تجمعينها خلال ٢٤ ساعة من الآن تُحسب لك مضاعفة ×٢. رحّبنا فيك من جديد!", icon: "gift" }
    ],
    special: [
      { id: "kickoff", title: "انطلاقة البطولة", desc: "أول ٤٨ ساعة من البطولة نقاط ×٢", from: "2026-09-09T00:00:00+03:00", to: "2026-09-10T23:59:59+03:00", mult: 2, icon: "zap" }
    ]
  };
  const H = 3600e3, D = 24 * H;
  const local = t => new Date(t + TZ * H); // "محلي" باستخدام دوال UTC
  const dayStart = t => { const l = local(t); return Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate()) - TZ * H; };
  const dateKey = t => { const l = local(t); return `${l.getUTCFullYear()}-${String(l.getUTCMonth() + 1).padStart(2, "0")}-${String(l.getUTCDate()).padStart(2, "0")}`; };

  function windows(t){ // نوافذ الفعاليات المضاعفة القريبة: [{ev, start, end}]
    const out = []; const ds = dayStart(t);
    for(let k = -1; k <= 8; k++){ const d0 = ds + k * D; const dow = local(d0).getUTCDay();
      CONFIG.recurring.forEach(ev => {
        if(ev.dow !== undefined && ev.fromH === undefined){ if(dow === ev.dow) out.push({ ev, start: d0, end: d0 + D }); }
        else if(ev.fromH !== undefined && (ev.dow === undefined || ev.dow === dow)) out.push({ ev, start: d0 + ev.fromH * H, end: d0 + ev.toH * H });
      }); }
    CONFIG.special.forEach(ev => out.push({ ev, start: Date.parse(ev.from), end: Date.parse(ev.to) + 1000 }));
    return out;
  }
  /* نوافذ معركة الكلمات: الحالية/القادمة/الأخيرة المنتهية */
  function battleWindows(t){
    const B = CONFIG.battle; if(!B) return { active: null, next: null, last: null };
    const ds = dayStart(t); const list = [];
    for(let k = -14; k <= 14; k++){ const d0 = ds + k * D; if(local(d0).getUTCDay() === B.dow) list.push({ start: d0 + B.fromH * H, end: d0 + B.toH * H, key: dateKey(d0) }); }
    return {
      active: list.find(w => w.start <= t && t < w.end) || null,
      next: list.filter(w => w.start > t).sort((a, b) => a.start - b.start)[0] || null,
      last: list.filter(w => w.end <= t).sort((a, b) => b.end - a.end)[0] || null
    };
  }
  function status(t){
    t = t || Date.now();
    const ws = windows(t);
    const map = w => ({ id: w.ev.id, title: w.ev.title, desc: w.ev.desc, mult: w.ev.mult, icon: w.ev.icon, startsAt: w.start, endsAt: w.end });
    const active = ws.filter(w => w.start <= t && t < w.end).map(map);
    const mult = Math.min(3, active.reduce((m, a) => Math.max(m, a.mult), 1));
    const upcoming = ws.filter(w => w.start > t).sort((a, b) => a.start - b.start).map(map);
    const bw = battleWindows(t);
    const battle = CONFIG.battle ? { ...CONFIG.battle, active: bw.active, next: bw.next, last: bw.last } : null;
    const T = CONFIG.tournament; const tFrom = Date.parse(T.from), tTo = Date.parse(T.to) + 1000;
    const tournament = { ...T, startsAt: tFrom, endsAt: tTo, active: t >= tFrom && t < tTo, ended: t >= tTo, upcoming: t < tFrom };
    return { now: t, mult, active, next: upcoming[0] || null, upcoming: upcoming.slice(0, 4), battle, tournament };
  }
  const monthKey = t => { const l = local(t || Date.now()); return `${l.getUTCFullYear()}-${String(l.getUTCMonth() + 1).padStart(2, "0")}`; };
  /* تطبيع الاسم العربي لمطابقة الهدية */
  const normName = s => String(s || "").toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
  /* الهدية: startedAt = أول دخول لصاحبها (يسجله الخادم). بدونه تُعتبر «جاهزة» ومدتها تبدأ الآن */
  function giftFor(user, t, startedAt){
    if(!user) return null; t = t || Date.now();
    const nm = normName(user.name), un = normName(user.u);
    for(const g of CONFIG.gifts || []){
      const inCampaign = t >= Date.parse(g.from) && t < Date.parse(g.to) + 1000;
      const matches = g.names.some(n => { const k = normName(n); return k && (nm === k || nm.includes(k) || un === k || un.includes(k)); });
      if(!matches) continue;
      if(g.hours){
        const start = startedAt || t, end = Math.min(start + g.hours * H, Date.parse(g.to) + 1000);
        if(!startedAt && !inCampaign) continue;
        if(t >= start && t < end) return { ...g, startedAt: start, endsAt: end };
        continue;
      }
      if(inCampaign) return { ...g, endsAt: Date.parse(g.to) + 1000 };
    }
    return null;
  }
  const api = { CONFIG, status, monthKey, dateKey, battleWindows, TZ, giftFor, normName };
  if(typeof module !== "undefined" && module.exports) module.exports = api; else root.EVENTS = api;
})(typeof window !== "undefined" ? window : globalThis);
