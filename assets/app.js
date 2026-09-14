/* ===== STEP English — shared script ===== */
/* قسمان منفصلان: ستيب (تجهيز الاختبار) وإنقلش عام (تعلّم اللغة). الحساب والمنافسة مشتركان. */
const NAV_STEP = [
  { href: "step.html", label: "الرئيسية", icon: "home" },
  { href: "train.html", label: "تدرّب", icon: "target" },
  { href: "quiz.html", label: "اختبر نفسك", icon: "pencil" },
  { href: "compete.html", label: "تنافس", icon: "trophy" },
  { href: "collections.html", label: "التجميعات", icon: "library" },
  { href: "grammar.html", label: "القواعد", icon: "book" },
  { href: "vocabulary.html", label: "المفردات", icon: "type" },
  { href: "reading.html", label: "القراءة", icon: "bookopen" },
  { href: "listening.html", label: "الاستماع", icon: "headphones" },
  { href: "tips.html", label: "تجارب المختبرين", icon: "bulb" }
];
const NAV_GEN = [
  { href: "general.html", label: "الرئيسية", icon: "home" },
  { href: "general.html#/today", label: "اليوم", icon: "target" },
  { href: "general.html#/vocab", label: "المفردات", icon: "type" },
  { href: "general.html#/grammar", label: "القواعد", icon: "book" },
  { href: "general.html#/talk", label: "المحادثة", icon: "mic" },
  { href: "general.html#/verbs", label: "الأفعال", icon: "list" },
  { href: "library.html", label: "القصص", icon: "bookopen" },
  { href: "general.html#/games", label: "الألعاب", icon: "timer" },
  { href: "compete.html", label: "تنافس", icon: "trophy" }
];
const NAV_LANDING = [
  { href: "general.html", label: "إنقلش عام", icon: "globe" },
  { href: "step.html", label: "تجهيز STEP", icon: "target" },
  { href: "compete.html", label: "تنافس", icon: "trophy" }
];
const TABS_STEP = ["step.html", "train.html", "quiz.html", "compete.html", "account.html"];
const TABS_GEN = ["general.html", "general.html#/today", "library.html", "compete.html", "account.html"];
const TABS_LANDING = ["index.html", "general.html", "step.html", "compete.html", "account.html"];
const GEN_PAGES = ["general.html", "library.html"];
const STEP_PAGES = ["step.html", "train.html", "quiz.html", "collections.html", "grammar.html", "vocabulary.html", "reading.html", "listening.html", "tips.html"];
function section(){
  const p = curPage();
  if(GEN_PAGES.includes(p)){ Store.set("step_section", "gen"); return "gen"; }
  if(STEP_PAGES.includes(p)){ Store.set("step_section", "step"); return "step"; }
  if(p === "index.html" || p === "") return "landing";
  return Store.get("step_section", "gen"); // صفحات مشتركة: حسابي، تنافس
}
const SECTION_INFO = { gen: { home: "general.html", brand: "إنقلش عام", other: "step.html", otherLabel: "تجهيز STEP", otherIcon: "target" }, step: { home: "step.html", brand: "STEP", other: "general.html", otherLabel: "إنقلش عام", otherIcon: "globe" }, landing: { home: "index.html", brand: "STEP", other: null } };
let NAV = NAV_LANDING, TABS = TABS_LANDING;

const Store = {
  get(k, def){ try{ const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); }catch(e){ return def; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
function shuffle(arr){ const a = arr.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sample(arr, n){ return shuffle(arr).slice(0, n); }
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
const LETTERS = ["A", "B", "C", "D", "E"];
const curPage = () => (location.pathname.split("/").pop() || "index.html").toLowerCase();


/* ---- hand-drawn line icons (single style, replaces emoji) ---- */
const ICONS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  pencil: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3',
  library: 'M16 6l4 14M12 6v14M8 8v12M4 4v16',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  type: 'M4 7V4h16v3M9 20h6M12 4v16',
  bookopen: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  headphones: 'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',
  bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4',
  flag: 'M4 22V4M4 4h12l-2 4 2 4H4',
  refresh: 'M21 12a9 9 0 1 1-3-6.7M21 3v6h-6',
  x: 'M18 6L6 18M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  fire: 'M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 3-2 4-3 4 0-3-1-6-3-8-1 3-3 5-4 8-1 1-1 2-1 3 0 4 3 7 7 7z',
  calendar: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18',
  brain: 'M9.5 2a2.5 2.5 0 0 0-2.5 2.5v.5A3 3 0 0 0 5 8a3 3 0 0 0-1 5.5 3 3 0 0 0 2 5.5h3.5V2zM14.5 2a2.5 2.5 0 0 1 2.5 2.5v.5a3 3 0 0 1 2 3 3 3 0 0 1 1 5.5 3 3 0 0 1-2 5.5h-3.5V2z',
  chartdown: 'M22 17l-8.5-8.5-5 5L2 7M16 17h6v-6',
  repeat: 'M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  swords: 'M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M14.5 6.5L18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-4 4M3 19l2 2',
  link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2 2M10 2h4',
  medal: 'M12 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.5 10.5L6 2h4l2 4 2-4h4l-2.5 8.5',
  alert: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  clipboard: 'M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
  mic: 'M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8',
  compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z',
  sparkles: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM5 3v4M3 5h4M19 17v4M17 19h4',
  cloud: 'M17.5 19a4.5 4.5 0 1 0-1-8.9A6 6 0 0 0 5 12a4 4 0 0 0 .5 7z',
  cards: 'M9 3h9a2 2 0 0 1 2 2v13M4 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z',
  star: 'M12 2l3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1z',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3',
  plant: 'M12 22V12M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 16c0-3-2-6-6-6 0 3 2 6 6 6z',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  arrow: 'M19 12H5M12 19l-7-7 7-7',
  volume: 'M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14',
  gift: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  play: 'M6 4l14 8-14 8z',
  pause: 'M7 4h4v16H7zM13 4h4v16h-4z',
  next: 'M5 4l10 8-10 8zM17 4h2v16h-2z',
  prev: 'M19 4L9 12l10 8zM5 4h2v16H5z',
  mute: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
  smile: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
  award: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.2 13.9L7 23l5-3 5 3-1.2-9.1'
};
/* أيقونات ثلاثية الأبعاد (Microsoft Fluent Emoji — رخصة MIT) مع رجوع للإيموجي العادي لو ما تحمّلت */
const EMO = { fire: ["1f525", "🔥"], books: ["1f4da", "📚"], memo: ["1f4dd", "📝"], talk: ["1f5e3-fe0f", "🗣️"], game: ["1f3ae", "🎮"], book: ["1f4d6", "📖"], repeat: ["1f501", "🔁"], trophy: ["1f3c6", "🏆"], check: ["2705", "✅"], review: ["1f504", "🔄"], star: ["2b50", "⭐"], gift: ["1f381", "🎁"], shield: ["1f6e1-fe0f", "🛡️"], sparkles: ["2728", "✨"], comet: ["2604-fe0f", "☄️"], volcano: ["1f30b", "🌋"], crown: ["1f451", "👑"], swords: ["2694-fe0f", "⚔️"], clock: ["23f0", "⏰"], target: ["1f3af", "🎯"], puzzle: ["1f9e9", "🧩"], headphones: ["1f3a7", "🎧"], chat: ["1f4ac", "💬"], party: ["1f389", "🎉"], muscle: ["1f4aa", "💪"], wave: ["1f44b", "👋"], rocket: ["1f680", "🚀"], brain: ["1f9e0", "🧠"], calendar: ["1f4c5", "📅"], user: ["1f464", "👤"], home: ["1f3e0", "🏠"], bell: ["1f514", "🔔"], stopwatch: ["23f1-fe0f", "⏱️"], abc: ["1f524", "🔤"], link: ["1f517", "🔗"], cards: ["1f3b4", "🎴"], bulb: ["1f4a1", "💡"], mic: ["1f3a4", "🎤"], globe: ["1f30d", "🌍"], bluebook: ["1f4d8", "📘"] };
/* عدد + تمييز بالعربي: ٣–١٠ جمع، غيرها مفرد (5 كلمات، 12 كلمة) */
const arN = (n, one, many) => `${n} ${n >= 3 && n <= 10 ? many : one}`;
function emo(name, cls){
  const e = EMO[name]; if(!e) return "";
  return `<img class="emo ${cls || ""}" src="https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@1.1.0/assets/${e[0]}.webp" alt="${e[1]}" decoding="async" draggable="false" onerror="this.replaceWith(document.createTextNode(this.alt))">`;
}
function I(name, cls){ const d = ICONS[name] || ICONS.star; return `<svg class="i ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`; }
function hydrateIcons(root){ (root || document).querySelectorAll("i[data-i]").forEach(el => { el.outerHTML = I(el.dataset.i, el.className); }); }
new MutationObserver(ms => { for(const m of ms) for(const n of m.addedNodes){ if(n.nodeType === 1){ if(n.matches && n.matches("i[data-i]")) hydrateIcons(n.parentNode); else if(n.querySelector && n.querySelector("i[data-i]")) hydrateIcons(n); } } }).observe(document.documentElement, { childList: true, subtree: true });

/* topic -> where its rule is explained */
const GRAMMAR_TOPICS = ["tenses","forsince","verbpat","reported","conj","questions","relative","inversion","conditionals","passive","modals","comparison","articles","prepositions","tooenough","errors"];
const LESSON_OF = t => GRAMMAR_TOPICS.includes(t) ? "grammar.html#" + t : t === "vocab" ? "vocabulary.html" : t === "reading" ? "reading.html" : t === "clistening" ? "collections.html?c=listening" : t === "cgrammar" ? "collections.html?c=grammar" : t === "creading" ? "collections.html?c=reading" : null;
const lessonLink = (t, label) => { const h = LESSON_OF(t); return h ? `<a class="mini-link" href="${h}">${I("book")} ${label || "افهم القاعدة"}</a>` : ""; };
const markBtn = id => `<button type="button" class="mark-btn ${Progress.isMarked(id) ? "on" : ""}" data-mark="${id}" title="علّم على السؤال">${I("bookmark")}<span>${Progress.isMarked(id) ? "معلَّم" : "علّم"}</span></button>`;
document.addEventListener("click", e => { const b = e.target.closest("[data-mark]"); if(!b) return; const on = Progress.toggleMark(b.dataset.mark); b.classList.toggle("on", on); b.querySelector("span").textContent = on ? "معلَّم" : "علّم"; toast(on ? "تمت إضافته إلى أسئلتك المعلَّمة" : "أُزيلت العلامة"); });


/* automatic rule hint for collection questions (no authored explanation) */
const HINTS = [
  [/\b(yesterday|last (year|week|month|night|summer)|ago|in \d{4}|when (he|she|I|we|they) was)\b/i, "تلميح: وجود وقت محدد في الماضي (yesterday, last…, ago, في سنة) يعني الماضي البسيط (V2) وليس المضارع التام."],
  [/\b(since|for (the last|\d+|two|three|four|five|ten|many|a long))\b/i, "تلميح: since (نقطة بداية) و for (مدة) تأتيان غالبًا مع المضارع التام has/have + V3 لحدث بدأ في الماضي وما زال مستمرًا."],
  [/\b(now|at the moment|right now|look!|listen!|currently)\b/i, "تلميح: كلمات مثل now / at the moment / Look! تدل على حدث يجري الآن → المضارع المستمر (am/is/are + V-ing)."],
  [/\b(every (day|week|month|year|morning)|always|usually|often|sometimes|never|rarely)\b/i, "تلميح: كلمات التكرار (every day, always, usually…) تدل على عادة → المضارع البسيط، ومع فاعل مفرد نضيف s."],
  [/\b(tomorrow|next (week|month|year)|soon|in the future|tonight)\b/i, "تلميح: tomorrow / next… تدل على المستقبل → will + V1 أو be going to."],
  [/\b(by the time|before|after|already|had)\b/i, "تلميح: حدثان في الماضي أحدهما أسبق (by the time, before, after) → الأسبق يأخذ الماضي التام had + V3."],
  [/\b(while|when)\b/i, "تلميح: مع when/while: الحدث الطويل يأخذ الماضي المستمر (was/were + V-ing) والحدث القصير الماضي البسيط."],
  [/\b(make|made|let|help|had better|would rather)\b/i, "تلميح: بعد make / let / had better / would rather يأتي الفعل في المصدر بدون to."],
  [/\b(enjoy|avoid|finish|mind|suggest|keep|practice|consider|miss|give up|stop)\b/i, "تلميح: بعد enjoy / avoid / finish / mind / suggest / keep / stop يأتي الفعل بصيغة V-ing."],
  [/\b(want|decide|hope|plan|need|promise|agree|refuse|learn|would like|expect|manage|afford)\b/i, "تلميح: بعد want / decide / hope / plan / need / promise / afford يأتي to + V1."],
  [/\b(told|asked|said)\b/i, "تلميح: الكلام المنقول: بعد فعل قول في الماضي نرجّع الزمن خطوة (is→was, will→would, can→could)، والأمر يُنقل بـ told/asked + شخص + (not) to + V1."],
  [/\b(although|though|despite|in spite of|however|but|so|because|therefore|unless|in case)\b/i, "تلميح: حدد العلاقة بين الجملتين: تناقض (but/however/although + جملة، despite + اسم)، سبب (because + جملة، because of + اسم)، نتيجة (so/therefore)، شرط (unless = if not)."],
  [/\b(who|whom|whose|which|where|when|that)\b.*\?$/i, "تلميح: ضمائر الوصل: who للأشخاص، which/that للأشياء، whose يأتي بعده اسم مملوك، where للمكان + جملة كاملة، when للزمن."],
  [/^(Never|Rarely|Seldom|Hardly|Not only|No sooner|Little)\b/i, "تلميح: عندما تبدأ الجملة بظرف سالب (Never, Rarely, Not only…) نقلب الفاعل والفعل المساعد كأنه سؤال: Never have I…"],
  [/\bif\b/i, "تلميح: الجمل الشرطية: If + مضارع ← will؛ If + ماضٍ ← would؛ If + had V3 ← would have V3. ولا يأتي will بعد if."],
  [/\b(by (the|a|an|my|his|her|their)|was|were|been|be)\b.*\b(built|written|made|sent|done|taken|given|spoken|invented|published|cleaned|repaired)\b/i, "تلميح: عندما يكون الفاعل هو المتلقي للفعل (لا يقوم به) نستخدم المبني للمجهول: be + V3 حسب الزمن."],
  [/\b(must|mustn't|have to|don't have to|should|ought to|can|could|may|might)\b/i, "تلميح: الأفعال الناقصة: must إلزام، mustn't ممنوع، don't have to ليس ضروريًا، should نصيحة، can قدرة، may/might احتمال، وبعدها الفعل مجرد."],
  [/\b(than|as .* as|the (most|best|worst|least)|-est\b|more |most )/i, "تلميح: المقارنة: صفة قصيرة + er / the + est، صفة طويلة more / the most، الشواذ good→better→best و bad→worse→worst، والمساواة as…as."],
  [/\b(much|many|few|a few|little|a little|some|any|a lot of)\b/i, "تلميح: many / few للمعدود، much / little لغير المعدود، some في المثبت وany في النفي والسؤال."],
  [/\b(too|enough|so|such)\b/i, "تلميح: too + صفة (أكثر من اللازم)، صفة + enough، so + صفة + that، such + (a) + صفة + اسم + that."],
  [/\b(at|on|in|for|from|to|of|with|about)\b\s*[.…]{2,}|[.…]{2,}\s*(the|a|an)?\s*(morning|night|Monday|\d{4}|o'clock)/i, "تلميح: حروف الجر: at + ساعة، on + يوم/تاريخ، in + شهر/سنة/فترة؛ وتعابير ثابتة مثل good at / interested in / afraid of / different from."],
  [/\b(CAPITALIZATION|capital)\b/i, "تلميح: تُكتب بحرف كبير: بداية الجملة، أسماء الأشخاص والأماكن والدول والمؤسسات (King Faisal University)، الأيام والشهور، وكلمة I. الكلمات العامة (university, chemistry) تبقى صغيرة إلا إن كانت جزءًا من اسم علم."],
  [/\b(WORD ORDER|join these sentences|best way to)\b/i, "تلميح: ابحث عن الترتيب الطبيعي: فاعل ← فعل ← مفعول، والظرف الزمني في البداية أو النهاية، والرابط المناسب للعلاقة بين الجملتين (but تناقض، so نتيجة، because سبب)."],
];
function autoHint(q){ const t = String(q.q || "").replace(/<[^>]+>/g, ""); for(const [re, h] of HINTS){ if(re.test(t)) return h; } return "تلميح: قارن بين الخيارات: هل الفرق في الزمن؟ في صيغة الفعل (to / -ing / بدون to)؟ في حرف الجر؟ في المقارنة؟ ثم ابحث في الجملة عن الكلمة الدالة التي تحسم الاختيار."; }

/* why a chosen answer is wrong + rule explanation */
function explainHtml(q, chosen){
  const L = ["A","B","C","D","E"]; const ok = chosen === q.a;
  const why = (typeof WHY !== "undefined" && WHY[q.id] && chosen !== undefined && chosen !== null) ? WHY[q.id][chosen] : null;
  let h = "";
  if(!ok && chosen !== undefined && chosen !== null) h += `<div class="why-wrong"><b>${I("x")} لماذا إجابتك (${L[chosen]}) ${esc(q.opts[chosen])} خطأ؟</b><div>${why ? esc(why) : "«" + esc(q.opts[chosen]) + "» لا تحقق القاعدة المطلوبة في هذه الجملة — اقرأ التلميح أدناه وقارنها بالإجابة الصحيحة."}</div></div>`;
  if(!ok && (chosen === undefined || chosen === null)) h += `<div class="why-wrong"><b>${I("x")} لم تُجب على هذا السؤال</b></div>`;
  const rule = q.kind === "coll" ? `${esc(q.ex)}<br>${esc(autoHint(q))}` : esc(q.ex);
  h += `<div class="why-rule"><b>${I("check")} الصحيح: (${L[q.a]}) ${esc(q.opts[q.a])}</b><div>${rule}</div></div>`;
  const t = q.kind === "grammar" || q.kind === "coll" ? q.topic : q.kind;
  h += `<div class="btn-row" style="margin-top:8px">${typeof markBtn === "function" ? markBtn(q.id) : ""}${lessonLink(t, "افتح شرح القاعدة")}</div>`;
  return h;
}
/* ---- سجل النقاط: شفاف للجميع — تضغط أي اسم في الترتيب وتشوف من وين جات كل نقطة ---- */
const MODE_AR = { general: "إنقلش عام", train: "تدريب STEP", grammar: "اختبار قواعد STEP", vocab: "مفردات", reading: "قراءة / قصة", mix: "اختبار STEP شامل", wrong: "مراجعة أخطاء", challenge: "تحدي", clistening: "تجميعات استماع", cgrammar: "تجميعات قرامر", creading: "تجميعات قطع" };
async function pointsLog(u){
  const ov = modalCard(`<div class="log-wrap"><p class="muted">جارٍ تحميل السجل…</p></div>`);
  const box = ov.querySelector(".log-wrap");
  let j; try{ j = await Auth.api("/api/points?log=" + encodeURIComponent(u)); }catch(e){ box.innerHTML = `<p class="muted">${esc(e.message)}</p><button type="button" class="btn" data-close>إغلاق</button>`; ov.querySelector("[data-close]").addEventListener("click", () => ov.remove()); return; }
  const parts = [...j.areas, ...j.extras];
  const dayOf = t => new Date(t + 3 * 3600e3).toISOString().slice(0, 10);
  let lastDay = "";
  const rows = j.rounds.map(r => {
    const d = dayOf(r.at), head = d !== lastDay ? `<tr class="log-day"><td colspan="4">${new Date(r.at).toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}</td></tr>` : ""; lastDay = d;
    const note = [r.stage ? "إتمام وحدة +10" : "", r.story ? "إتمام قصة" : "", r.mult > 1 && r.bonus ? `×${r.mult} فعالية` : "", r.partial ? "إجابات انحفظت بعد الخروج" : "", r.challenge ? "تحدي" : ""].filter(Boolean).join(" · ");
    return head + `<tr><td class="log-t">${new Date(r.at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</td><td>${MODE_AR[r.mode] || esc(r.mode)}<div class="small muted">${note}</div></td><td class="log-s">${r.score}/${r.total}</td><td class="log-p ${r.points ? "" : "muted"}">${r.points ? "+" + r.points : "0"}${r.base != null && r.points && r.base !== r.points ? `<div class="small muted">${r.base} جديد</div>` : ""}</td></tr>`;
  }).join("");
  box.innerHTML = `<div class="log-head">${avatarHtml(j.name, j.u)}<div><h3 style="margin:0">${esc(j.name)}</h3><div class="small muted">${j.total} نقطة · ${j.uniqueQuestions} سؤال مختلف · ${j.rounds.length} جولة${j.streak ? ` · 🔥${j.streak}` : ""}</div></div></div>
    <div class="log-breakdown">${parts.map(p => `<div class="pts-row"><div class="pr-l">${esc(p.label)}</div><div class="pr-bar"><div style="width:${Math.round(p.points / Math.max(1, ...parts.map(x => x.points)) * 100)}%"></div></div><div class="pr-n">${p.points}</div></div>`).join("")}<div class="pts-row total"><div class="pr-l">المجموع</div><div class="pr-bar"></div><div class="pr-n">${j.sum}</div></div>${j.consistent ? "" : `<p class="small muted">فرق ${j.total - j.sum} من قبل تسجيل التفصيل.</p>`}</div>
    <p class="small muted log-rule">${I("info")} كل سؤال = نقطة <b>مرة واحدة في العمر</b> أول ما تجاوبه صح (الإعادة = 0). ساعة الذهب ٩–١٠ مساءً ونقاط الهدايا = ×٢. إتمام وحدة = +10. السيرفر يتأكد أن كل سؤال موجود فعلًا في الموقع قبل ما يحسبه.</p>
    <div class="table-wrap log-table"><table><thead><tr><th>الوقت</th><th>وش سوى</th><th>النتيجة</th><th>النقاط</th></tr></thead><tbody>${rows || `<tr><td colspan="4" class="muted center">ما فيه جولات محفوظة</td></tr>`}</tbody></table></div>
    <div class="btn-row" style="justify-content:center;margin-top:10px"><button type="button" class="btn btn-primary" data-close>إغلاق</button></div>`;
  hydrateIcons(box);
  box.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => ov.remove()));
}
document.addEventListener("click", e => { const row = e.target.closest(".lb-row[data-log]"); if(row && row.dataset.log){ if(!Auth.user()){ toast("سجّل الدخول لعرض سجل النقاط"); return; } pointsLog(row.dataset.log); } });
document.addEventListener("keydown", e => { if(e.key === "Enter"){ const row = e.target.closest && e.target.closest(".lb-row[data-log]"); if(row && row.dataset.log && Auth.user()) pointsLog(row.dataset.log); } });
/* ---- بطاقة تفعيل الإشعارات في الرئيسية: زر واحد، وتختفي بعد التفعيل ---- */
function renderNotifNudge(){
  const host = document.getElementById("eventsBar"); const me = Auth.user();
  if(!host || !me || typeof Push === "undefined" || Store.get("step_push_on", false) || Store.get("step_push_nudge_off_" + me.u, false)) return;
  const cp = curPage(), hh = location.hash.replace(/^#\/?/, "");
  if(!(["index.html", "step.html"].includes(cp) || ((cp === "general.html" || cp === "library.html") && !hh))) return;
  const ios = Push.isIOS() && !Push.standalone();
  if(!Push.supported() && !ios) return;
  if(Push.supported() && Notification.permission === "denied") return;
  const el = document.createElement("div"); el.className = "card push-card";
  el.innerHTML = ios
    ? `${emo("bell")}<div class="pc-b"><b>تبي تنبيهات ساعة الذهب وشعلتك على جوالك؟</b><div class="small muted">على الآيفون: اضغط زر المشاركة في Safari ← «إضافة إلى الشاشة الرئيسية»، وافتح «إنقلش» من هناك وفعّلها.</div></div><div class="pc-a"><a class="btn btn-sm btn-primary" href="account.html#notif">كيف؟</a><button type="button" class="btn btn-sm" data-off>لاحقًا</button></div>`
    : `${emo("bell")}<div class="pc-b"><b>فعّل الإشعارات</b><div class="small muted">تذكير واحد باليوم: ساعة الذهب، شعلتك، ومعركة الجمعة — ما نرسل غيرها.</div></div><div class="pc-a"><button type="button" class="btn btn-sm btn-primary" data-on>${I("bell")} فعّل</button><button type="button" class="btn btn-sm" data-off>لاحقًا</button></div>`;
  host.insertAdjacentElement("afterend", el); hydrateIcons(el);
  const off = el.querySelector("[data-off]"); if(off) off.addEventListener("click", () => { Store.set("step_push_nudge_off_" + me.u, true); el.remove(); });
  const on = el.querySelector("[data-on]"); if(on) on.addEventListener("click", async () => { on.disabled = true; on.textContent = "… جاري التفعيل"; try{ await Push.enable(); toast("تم تفعيل الإشعارات 🔔 — بنرسل لك إشعار تجربة", 4000); el.remove(); try{ await Auth.api("/api/push", { method: "POST", body: { action: "test" } }); }catch(e){} }catch(e){ toast(e.message, 5000); on.disabled = false; on.innerHTML = I("bell") + " فعّل"; } });
}
/* ---- نقاط معلّقة: كل إجابة صحيحة تنحفظ فورًا، فلو علق الموقع أو خرجت قبل نهاية الاختبار ما تضيع ---- */
const Pending = {
  key(){ const u = Auth.user(); return u ? "step_pending_" + u.u : null; },
  get(){ const k = this.key(); return k ? Store.get(k, []) : []; },
  add(id, mode){ const k = this.key(); if(!k || !id) return; const a = this.get(); if(!a.some(x => x.id === id)){ a.push({ id: String(id), mode: mode || "general", at: Date.now() }); Store.set(k, a.slice(-400)); } },
  remove(ids){ const k = this.key(); if(!k || !ids || !ids.length) return; const s = new Set(ids.map(String)); Store.set(k, this.get().filter(x => !s.has(x.id))); },
  busy: false,
  async flush(minAge){
    const k = this.key(); if(!k || this.busy) return;
    const a = this.get().filter(x => Date.now() - x.at > (minAge == null ? 4000 : minAge)); if(!a.length) return;
    this.busy = true;
    try{
      const byMode = {}; a.forEach(x => (byMode[x.mode] = byMode[x.mode] || []).push(x.id));
      for(const [mode, ids] of Object.entries(byMode)){
        for(let i = 0; i < ids.length; i += 100){
          const chunk = ids.slice(i, i + 100);
          const j = await Auth.api("/api/result", { method: "POST", body: { mode, score: chunk.length, total: chunk.length, seconds: 0, ids: chunk, partial: true } });
          this.remove(chunk);
          if(j && j.points > 0) toast(`+${j.points} نقطة من إجابات ما انحسبت قبل`, 3500);
        }
      }
    }catch(e){} finally{ this.busy = false; }
  }
};
/* ---- إشعارات الجوال: تسجيل آمن (لازم حساب + موافقة صريحة من الشخص) ---- */
const Push = {
  supported(){ return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window; },
  isIOS(){ return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); },
  standalone(){ return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; },
  async reg(){ return navigator.serviceWorker.register("/sw.js", { scope: "/" }); },
  async current(){ if(!this.supported()) return null; const r = await navigator.serviceWorker.getRegistration("/"); return r ? r.pushManager.getSubscription() : null; },
  keyBytes(b64){ const p = "=".repeat((4 - b64.length % 4) % 4), raw = atob((b64 + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); },
  async enable(){
    if(!Auth.user()) throw new Error("سجّل الدخول أولًا");
    if(!this.supported()) throw new Error(this.isIOS() ? "في الآيفون لازم تضيف الموقع للشاشة الرئيسية وتفتحه من هناك" : "متصفحك ما يدعم الإشعارات");
    const perm = await Notification.requestPermission();
    if(perm !== "granted") throw new Error("ما تم السماح بالإشعارات — تقدر تفعّلها من إعدادات المتصفح");
    const { key } = await Auth.api("/api/push");
    if(!key) throw new Error("الإشعارات غير جاهزة على الخادم");
    const r = await this.reg(); await navigator.serviceWorker.ready;
    let sub = await r.pushManager.getSubscription();
    if(!sub) sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: this.keyBytes(key) });
    await Auth.api("/api/push", { method: "POST", body: { action: "subscribe", sub: sub.toJSON() } });
    Store.set("step_push_on", true);
    return true;
  },
  async disable(){
    const sub = await this.current();
    if(sub){ try{ await Auth.api("/api/push", { method: "POST", body: { action: "unsubscribe", endpoint: sub.endpoint } }); }catch(e){} await sub.unsubscribe(); }
    Store.set("step_push_on", false);
  },
  /* يحدّث الاشتراك بهدوء لو الشخص مفعّلها من قبل */
  async refresh(){
    try{ if(!Auth.user() || !this.supported() || Notification.permission !== "granted" || !Store.get("step_push_on", false)) return; const sub = await this.current(); if(sub) await Auth.api("/api/push", { method: "POST", body: { action: "subscribe", sub: sub.toJSON() } }); }catch(e){}
  }
};
/* شرح القاعدة في نافذة فوق السؤال — ما تطلع من الاختبار ولا يضيع تقدمك */
let STEP_LESSONS_DOC = null;
async function openRuleSheet(href){
  const ov = document.createElement("div"); ov.className = "rule-ov";
  ov.innerHTML = `<div class="rule-sheet" role="dialog" aria-modal="true"><div class="rule-top"><b>${I("book")} شرح القاعدة</b><button type="button" class="btn btn-primary btn-sm" data-close>${I("arrow")} رجوع للسؤال</button></div><div class="rule-body"><p class="muted">جارٍ تحميل الشرح…</p></div></div>`;
  document.body.appendChild(ov); document.body.classList.add("sheet-open");
  const close = () => { ov.remove(); document.body.classList.remove("sheet-open"); removeEventListener("keydown", esc_); };
  const esc_ = e => { if(e.key === "Escape") close(); };
  addEventListener("keydown", esc_);
  ov.addEventListener("click", e => { if(e.target === ov || e.target.closest("[data-close]")) close(); });
  const body = ov.querySelector(".rule-body");
  try{
    let html = "", full = href;
    if(href.startsWith("#/lesson/") && typeof window.GenLessonSummary === "function"){
      html = window.GenLessonSummary(href.split("/")[2]);
    }else{
      const id = href.split("#")[1];
      if(!STEP_LESSONS_DOC){ const t = await (await fetch("grammar.html", { cache: "force-cache" })).text(); STEP_LESSONS_DOC = new DOMParser().parseFromString(t, "text/html"); }
      const sec = STEP_LESSONS_DOC.getElementById(id);
      if(sec){ const c = sec.cloneNode(true); c.querySelectorAll(".mini, .lesson-back, script").forEach(x => x.remove()); c.removeAttribute("id"); html = `<div class="lesson rule-lesson">${c.innerHTML}</div>`; }
    }
    if(!html){ body.innerHTML = `<p class="muted">ما لقيت شرح لهذا السؤال.</p>`; return; }
    body.innerHTML = html + `<div class="btn-row rule-foot"><button type="button" class="btn btn-primary" data-close>${I("check")} فهمت، رجّعني للسؤال</button><a class="btn btn-sm" href="${full}">افتح الدرس كامل</a></div>`;
    hydrateIcons(body);
    body.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
  }catch(e){ body.innerHTML = `<p class="muted">تعذّر تحميل الشرح. تأكد من الإنترنت وجرّب مرة ثانية.</p>`; }
}
document.addEventListener("click", e => {
  const a = e.target.closest("a.mini-link"); if(!a) return;
  const h = a.getAttribute("href") || "";
  if(h.startsWith("#/lesson/") || (/^grammar\.html#/.test(h) && curPage() !== "grammar.html")){ e.preventDefault(); openRuleSheet(h); }
});
function focusLessonFromHash(){
  const id = (location.hash || "").slice(1); if(!id) return;
  const el = document.getElementById(id); if(!el || !el.classList.contains("lesson")) return;
  el.classList.add("focus");
  let userMoved = false; const stop = () => { userMoved = true; };
  ["wheel", "touchstart", "keydown"].forEach(ev => window.addEventListener(ev, stop, { passive: true, once: true }));
  const go = () => { if(userMoved) return; const top = el.getBoundingClientRect().top; if(Math.abs(top - 66) > 24){ window.scrollTo({ top: window.scrollY + top - 66, behavior: "instant" }); } };
  try{ history.scrollRestoration = "manual"; }catch(e){}
  go(); const iv = setInterval(go, 200); setTimeout(() => clearInterval(iv), 6000);
  window.addEventListener("load", () => setTimeout(go, 50)); if(document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(go, 50));
  const back = document.createElement("div"); back.className = "note tip lesson-back"; back.innerHTML = `<span class="ic">${I("bulb")}</span><p>هذا هو شرح القاعدة التي أخطأت فيها. اقرأه ثم <a href="javascript:history.back()">ارجع للسؤال</a> أو <a href="train.html?topic=${id}&start=1">تدرّب على هذا الموضوع</a>.</p>`;
  el.insertBefore(back, el.firstChild.nextSibling);
}

/* ---- auth ---- */
const Auth = {
  get(){ return Store.get("step_auth", null); },
  set(a){ Store.set("step_auth", a); },
  clear(){ Store.del("step_auth"); },
  user(){ const a = this.get(); return a && a.user ? a.user : null; },
  async api(path, opts = {}){
    const a = this.get(); const headers = { "Content-Type": "application/json" };
    if(a && a.token) headers.Authorization = "Bearer " + a.token;
    let r;
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const tm = ctl ? setTimeout(() => ctl.abort(), opts.timeout || 10000) : null;
    try{ r = await fetch(path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined, signal: ctl ? ctl.signal : undefined }); }
    catch(e){ throw new Error(e && e.name === "AbortError" ? "النت بطيء — ما وصلنا رد من الخادم، جرّب مرة ثانية" : "تعذّر الاتصال بالخادم — تأكد من الإنترنت"); }
    finally{ if(tm) clearTimeout(tm); }
    let j = null; try{ j = await r.json(); }catch(e){}
    if(r.status === 401 && a && !path.includes("/login") && !path.includes("/register")) this.clear();
    if(!r.ok) throw new Error((j && j.error) || ("خطأ " + r.status));
    return j;
  }
};
function avatarHtml(name, u, cls){
  let h = 0; for(const ch of String(u || name || "")) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const initial = String(name || "?").trim().charAt(0).toUpperCase();
  return `<span class="avatar ${cls || ""}" style="background:linear-gradient(135deg,hsl(${h},70%,50%),hsl(${(h + 40) % 360},70%,40%))">${esc(initial)}</span>`;
}

/* ---- theme ---- */
const ICON_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>`;
const ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 13.2A8.5 8.5 0 0 1 10.8 3a7 7 0 1 0 10.2 10.2z"/></svg>`;
function systemTheme(){ try{ return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }catch(e){ return "light"; } }
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t); Store.set("step_theme", t);
  const b = document.getElementById("themeBtn");
  if(b){ b.innerHTML = (t === "dark" ? ICON_SUN : ICON_MOON) + `<span class="tl">${t === "dark" ? "فاتح" : "داكن"}</span>`; b.setAttribute("aria-label", t === "dark" ? "الوضع الفاتح" : "الوضع الداكن"); }
}
function toggleTheme(){ applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); }

/* ---- head extras (favicon, theme color) ---- */
function injectHead(){
  if(document.querySelector("link[rel='icon']")) return;
  const icon = document.createElement("link"); icon.rel = "icon";
  icon.href = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d28d9"/><stop offset=".55" stop-color="#4f46e5"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="32" y="41" font-family="Segoe UI,Arial,sans-serif" font-size="24" font-weight="800" fill="#fff" text-anchor="middle">STEP</text></svg>`);
  document.head.appendChild(icon);
  
}

/* ---- nav + bottom tab bar ---- */
/* أي قسم في القائمة يتعلّم عليه (صفحات إنقلش عام الداخلية تتبع قسمها) */
function genSectionOf(hash){
  const p = String(hash || "").replace(/^#\/?/, "").split("/"), k = p[0] || "";
  if(k === "game") return p[2] ? "vocab" : "games";
  return ({ theme: "vocab", review: "vocab", vocab: "vocab", lesson: "grammar", practice: "grammar", grammar: "grammar", talk: "talk", dialogue: "talk", roleplay: "talk", speak: "talk", verbs: "verbs", verbquiz: "verbs", games: "games", battle: "today", today: "today", wordle: "today", golden: "today" })[k] || "";
}
function navIsActive(h, cur){
  const [p, hs] = h.split("#"); if(p !== cur) return false;
  if(p === "general.html") return genSectionOf(hs ? "#" + hs : "") === genSectionOf(location.hash);
  if(hs) return location.hash.startsWith("#" + hs);
  return true;
}
function refreshNavActive(){
  const cur = curPage();
  document.querySelectorAll(".nav a.link[href], .tabbar a[href], .drawer a[href]").forEach(a => { const h = a.getAttribute("href"); if(!h || /^https?:/.test(h)) return; a.classList.toggle("active", navIsActive(h, cur)); });
}
function renderNav(){
  injectHead();
  const host = document.getElementById("nav");
  const cur = curPage();
  const me = Auth.user();
  const sec = section(), info = SECTION_INFO[sec];
  NAV = sec === "gen" ? NAV_GEN : sec === "step" ? NAV_STEP : NAV_LANDING;
  TABS = sec === "gen" ? TABS_GEN : sec === "step" ? TABS_STEP : TABS_LANDING;
  const isActive = h => navIsActive(h, cur);
  const sw = info.other ? `<a class="link sw" href="${info.other}" title="الانتقال إلى القسم الآخر"><span class="ni">${I(info.otherIcon)} </span>${info.otherLabel}</a>` : "";
  if(host){
    host.className = "nav";
    host.innerHTML = `<div class="container nav-inner">
      <a class="brand" href="${info.home}"><img class="logo-img" src="assets/brand/logo.svg" alt="" width="36" height="36"><span>${sec === "gen" ? "إنقلش عام" : sec === "step" ? "تجهيز STEP" : "إنقلش"}</span></a>
      ${NAV.map(n => `<a class="link ${isActive(n.href) ? "active" : ""}" href="${n.href}"><span class="ni">${I(n.icon)} </span>${n.label}</a>`).join("")}
      <span class="spacer"></span>${sw}
      ${me ? `<a class="user-chip" href="account.html">${avatarHtml(me.name, me.u)}<span>${esc(me.name)}</span></a>` : `<a class="btn btn-sm btn-primary login-btn" href="account.html">دخول</a>`}
      <button class="theme-btn" id="themeBtn" type="button" onclick="toggleTheme()" title="تبديل الوضع الداكن / الفاتح"></button>
      <button class="theme-btn sfx-btn" id="sfxBtn" type="button" onclick="toggleSfx()" title="الأصوات"></button>
      <button class="menu-btn" id="menuBtn" type="button" aria-label="القائمة" aria-expanded="false"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
    <div class="drawer" id="drawer" hidden><div class="container"><div class="drawer-grid">${NAV.map(n => `<a href="${n.href}" class="${isActive(n.href) ? "active" : ""}"><span class="ic">${I(n.icon)}</span><span>${n.label}</span></a>`).join("")}<a href="account.html" class="${cur === "account.html" ? "active" : ""}"><span class="ic">${me ? "<i data-i='user'></i>" : "<i data-i='lock'></i>"}</span><span>${me ? "حسابي" : "تسجيل الدخول"}</span></a>${info.other ? `<a href="${info.other}" class="sw"><span class="ic">${I(info.otherIcon)}</span><span>${info.otherLabel} ⇄</span></a>` : ""}</div></div></div>`;
    const mb = document.getElementById("menuBtn"), dr = document.getElementById("drawer");
    mb.addEventListener("click", () => { dr.hidden = !dr.hidden; mb.setAttribute("aria-expanded", String(!dr.hidden)); mb.classList.toggle("open", !dr.hidden); });
    dr.addEventListener("click", e => { if(e.target.closest("a")){ dr.hidden = true; mb.classList.remove("open"); } });
    document.addEventListener("click", e => { if(!dr.hidden && !host.contains(e.target)){ dr.hidden = true; mb.classList.remove("open"); } });
  }
  applyTheme(Store.get("step_theme", null) || "dark");
  if(!document.querySelector(".tabbar")){
    const tb = document.createElement("nav"); tb.className = "tabbar";
    tb.innerHTML = TABS.map(h => { const n = NAV.find(x => x.href === h) || (h === "index.html" ? { icon: "home", label: "البداية" } : { icon: me ? "user" : "lock", label: me ? "حسابي" : "دخول" }); return `<a href="${h}" class="${isActive(h) ? "active" : ""}"><span class="ic">${I(n.icon)}</span>${n.label}</a>`; }).join("");
    document.body.appendChild(tb);
  }
  const f = document.getElementById("footer");
  if(f) f.innerHTML = `<div class="container">STEP English — موقع عائلي لتعلّم الإنجليزية وتجهيز اختبار STEP. للاستخدام الشخصي.</div>`;
}

/* ---- small UI helpers ---- */
function toast(msg, ms = 2600){ const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); }
function confetti(){
  if(typeof SFX !== "undefined") SFX.win();
  const c = document.createElement("canvas"); c.id = "confetti"; document.body.appendChild(c);
  const ctx = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
  const colors = ["#e50914", "#f97316", "#fbbf24", "#ffffff", "#16a34a", "#0ea5e9"];
  const P = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .5, r: 4 + Math.random() * 6, vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4, col: colors[Math.floor(Math.random() * colors.length)], rot: Math.random() * 6, vr: -.2 + Math.random() * .4 }));
  const t0 = Date.now();
  (function frame(){
    ctx.clearRect(0, 0, c.width, c.height);
    for(const p of P){ p.x += p.vx; p.y += p.vy; p.rot += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .6); ctx.restore(); }
    if(Date.now() - t0 < 2800) requestAnimationFrame(frame); else c.remove();
  })();
}
/* ---- نقاط المنافسة: عرض نتيجة الحفظ (قاعدة: النقطة مرة واحدة لكل سؤال) ---- */
/* عرض النقاط بحركة: الرقم المكتسب "يطير" إلى المجموع والمجموع يعدّ لأعلى */
/* يشرح من أين جاءت كل نقطة في هذه الجولة */
function pointsExplain(j){
  const rows = [];
  if(j.base) rows.push(`<span class="px ok">${I("check")} ${j.base} ${j.base === 1 ? "إجابة جديدة" : "إجابات جديدة"} = +${j.base}</span>`);
  if(j.bonus) rows.push(`<span class="px bonus">${I(j.bonusSource === "gift" ? "gift" : "zap")} ${esc(j.bonusLabel || "مضاعف")} ×٢ = +${j.bonus}</span>`);
  if(j.stage) rows.push(`<span class="px stage">${I("trophy")} إتمام مرحلة = +${j.stage.points}</span>`);
  if(j.storyBonus) rows.push(`<span class="px stage">${I("bookopen")} إتمام قصة = +${j.storyBonus.points}</span>`);
  if(j.repeated) rows.push(`<span class="px muted">${I("repeat")} ${j.repeated} ${j.repeated === 1 ? "سؤال سبق أخذ نقطته" : "أسئلة سبق أخذ نقاطها"}${j.repeatedAt ? ` (آخرها ${fmtDate(j.repeatedAt)})` : ""} = 0</span>`);
  if(!j.bonus && j.base && typeof EVENTS !== "undefined" && EVENTS.status().active.some(a => a.id === "golden") && !String(location.hash).includes("golden")) rows.push(`<a class="px" href="general.html#/golden">${I("zap")} ×٢ في تحدي ساعة الذهب فقط ←</a>`);
  if(!j.base && j.repeated) rows.push(`<span class="px muted">${I("info")} أحسنت! بس هذي الأسئلة أخذت نقاطها من قبل — النقاط الجديدة تلقاها في دروس ووحدات ما خلصتها</span>`);
  if(!rows.length) rows.push(`<span class="px muted">ما فيه إجابات صحيحة جديدة هذه المرة</span>`);
  return rows.join("");
}
/* كم جمعت في الفعالية الجارية (لعرضه في الشريط أثناء ساعة الذهب) */
function trackEventGain(j){
  try{ const me = Auth.user(); if(!me || !j || !j.points || j.bonusSource !== "events" || typeof EVENTS === "undefined") return; const a = EVENTS.status().active[0]; if(!a) return; const k = `step_evgain_${a.id}_${a.startsAt}_${me.u}`; Store.set(k, (Number(Store.get(k, 0)) || 0) + j.points); }catch(e){}
}
function eventGain(a){ try{ const me = Auth.user(); return me && a ? Number(Store.get(`step_evgain_${a.id}_${a.startsAt}_${me.u}`, 0)) || 0 : 0; }catch(e){ return 0; } }
/* ملخص ساعة الذهب بعد انتهائها: تبريكات + كم ارتفع */
function showRecap(r, done){
  const m = r.me, pct = m.before > 0 ? Math.round(m.gained / m.before * 100) : null;
  const rankTxt = m.rankBefore && m.rankAfter ? (m.rankAfter < m.rankBefore ? `ترتيبك صعد من #${m.rankBefore} إلى <b>#${m.rankAfter}</b> ⬆️` : m.rankAfter === 1 ? `ثبّت الصدارة <b>#1</b> 👑` : `ترتيبك <b>#${m.rankAfter}</b>`) : m.rankAfter ? `ترتيبك <b>#${m.rankAfter}</b>` : "";
  const topOther = r.top.find(x => !x.me);
  const cheer = m.rankAfter === 1 && r.top[0] && r.top[0].me ? "أنت الأول والأكثر تجميعًا! حافظ عليها بكرة 👑" : r.top[0] && !r.top[0].me ? `${esc(r.top[0].name)} جمع +${r.top[0].gained} الليلة — بكرة دورك 💪` : "بكرة ساعة ذهب جديدة الساعة ٩ ⭐";
  modalCard(`<div class="gift-box live">${emo("party")}</div><h3>خلصت ${esc(r.title)}!</h3>
    <div class="gift-mult">+${m.gained} نقطة</div>
    <div class="recap-grid"><div><small>مجموعك</small><b>${m.before} ← ${m.after}</b>${pct != null ? `<span class="up">▲ ${pct}٪</span>` : ""}</div><div><small>أسئلة جديدة</small><b>${m.newQ}</b><span class="small muted">في ${m.rounds} ${m.rounds >= 3 && m.rounds <= 10 ? "جولات" : "جولة"}</span></div></div>
    ${rankTxt ? `<p style="margin:6px 0">${rankTxt}</p>` : ""}
    ${r.top.length > 1 ? `<div class="recap-top"><div class="small muted">الأكثر تجميعًا الليلة</div>${r.top.slice(0, 3).map((x, i) => `<div class="rt ${x.me ? "me" : ""}"><span>${["🥇", "🥈", "🥉"][i]} ${esc(x.name)}</span><b>+${x.gained}</b></div>`).join("")}</div>` : ""}
    <p class="small muted">${cheer}</p>
    <div class="btn-row" style="justify-content:center"><a class="btn btn-warm btn-lg" href="compete.html" data-close>${I("trophy")} شوف الترتيب</a><button type="button" class="btn" data-close>تمام</button></div>`, done);
  try{ if(typeof SFX !== "undefined") SFX.win(); confetti(); }catch(e){}
}
function pointsReveal(j, host){
  trackEventGain(j);
  if(!host) return;
  if(j.already){ host.innerHTML = `<div class="note warn" style="justify-content:center"><span class="ic">${I("info")}</span><p>سبق أن أنجزت هذا التحدي، فلم تُحسب هذه المحاولة.</p></div>`; hydrateIcons(host); return; }
  const gain = j.points || 0, total = j.totalPoints || 0, before = Math.max(0, total - gain);
  host.innerHTML = `<div class="pts-reveal ${gain ? "" : "zero"}">
      <div class="pts-gain" id="ptsGain">${gain ? "+" + gain : "0"}<small>نقطة</small>${gain && j.mult > 1 ? `<span class="pts-mult">×${j.mult}${j.gift ? " هدية" : ""}</span>` : ""}</div>
      <div class="pts-arrow">${I("arrow")}</div>
      <div class="pts-total" id="ptsTotal"><div class="pts-num" id="ptsNum">${before}</div><div class="small muted">مجموعك</div></div>
    </div>
    <div class="pts-explain">${pointsExplain(j)}</div>
    <p class="small muted pts-meta">${j.rank ? `ترتيبك العام <b>#${j.rank}</b>` : ""}${j.monthRank ? ` · البطولة <b>#${j.monthRank}</b>` : ""} · <a href="account.html#points">تفصيل نقاطي</a></p>`;
  hydrateIcons(host);
  if(!gain) return;
  if(typeof SFX !== "undefined") SFX.coin();
  const g = host.querySelector("#ptsGain"), n = host.querySelector("#ptsNum"), t = host.querySelector("#ptsTotal");
  setTimeout(() => g.classList.add("fly"), 650);
  setTimeout(() => {
    const t0 = performance.now(), dur = 900;
    const step = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); n.textContent = Math.round(before + (total - before) * e); if(p < 1) requestAnimationFrame(step); else { t.classList.add("bump"); g.classList.add("gone"); if(typeof SFX !== "undefined") SFX.correct(); } };
    requestAnimationFrame(step);
  }, 1050);
  /* ضمان الحالة النهائية حتى لو توقفت الحركة (تبويب في الخلفية) */
  setTimeout(() => { n.textContent = total; t.classList.add("bump"); g.classList.add("gone"); }, 2200);
}
function pointsHtml(j){
  if(j.already) return `<div class="note warn" style="justify-content:center"><span class="ic">${I("info")}</span><p>سبق أن أنجزت هذا التحدي، لذلك لم تُحسب هذه المحاولة.</p></div>`;
  const ev = j.mult > 1 && j.activeEvents && j.activeEvents.length ? ` <span class="badge accent">${I("zap")} ×${j.mult} ${esc(j.activeEvents[0].title)}</span>` : "";
  let html = j.points > 0 ? `<div class="points-pop">+${j.points} نقطة</div>${ev}` : `<span class="badge">لا نقاط جديدة في هذه الجولة</span>`;
  if(j.repeated > 0) html += `<p class="small muted" style="margin-top:6px">${j.repeated} ${j.repeated === 1 ? "سؤال سبق أن أخذت نقطته" : "أسئلة سبق أن أخذت نقاطها"} — النقطة تُحسب مرة واحدة لكل سؤال، فأعد الأسئلة التي أخطأت فيها لتكمل نقاطها.</p>`;
  html += `<p class="small muted" style="margin-top:8px">مجموعك: <b>${j.totalPoints}</b> نقطة${j.rank ? ` · ترتيبك العام <b>#${j.rank}</b>` : ""}${j.monthRank ? ` · البطولة <b>#${j.monthRank}</b>` : ""}</p>`;
  if(j.points > 0 && typeof SFX !== "undefined") SFX.coin();
  return html;
}
/* ---- شريط الفعاليات والبطولة (data/events.js) ---- */
function fmtLeft(ms){ const m = Math.max(0, Math.floor(ms / 60000)); const d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60; const ar = (n, one, two, few, many) => n === 1 ? one : n === 2 ? two : (n % 100 >= 3 && n % 100 <= 10) ? `${n} ${few}` : `${n} ${many}`; const DD = n => ar(n, "يوم", "يومين", "أيام", "يومًا"), HH = n => ar(n, "ساعة", "ساعتين", "ساعات", "ساعة"), MM = n => ar(n, "دقيقة", "دقيقتين", "دقائق", "دقيقة"); if(d > 0) return h > 0 ? `${DD(d)} و${HH(h)}` : DD(d); if(h > 0) return mm > 0 ? `${HH(h)} و${MM(mm)}` : HH(h); return MM(mm); }
/* هدية شخصية: تظهر مرة واحدة أول ما يدخل صاحبها */
/* بيانات النقاط من الخادم (مرة لكل صفحة) */
let PTS_CACHE = null;
function loadPoints(force){
  if(!Auth.user()) return Promise.resolve(null);
  if(PTS_CACHE && !force) return PTS_CACHE;
  PTS_CACHE = Auth.api("/api/points").then(j => { window.PTS = j; document.dispatchEvent(new CustomEvent("points:loaded", { detail: j })); return j; }).catch(() => null);
  return PTS_CACHE;
}
function modalCard(inner, onClose){
  const el = document.createElement("div"); el.className = "levelup gift-ov";
  el.innerHTML = `<div class="lu-card gift-card">${inner}</div>`;
  document.body.appendChild(el); hydrateIcons(el);
  const close = () => { el.remove(); if(onClose) onClose(); };
  el.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
  return el;
}
/* رسائل غير مقروءة: تعويض، جوائز معركة، هدية — واحدة تلو الأخرى */
async function giftCheck(){
  const j = await loadPoints(); if(!j) return;
  const queue = [];
  (j.notices || []).forEach(n => queue.push(() => new Promise(done => {
    const isComp = n.kind === "comp";
    modalCard(`<div class="gift-box ${isComp ? "comp" : ""}">${I(isComp ? "alert" : "trophy")}</div><h3>${esc(n.title)}</h3><p>${esc(n.msg)}</p>${n.points ? `<div class="gift-mult">+${n.points} نقطة</div>` : ""}${n.detail ? `<p class="small muted">${esc(n.detail)}</p>` : ""}<button type="button" class="btn btn-primary btn-lg" data-close>${I("check")} تمام</button>`,
      () => { Auth.api("/api/points", { method: "POST", body: { ack: n.id } }).catch(() => {}); done(); });
    try{ if(typeof SFX !== "undefined") SFX.win(); if(!isComp) confetti(); }catch(e){}
  })));
  const g = j.gift, me = Auth.user();
  if(g && me){
    const key = "step_gift_seen_" + g.id + "_" + me.u;
    if(!Store.get(key, false)) queue.push(() => new Promise(done => {
      modalCard(`<div class="gift-box">${I("gift")}</div><h3>${esc(g.title)}</h3><p>${esc(g.msg)}</p><div class="gift-mult">نقاط ×${g.mult}</div><p class="small muted">${g.pending ? "تبدأ مدتها مع أول تحدٍ تحلّينه" : "باقي " + fmtLeft(g.endsAt - Date.now())}</p><button type="button" class="btn btn-primary btn-lg" data-close>${I("sparkles")} تسلّمت الهدية</button>`,
        () => { Store.set(key, true); done(); });
      try{ if(typeof SFX !== "undefined") SFX.win(); confetti(); }catch(e){}
    }));
  }
  if(me){
    try{ const rc = await Auth.api("/api/points?recap=1"); const r = rc && rc.recap; const key = r && "step_recap_" + r.key + "_" + me.u;
      if(r && r.me && r.me.gained > 0 && !Store.get(key, false)) queue.push(() => new Promise(done => showRecap(r, () => { Store.set(key, true); done(); })));
    }catch(e){}
  }
  for(const show of queue) await show();
  await dailyCheck();
}
/* الحضور اليومي — بدون نقاط: شعلة تكبر، درع يحمي السلسلة، مفاجأة اليوم، ومين دخل من المشاركين */
const riyadhDay = () => { try{ return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" }); }catch(e){ return new Date().toISOString().slice(0, 10); } };
const FLAMES = [{ n: 1, t: "شرارة", e: "✨", k: "sparkles" }, { n: 3, t: "شعلة", e: "🔥", k: "fire" }, { n: 7, t: "نار", e: "☄️", k: "comet" }, { n: 14, t: "بركان", e: "🌋", k: "volcano" }, { n: 30, t: "أسطورة", e: "👑", k: "crown" }];
const flameOf = n => FLAMES.filter(f => n >= f.n).pop() || FLAMES[0];
const SURPRISES = [
  ["r", "What has keys but can't open locks?", "وش الشي اللي عنده مفاتيح بس ما يفتح ولا قفل؟", "A piano 🎹 — مفاتيح البيانو اسمها keys"],
  ["i", "It's raining cats and dogs", "حرفيًا: تمطر قطط وكلاب 🐱🐶", "معناها: تمطر بغزارة"],
  ["t", "She sells seashells by the seashore.", "قلها ٣ مرات بسرعة بدون ما تتلخبط"],
  ["w", "Hangry", "جوعان لدرجة إنك معصّب 😤 (hungry + angry)"],
  ["f", "كلمات إنجليزية أصلها عربي: algebra (الجبر)، coffee (قهوة)، sugar (سكّر)، cotton (قطن)، giraffe (زرافة)."],
  ["r", "What gets wetter the more it dries?", "وش الشي اللي كل ما نشّف غيره تبلل أكثر؟", "A towel — المنشفة"],
  ["i", "Break a leg!", "حرفيًا: اكسر رجلك!", "معناها: بالتوفيق — يقولونها قبل عرض أو اختبار"],
  ["t", "Red lorry, yellow lorry.", "قلها ٥ مرات ورا بعض بسرعة"],
  ["w", "Bookworm", "دودة كتب 🐛📚 = الشخص اللي يحب القراءة"],
  ["f", "جملة «The quick brown fox jumps over the lazy dog» فيها كل حروف الإنجليزي الـ26!"],
  ["r", "What has hands but can't clap?", "وش اللي له أيدين وما يقدر يصفّق؟", "A clock ⏰ — عقارب الساعة اسمها hands"],
  ["i", "A piece of cake", "حرفيًا: قطعة كيك 🍰", "معناها: سهلة مرّة"],
  ["t", "Six sticky skeletons.", "قلها بسرعة ٣ مرات — أصعب مما تتوقع!"],
  ["w", "Couch potato", "بطاطس الكنبة 🥔 = اللي يقضي يومه قدام التلفزيون"],
  ["f", "أكثر حرف يتكرر في الإنجليزي هو E، ومن أقلها Q."],
  ["r", "What can you catch but not throw?", "وش الشي اللي «تمسكه» وما تقدر ترميه؟", "A cold 🤧 — catch a cold = يجيك زكام"],
  ["i", "Hit the books", "حرفيًا: اضرب الكتب 📚", "معناها: ذاكر بجد"],
  ["t", "Peter Piper picked a peck of pickled peppers.", "تحدَّ نفسك: مرتين بدون غلط"],
  ["w", "Butterfingers", "أصابع زبدة 🧈 = اللي كل شي يطيح من يده"],
  ["f", "كلمة SWIMS تنقرأ نفس الشي لو قلبت الشاشة راس على عقب 🙃"],
  ["r", "What goes up but never comes down?", "وش اللي يطلع وما ينزل أبدًا؟", "Your age 🎂 — عمرك"],
  ["i", "Under the weather", "حرفيًا: تحت الطقس ☁️", "معناها: تعبان شوي"],
  ["t", "Fresh French fried fish.", "قلها ٤ مرات بسرعة"],
  ["w", "Brunch", "breakfast + lunch = وجبة بين الفطور والغدا 🥞"],
  ["f", "كلمة queue (طابور) تنطق مثل حرف Q بس، والحروف ueue بعده كلها صامتة!"],
  ["r", "What has a neck but no head?", "وش اللي له رقبة وما له راس؟", "A bottle 🍾 — عنق القارورة"],
  ["i", "Spill the beans", "حرفيًا: كبّ الفول 🫘", "معناها: فضح السر"],
  ["t", "How can a clam cram in a clean cream can?", "جرّبها بصوت عالي وشوف كم مرة تتلخبط"],
  ["w", "Selfie", "صورة تاخذها لنفسك 🤳"],
  ["f", "كلمة Go! لحالها جملة كاملة: فعل أمر والفاعل (you) مفهوم."],
  ["r", "Which building has the most stories?", "أي مبنى فيه أكثر stories؟", "The library 📚 — story = قصة، و storey = طابق وتنطق نفسها!"],
  ["i", "Once in a blue moon", "حرفيًا: مرة كل قمر أزرق 🌙", "معناها: نادرًا جدًا"],
  ["i", "Cost an arm and a leg", "حرفيًا: كلّف ذراع ورجل 💸", "معناها: غالي مرّة"],
  ["r", "What has many teeth but can't bite?", "وش اللي له أسنان كثير وما يعض؟", "A comb — المشط"],
  ["i", "The ball is in your court", "حرفيًا: الكورة في ملعبك 🎾", "معناها: القرار صار عندك"],
  ["i", "Call it a day", "حرفيًا: سمّها يوم", "معناها: خلاص نوقف الشغل لليوم"]
];
function surpriseOf(day){
  const n = Math.floor(Date.parse(day + "T00:00:00Z") / 864e5) || 0;
  return SURPRISES[((n % SURPRISES.length) + SURPRISES.length) % SURPRISES.length];
}
function surpriseHtml(x){
  const say = t => `<button type="button" class="btn btn-sm sp-say" data-say="${esc(t)}">${I("volume")} اسمعها</button>`;
  if(x[0] === "r") return `<div class="sp-kind">لغز اليوم 🧩</div><div class="en sp-en">${esc(x[1])}</div><div class="small">${esc(x[2])}</div><button type="button" class="btn btn-sm sp-ans">اكشف الجواب</button><div class="sp-hidden" hidden>${esc(x[3])}</div>`;
  if(x[0] === "i") return `<div class="sp-kind">عبارة غريبة 🤔</div><div class="en sp-en">${esc(x[1])}</div><div class="small">${esc(x[2])}</div><button type="button" class="btn btn-sm sp-ans">وش معناها؟</button><div class="sp-hidden" hidden>${esc(x[3])}</div>`;
  if(x[0] === "t") return `<div class="sp-kind">تحدي اللسان 👅</div><div class="en sp-en">${esc(x[1])}</div><div class="small">${esc(x[2])}</div>${say(x[1])}`;
  if(x[0] === "w") return `<div class="sp-kind">كلمة ظريفة 😄</div><div class="en sp-en">${esc(x[1])}</div><div class="small">${esc(x[2])}</div>${say(x[1])}`;
  return `<div class="sp-kind">تعرف؟ 💡</div><p>${esc(x[1])}</p>`;
}
async function dailyCheck(){
  const me = Auth.user(); if(!me) return;
  const key = "step_daily_" + me.u, day = riyadhDay();
  if(Store.get(key, "") === day) return;
  let j; try{ j = await Auth.api("/api/points", { method: "POST", body: { daily: 1 } }); }catch(e){ return; }
  if(!j || j.error) return;
  Store.set(key, day); Store.set("step_daily_last_" + me.u, Object.assign({}, j, { day }));
  document.dispatchEvent(new Event("points:loaded"));
  if(j.claimed) showDaily(j, day);
}
function showDaily(j, day){
  const fl = flameOf(j.streak), nxt = FLAMES.find(f => f.n > j.streak);
  const cyc = ((Math.max(1, j.streak) - 1) % 7) + 1;
  const strip = Array.from({ length: 7 }, (_, i) => `<div class="dd ${i < cyc ? "done" : ""} ${i === cyc - 1 ? "now" : ""}"><span>${i < cyc ? "🔥" : "·"}</span><small>${i === 6 ? "🛡️" : i + 1}</small></div>`).join("");
  const title = j.broke ? "بدأت شعلة جديدة!" : j.streak > 1 ? `${j.streak} ${j.streak > 10 ? "يوم" : "أيام"} ورا بعض!` : "أول يوم في سلسلتك!";
  const F = j.family || { today: [], waiting: [] };
  const chip = r => `<span class="fam ${r.me ? "me" : ""}">${esc(r.name)} ${r.streak >= 2 ? "🔥" + r.streak : "✨"}</span>`;
  const others = (F.waiting || []).filter(r => !r.me);
  const wa = others.length ? `https://wa.me/?text=${encodeURIComponent(`${others.map(r => r.name).join(" و")} 🔥 شعلتكم بتنطفي! ادخلوا قبل نهاية اليوم 😄 ${location.origin}`)}` : "";
  const note = !j.claimed ? "" : j.usedShield ? `<div class="note info"><span class="ic">${I("check")}</span><p>🛡️ الدرع حمى سلسلتك — فاتك يوم وما انطفت الشعلة!</p></div>`
    : j.gotShield ? `<div class="note tip"><span class="ic">${I("sparkles")}</span><p>🛡️ كسبت درع! لو فاتك يوم، الدرع يحمي شعلتك.</p></div>`
    : j.broke ? `<p class="small muted">انطفت شعلة الـ${j.lost} أيام… بس هذي فرصة تكسر رقمك 💪</p>` : "";
  const el = modalCard(`<div class="flame-big" style="--s:${Math.min(1.5, 1 + j.streak / 30)}">${emo(fl.k)}<b>${j.streak}</b></div>
    <h3 style="margin:.2em 0">${title}</h3>
    <div class="small">مستواك: <b>${fl.t}</b>${nxt ? ` · باقي ${nxt.n - j.streak} ${nxt.n - j.streak === 1 ? "يوم" : "أيام"} وتصير «${nxt.t}» ${nxt.e}` : ""}</div>
    <div class="daily-days">${strip}</div>
    <div class="small muted">${j.shields ? "🛡️".repeat(j.shields) + " درع يحمي شعلتك" : "كل ٧ أيام ورا بعض تكسب درع 🛡️"}${j.best > j.streak ? ` · أطول سلسلة لك: ${j.best}` : ""}</div>
    ${note}
    <div class="surprise" tabindex="0" role="button"><div class="sp-front">${emo("gift", "emo-lg")}<b>اضغط وافتح مفاجأة اليوم</b></div><div class="sp-back" hidden>${surpriseHtml(surpriseOf(day))}</div></div>
    ${F.today && F.today.length ? `<div class="fam-box"><div class="small"><b>دخلوا اليوم:</b></div>${F.today.map(chip).join("")}</div>` : ""}
    ${others.length ? `<div class="fam-box warn"><div class="small"><b>شعلتهم بتنطفي اليوم:</b></div>${others.map(chip).join("")}<a class="btn btn-sm" target="_blank" rel="noopener" href="${wa}">ذكّرهم 📲</a></div>` : ""}
    ${!Store.get("step_push_on", false) ? `<a class="push-nudge" href="account.html#notif">${emo("bell")} تبي نذكّرك قبل ما تنطفي شعلتك؟ <b>فعّل الإشعارات</b></a>` : ""}
    <div class="btn-row" style="justify-content:center"><a class="btn btn-warm btn-lg" href="general.html#/next" data-close>${I("zap")} يلا نكمل</a><button type="button" class="btn" data-close>لاحقًا</button></div>`);
  const sp = el.querySelector(".surprise");
  const open = () => { if(sp.classList.contains("open")) return; sp.classList.add("open"); sp.querySelector(".sp-front").hidden = true; sp.querySelector(".sp-back").hidden = false; try{ if(typeof SFX !== "undefined") SFX.win(); }catch(e){} };
  sp.addEventListener("click", e => {
    open();
    const ans = e.target.closest(".sp-ans"); if(ans){ ans.hidden = true; sp.querySelector(".sp-hidden").hidden = false; }
    const s2 = e.target.closest(".sp-say"); if(s2 && window.speechSynthesis){ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(s2.dataset.say); u.lang = "en-US"; u.rate = .9; speechSynthesis.speak(u); }
  });
  sp.addEventListener("keydown", e => { if(e.key === "Enter") open(); });
  try{ if(j.claimed){ if(typeof SFX !== "undefined") SFX.win(); if(j.streak > 1) confetti(); } }catch(e){}
}
/* إعلان بداية فعالية أو قرب موعدها — مرة واحدة لكل موعد */
function announce(kind, id, start, title, body, href, btn){
  const key = `step_ann_${kind}_${id}_${start}`;
  if(Store.get(key, false)) return;
  Store.set(key, true);
  if(kind === "soon"){ toast(`${title} — ${body}`, 6000); try{ if(typeof SFX !== "undefined") SFX.tick(); }catch(e){} return; }
  modalCard(`<div class="gift-box live">${I("zap")}</div><h3>${esc(title)}</h3><p>${esc(body)}</p><div class="btn-row" style="justify-content:center">${href ? `<a class="btn btn-warm btn-lg" href="${href}" data-close>${esc(btn || "يلا")}</a>` : ""}<button type="button" class="btn" data-close>لاحقًا</button></div>`);
  try{ if(typeof SFX !== "undefined") SFX.win(); }catch(e){}
}
function eventAnnouncements(s){
  if(!Store.get("step_ann_ready", false)){ Store.set("step_ann_ready", true); } // لا نزعج بإعلانات قديمة عند أول زيارة
  const now = s.now;
  s.active.forEach(ev => announce("start", ev.id, ev.startsAt, `بدأت ${ev.title}!`, `${ev.desc}. تنتهي بعد ${fmtLeft(ev.endsAt - now)}.`, ev.id === "golden" ? "general.html#/golden" : "general.html#/", ev.id === "golden" ? "ابدأ التحدي" : "ابدأ أجمع نقاط"));
  (s.upcoming || []).forEach(ev => { if(ev.startsAt - now <= 30 * 60000) announce("soon", ev.id, ev.startsAt, `${ev.title} بعد ${fmtLeft(ev.startsAt - now)}`, ev.desc); });
  const B = s.battle;
  if(B && B.active) announce("start", B.id, B.active.start, `بدأت ${B.title}!`, `${B.desc} تنتهي بعد ${fmtLeft(B.active.end - now)}.`, "general.html#/battle", "ادخل المعركة");
  else if(B && B.next && B.next.start - now <= 60 * 60000) announce("soon", B.id, B.next.start, `${B.title} بعد ${fmtLeft(B.next.start - now)}`, "جهّز نفسك: ٦٠ ثانية ونفس الكلمات للجميع");
}
function renderEventsBar(){
  const host = document.getElementById("eventsBar"); if(!host || typeof EVENTS === "undefined") return;
  const full = host.dataset.full === "1";
  const draw = () => {
    const s = EVENTS.status(), T = s.tournament, act = s.active[0], B = s.battle;
    try{ eventAnnouncements(s); }catch(e){}
    const gf = window.PTS && window.PTS.gift && !window.PTS.gift.pending ? window.PTS.gift : null;
    if(!full){ /* سطر واحد رفيع حتى لا يزاحم محتوى الصفحة */
      const cp = curPage(), hh = location.hash.replace(/^#\/?/, "");
      const isHome = ["index.html", "step.html"].includes(cp) || ((cp === "general.html" || cp === "library.html") && !hh);
      if(!isHome && !(B && B.active) && !act && !gf){ host.innerHTML = ""; return; }
      const bits = [];
      if(B && B.active) bits.push(`<span class="ev-bit hot">${I("swords")} ${esc(B.title)} الآن!</span>`);
      else if(act){ const g = eventGain(act); bits.push(`<span class="ev-bit hot">${I("zap")} ${esc(act.title)}: ×${s.mult} · ${fmtLeft(act.endsAt - s.now)}${g ? ` · جمعت +${g}` : ""}</span>`); }
      else if(s.next && s.next.startsAt - s.now < 6 * 3600e3) bits.push(`<span class="ev-bit">${I("clock")} ${esc(s.next.title)} بعد ${fmtLeft(s.next.startsAt - s.now)}</span>`);
      else if(B && B.next) bits.push(`<span class="ev-bit">${I("swords")} ${esc(B.title)} بعد ${fmtLeft(B.next.start - s.now)}</span>`);
      if(gf) bits.push(`<span class="ev-bit gift">${I("gift")} هديتك ×${gf.mult} · ${fmtLeft(gf.endsAt - s.now)}</span>`);
      if(!T.ended) bits.push(`<span class="ev-bit tour">${I("trophy")} ${esc(T.prize)}</span>`);
      const href = B && B.active ? "general.html#/battle" : act && act.id === "golden" ? "general.html#/golden" : "compete.html#tournament";
      const meU = Auth.user(), dl = meU ? Store.get("step_daily_last_" + meU.u, null) : null;
      const flameBtn = dl && dl.day === riyadhDay() && dl.streak ? `<button type="button" class="ev-flame" title="سلسلة الأيام">${emo(flameOf(dl.streak).k)} ${dl.streak}</button>` : "";
      host.innerHTML = (flameBtn || bits.length) ? `<div class="ev-wrap">${flameBtn}${bits.length ? `<a class="ev-strip" href="${href}">${bits.join("")}<span class="ev-go">${I("arrow")}</span></a>` : ""}</div>` : "";
      const fb = host.querySelector(".ev-flame"); if(fb) fb.addEventListener("click", () => showDaily(Object.assign({}, dl, { claimed: false }), dl.day));
      hydrateIcons(host); return;
    }
    const tHtml = T.ended ? "" : `<a class="ev-card tour" href="compete.html#tournament"><span class="ev-ic">${I("trophy")}</span><div><b>${esc(T.title)} — ${esc(T.prize)}</b><div class="small">${T.upcoming ? "تبدأ بعد " + fmtLeft(T.startsAt - s.now) : "المركز الأول في ترتيب الشهر يفوز · تنتهي بعد " + fmtLeft(T.endsAt - s.now)}</div></div><span class="ev-go">${I("arrow")}</span></a>`;
    const eHtml = act ? `<a class="ev-card live" href="general.html#/golden"><span class="ev-ic">${emo("clock")}</span><div><b>×${s.mult} نقاط الآن — ${esc(act.title)}</b><div class="small">${esc(act.desc)} · تنتهي بعد ${fmtLeft(act.endsAt - s.now)}</div></div></a>`
      : s.next ? `<div class="ev-card next"><span class="ev-ic">${emo("clock")}</span><div><b>القادم: ${esc(s.next.title)} ×${s.next.mult}</b><div class="small">${esc(s.next.desc)} · بعد ${fmtLeft(s.next.startsAt - s.now)}</div></div></div>` : "";
    const gHtml = gf ? `<div class="ev-card gift"><span class="ev-ic">${emo("gift")}</span><div><b>${esc(gf.title)} — نقاط ×${gf.mult}</b><div class="small">باقي ${fmtLeft(gf.endsAt - s.now)}</div></div></div>` : "";
    const bHtml = B ? `<a class="ev-card ${B.active ? "live" : "next"}" href="general.html#/battle"><span class="ev-ic">${emo("swords")}</span><div><b>${esc(B.title)}${B.active ? " — قائمة الآن!" : ""}</b><div class="small">${B.active ? "تنتهي بعد " + fmtLeft(B.active.end - s.now) : B.next ? "تبدأ بعد " + fmtLeft(B.next.start - s.now) : ""} · الجوائز +${B.prizes.join(" / +")}</div></div><span class="ev-go">${I("arrow")}</span></a>` : "";
    host.innerHTML = `<div class="ev-cards">${gHtml + bHtml + eHtml}</div>`; hydrateIcons(host);
  };
  draw(); setInterval(draw, 20000);
  document.addEventListener("points:loaded", draw);
  window.addEventListener("hashchange", draw);
}
function recordAnswer(id, correct){ if(typeof Progress !== "undefined") Progress.record(id, correct); }
const fmtDate = t => new Date(t).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }) + " " + new Date(t).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
function masteryClass(p){ return p < 40 ? "m-low" : p < 70 ? "m-mid" : "m-high"; }
function lbRow(r, showSub){
  const medal = r.rank <= 3 ? I("medal", "medal-" + r.rank) : r.rank;
  return `<div class="lb-row ${r.me ? "me" : ""} ${r.rank <= 3 ? "top" + r.rank : ""}" data-log="${esc(r.u || "")}" title="اضغط لعرض سجل النقاط" role="button" tabindex="0">
    <div class="rk ${r.rank <= 3 ? "medal" : ""}">${medal}</div>${avatarHtml(r.name, r.u)}
    <div class="nm">${esc(r.name)}${r.streak >= 2 ? ` <span class="lb-flame" title="${r.streak} أيام ورا بعض">${flameOf(r.streak).e}${r.streak}</span>` : ""}${showSub ? `<div class="sub">${r.quizzes || 0} اختبار · دقة ${r.avg || 0}٪${r.best ? " · أفضل نتيجة " + r.best + "٪" : ""}</div>` : ""}</div>
    <div class="pt">${r.points} نقطة</div></div>`;
}

/* ---- mini quiz inside grammar lessons ---- */
function renderMiniQuizzes(){
  if(typeof QUESTIONS === "undefined") return;
  document.querySelectorAll(".mini[data-topic]").forEach(box => {
    const topic = box.dataset.topic, n = parseInt(box.dataset.n || "3", 10);
    const pool = QUESTIONS.filter(q => q.topic === topic);
    const draw = () => {
      const qs = sample(pool, Math.min(n, pool.length));
      box.innerHTML = `<h4><i data-i='pencil'></i> تدريب سريع <span class="badge">${pool.length} سؤال في هذا الموضوع</span></h4>` +
        qs.map((q, i) => `<div class="mq" data-id="${q.id}"><div class="qt en">${i + 1}. ${q.q}</div><div class="opts">${q.opts.map((o, k) => `<button type="button" data-k="${k}">${esc(o)}</button>`).join("")}</div><div class="exp" hidden></div></div>`).join("") +
        `<div class="btn-row"><button type="button" class="btn btn-sm" data-redraw><i data-i='refresh'></i> أسئلة أخرى</button> <a class="btn btn-sm" href="train.html?topic=${topic}&start=1"><i data-i='target'></i> تدريب على هذا الموضوع</a> <a class="btn btn-sm" href="quiz.html?topic=${topic}"><i data-i='pencil'></i> اختبار</a></div>`;
      box.querySelectorAll(".mq").forEach(mq => {
        const q = pool.find(x => x.id === mq.dataset.id);
        mq.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
          const k = +btn.dataset.k;
          mq.querySelectorAll("button").forEach(b => { b.disabled = true; if(+b.dataset.k === q.a) b.classList.add("ok"); });
          if(k !== q.a) btn.classList.add("bad");
          const exp = mq.querySelector(".exp"); exp.hidden = false;
          exp.innerHTML = (k === q.a ? "<i data-i='check'></i> صحيح. " : "<i data-i='x'></i> خطأ. ") + esc(q.ex);
          recordAnswer(q.id, k === q.a);
        }));
      });
      box.querySelector("[data-redraw]").addEventListener("click", draw);
    };
    draw();
  });
}

/* ---- TOC active highlight ---- */
function initToc(){
  const links = [...document.querySelectorAll(".toc a[href^='#']")];
  if(!links.length) return;
  const secs = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id)); }); }, { rootMargin: "-20% 0px -70% 0px" });
  secs.forEach(s => obs.observe(s));
}

/* ---- reading page passages ---- */
function renderPassages(hostId){
  const host = document.getElementById(hostId);
  if(!host || typeof PASSAGES === "undefined") return;
  host.innerHTML = PASSAGES.map((p, pi) => `<article class="passage" id="${p.id}">
    <div class="section-title"><span class="badge teal">قطعة ${pi + 1}</span><h3 class="en" style="margin:0">${esc(p.title)}</h3><span class="muted">— ${esc(p.ar)}</span></div>
    ${p.note ? `<div class="note info"><span class="ic"><i data-i='chat'></i></span><p>${esc(p.note)}</p></div>` : ""}
    <div class="ptext">${esc(p.text)}</div>
    ${p.qs.map((q, qi) => `<div class="pq" data-p="${pi}" data-q="${qi}"><div class="qt">${qi + 1}. ${esc(q.q)}</div><div class="opts">${q.opts.map((o, k) => `<button type="button" data-k="${k}">${LETTERS[k]}) ${esc(o)}</button>`).join("")}</div><div class="exp" hidden></div></div>`).join("")}
  </article>`).join("");
  host.querySelectorAll(".pq").forEach(el => {
    const q = PASSAGES[+el.dataset.p].qs[+el.dataset.q]; const id = PASSAGES[+el.dataset.p].id + "-" + el.dataset.q;
    el.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
      const k = +btn.dataset.k;
      el.querySelectorAll("button").forEach(b => { b.disabled = true; if(+b.dataset.k === q.a) b.classList.add("ok"); });
      if(k !== q.a) btn.classList.add("bad");
      const exp = el.querySelector(".exp"); exp.hidden = false;
      exp.innerHTML = (k === q.a ? "<i data-i='check'></i> صحيح. " : "<i data-i='x'></i> خطأ. ") + esc(q.ex);
      recordAnswer(id, k === q.a);
    }));
  });
}

/* ---- home page widgets ---- */
function renderHomeStats(){
  const el = document.getElementById("homeStats");
  if(!el || typeof Progress === "undefined") return;
  const o = Progress.overall(), hist = Store.get("step_history", []), last = hist[hist.length - 1], streak = Progress.streak();
  el.innerHTML = `
    <div class="card stat"><span class="ic">${I("target")}</span><span class="num">${o.pct}٪</span><span class="lbl">إتقانك الكلي (${o.seen} من ${o.total} سؤال)</span></div>
    <div class="card stat"><span class="ic">${I("fire")}</span><span class="num">${streak}</span><span class="lbl">${streak === 1 ? "يوم متتالٍ" : "أيام متتالية"} من المذاكرة</span></div>
    <div class="card stat"><span class="ic">${I("check")}</span><span class="num">${o.answered}</span><span class="lbl">إجابة (دقة ${o.acc}٪)</span></div>
    <div class="card stat"><span class="ic">${I("pencil")}</span><span class="num">${last ? Math.round(last.score / last.total * 100) + "٪" : "—"}</span><span class="lbl">${last ? "آخر اختبار (" + last.score + "/" + last.total + ")" : "لم تختبر بعد"}</span></div>`;
  const weak = document.getElementById("homeWeak");
  if(weak){
    const ws = Progress.weakTopics(3).slice(0, 4);
    weak.innerHTML = ws.length ? ws.map(m => `<div class="mastery-row"><div>${Bank.topicLabel(m.t)} <span class="muted small">(${m.seen}/${m.total})</span> ${lessonLink(m.t)}</div><div class="pct">${m.pct}٪</div><div class="bar"><div class="${masteryClass(m.pct)}" style="width:${m.pct}%"></div></div></div>`).join("") + `<div class="btn-row" style="margin-top:12px"><a class="btn btn-primary btn-sm" href="train.html?mode=weak&start=1">${I("target")} تدرّب على نقاط ضعفك</a><a class="btn btn-sm" href="account.html#weak">كل نقاط ضعفك</a></div>`
      : `<p class="muted">أجب على بعض الأسئلة أولًا ليتعرف النظام على نقاط ضعفك.</p><a class="btn btn-primary btn-sm" href="train.html?mode=smart&start=1">ابدأ التدريب الذكي ←</a>`;
  }
}
async function renderHomeBoard(){
  const el = document.getElementById("homeBoard");
  if(!el) return;
  try{
    const j = await Auth.api("/api/leaderboard");
    el.innerHTML = j.total.length ? `<div class="lb">${j.total.slice(0, 5).map(r => lbRow(r, false)).join("")}</div><div class="btn-row" style="margin-top:12px"><a class="btn btn-sm" href="compete.html">الترتيب الكامل والتحديات ←</a></div>`
      : `<p class="muted">لا يوجد متنافسون بعد. كن أول من يسجّل نقاطًا!</p><a class="btn btn-warm btn-sm" href="${Auth.user() ? "quiz.html" : "account.html"}">${Auth.user() ? "ابدأ اختبارًا" : "سجّل حسابك"} ←</a>`;
  }catch(e){
    el.innerHTML = `<p class="muted small">${esc(e.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav(); hydrateIcons();
  renderMiniQuizzes();
  initToc();
  focusLessonFromHash();
  window.addEventListener("hashchange", refreshNavActive);
  window.addEventListener("hashchange", () => { document.querySelectorAll(".lesson.focus").forEach(e => e.classList.remove("focus")); document.querySelectorAll(".lesson-back").forEach(e => e.remove()); focusLessonFromHash(); });
  renderHomeStats();
  renderHomeBoard();
  /* الصفحة الأولى: زر «كمّل من حيث وقفت» للي رجع */
  (() => {
    const hero = document.querySelector(".landing-hero"); if(!hero) return;
    const last = Store.get("step_section", null); if(!last) return;
    const gen = last === "gen";
    hero.insertAdjacentHTML("beforeend", `<div class="actions" style="margin-top:14px"><a class="btn btn-light btn-lg continue-btn" href="${gen ? "general.html#/next" : "step.html"}">${I("zap")} كمّل ${gen ? "الإنجليزي" : "STEP"} من حيث وقفت</a></div>`);
  })();
  renderEventsBar();
  try{ renderNotifNudge(); }catch(e){}
  giftCheck();
  if(typeof Push !== "undefined") Push.refresh();
  setTimeout(() => Pending.flush(), 2500);
  if(typeof Progress !== "undefined" && Auth.user()) Progress.sync(false).then(ok => { if(ok) renderHomeStats(); });
});
