/* ===== تقييم النطق: استماع أطول بدون قطع + مطابقة مرنة للكلمات =====
   - يسمع لين تسكت ثانيتين تقريبًا (أو تضغط إيقاف) بدل ما يقطع عند أول وقفة
   - يقبل: الأرقام (4 = four)، الكلمات المتشابهة صوتًا (two/too/to)، الاختصارات (I'm = I am)،
     واختلاف حرف أو حرفين (color/colour, thank/thanks)
   - الكلمات الصغيرة (a, the, to…) وزنها نص، لأن جهاز التعرف كثير يسقطها حتى لو قلتها
   - الكلمات اللي تنطقها صح تبقى محسوبة بين المحاولات: تقدر تعيد الكلمات الناقصة بس */
(function(root, factory){
  const api = factory();
  if(typeof module === "object" && module.exports) module.exports = api; else root.Speech = api;
})(typeof self !== "undefined" ? self : this, function(){
  const CONTR = { "i'm": "i am", "it's": "it is", "what's": "what is", "that's": "that is", "there's": "there is", "here's": "here is", "where's": "where is", "who's": "who is", "how's": "how is", "he's": "he is", "she's": "she is", "let's": "let us", "i'll": "i will", "you'll": "you will", "we'll": "we will", "they'll": "they will", "he'll": "he will", "she'll": "she will", "it'll": "it will", "i'd": "i would", "you'd": "you would", "we'd": "we would", "they'd": "they would", "he'd": "he would", "she'd": "she would", "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have", "you're": "you are", "we're": "we are", "they're": "they are", "don't": "do not", "doesn't": "does not", "didn't": "did not", "can't": "can not", "cannot": "can not", "won't": "will not", "isn't": "is not", "aren't": "are not", "wasn't": "was not", "weren't": "were not", "haven't": "have not", "hasn't": "has not", "hadn't": "had not", "couldn't": "could not", "wouldn't": "would not", "shouldn't": "should not", "mustn't": "must not", "gonna": "going to", "wanna": "want to", "gotta": "got to" };
  const HOMO = {};
  [["to", "too", "two"], ["for", "four", "fore"], ["there", "their"], ["your", "yours"], ["here", "hear"], ["right", "write"], ["see", "sea"], ["by", "buy", "bye"], ["no", "know"], ["one", "won"], ["new", "knew"], ["meet", "meat"], ["wait", "weight"], ["week", "weak"], ["hour", "our"], ["son", "sun"], ["i", "eye"], ["be", "bee"], ["where", "wear", "ware"], ["ok", "okay"], ["mr", "mister"], ["mrs", "missus"], ["dr", "doctor"], ["hi", "high"], ["whole", "hole"], ["peace", "piece"], ["flour", "flower"], ["mail", "male"], ["sale", "sail"], ["plane", "plain"], ["tail", "tale"], ["cent", "sent", "scent"], ["red", "read"], ["pair", "pear"], ["break", "brake"], ["steal", "steel"], ["allowed", "aloud"], ["weather", "whether"], ["alright", "allright"], ["till", "until"], ["cause", "because"]].forEach(g => g.forEach(w => { HOMO[w] = g[0]; }));
  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function numWords(n){
    n = Number(n);
    if(!isFinite(n) || n < 0) return String(n);
    if(n < 20) return ONES[n];
    if(n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
    if(n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + numWords(n % 100) : "");
    if(n >= 1900 && n < 2100) return numWords(Math.floor(n / 100)) + (n % 100 ? " " + numWords(n % 100) : " hundred");
    if(n < 1e6) return numWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + numWords(n % 1000) : "");
    return String(n);
  }
  const ORD = { "1st": "first", "2nd": "second", "3rd": "third", "4th": "fourth", "5th": "fifth", "6th": "sixth", "7th": "seventh", "8th": "eighth", "9th": "ninth", "10th": "tenth", "11th": "eleventh", "12th": "twelfth", "20th": "twentieth", "21st": "twenty first", "30th": "thirtieth" };
  /* يحوّل كلمة أصلية إلى كلمات مقارنة (قد تكون أكثر من كلمة: I'm → i am، 9:30 → nine thirty) */
  function wordTokens(w){
    let s = String(w).toLowerCase().replace(/[’‘`]/g, "'");
    s = s.replace(/(\d+):(\d\d)/g, (_, h, m) => numWords(h) + (m === "00" ? "" : " " + (m[0] === "0" ? "oh " + numWords(m[1]) : numWords(m))));
    s = s.replace(/\$(\d+)/g, (_, n) => numWords(n) + " dollars").replace(/(\d+)%/g, (_, n) => numWords(n) + " percent").replace(/&/g, " and ");
    s = s.replace(/\b(\d+(?:st|nd|rd|th))\b/g, m => ORD[m] || m);
    s = s.replace(/(\d+)(am|pm)\b/g, "$1 $2").replace(/\b(a|p)\.m\.?/g, "$1m");
    const out = [];
    s.replace(/[^a-z0-9' -]+/g, " ").split(/[\s-]+/).forEach(t => {
      t = t.replace(/^'+|'+$/g, ""); if(!t) return;
      if(CONTR[t]){ out.push(...CONTR[t].split(" ")); return; }
      if(/^\d+$/.test(t)){ out.push(...numWords(t).split(" ")); return; }
      t = t.replace(/'s$/, "s").replace(/'/g, "");
      if(t) out.push(HOMO[t] || t);
    });
    return out;
  }
  function tokens(text){ return String(text).split(/\s+/).flatMap(wordTokens); }
  /* مفتاح صوتي مبسّط: يقرّب الكلمات اللي تنطق متقاربة */
  function phon(w){
    let s = w.replace(/[^a-z]/g, "");
    if(!s) return w;
    s = s.replace(/^kn/, "n").replace(/^wr/, "r").replace(/^wh/, "w").replace(/ph/g, "f").replace(/ck/g, "k").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k").replace(/q/g, "k").replace(/x/g, "ks").replace(/z/g, "s").replace(/dg/g, "j").replace(/tch/g, "ch").replace(/gh(?![aeiou])/g, "").replace(/(.)\1+/g, "$1");
    return s[0] + s.slice(1).replace(/[aeiouy]+/g, "").replace(/e$/, "");
  }
  function lev(a, b){
    if(a === b) return 0;
    const m = a.length, n = b.length; if(!m) return n; if(!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for(let i = 1; i <= m; i++){
      const cur = [i];
      for(let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  function same(a, b){
    if(a === b) return true;
    const L = Math.max(a.length, b.length), S = Math.min(a.length, b.length);
    if(S >= 3 && phon(a) === phon(b)) return true;
    if(S >= 4 && lev(a, b) <= (L >= 8 ? 2 : 1)) return true;
    if(S >= 3 && (a + "s" === b || b + "s" === a || a + "es" === b || b + "es" === a || a + "ed" === b || b + "ed" === a)) return true;
    return false;
  }
  const LIGHT = new Set(["a", "an", "the", "to", "of", "and", "or", "in", "on", "at", "is", "are", "am", "was", "were", "do", "does", "did", "for", "with", "it", "that", "this", "some", "any", "so", "um", "uh", "oh", "well", "just", "very", "really", "please", "then", "up", "as", "be", "been", "have", "has", "had", "oclock"]);
  const weight = t => LIGHT.has(t) ? .5 : 1;
  /* محاذاة (أطول تسلسل مشترك) بين الجملة المطلوبة وما سُمع — ترجع أرقام الكلمات المطابقة */
  function align(T, H){
    const n = T.length, m = H.length;
    const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
    for(let i = 1; i <= n; i++) for(let j = 1; j <= m; j++){
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], same(T[i - 1], H[j - 1]) ? dp[i - 1][j - 1] + weight(T[i - 1]) : -1);
    }
    const hit = new Set(); let i = n, j = m;
    while(i > 0 && j > 0){
      if(same(T[i - 1], H[j - 1]) && dp[i][j] === dp[i - 1][j - 1] + weight(T[i - 1])){ hit.add(i - 1); i--; j--; }
      else if(dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
    }
    return hit;
  }
  /* يقيّم محاولة: target نص الجملة، heardList بدائل ما سمعه الجهاز، prevHit كلمات صحيحة من محاولات سابقة */
  function evaluate(target, heardList, prevHit){
    const words = String(target).split(/\s+/).filter(Boolean);
    const owners = []; const T = [];
    words.forEach((w, wi) => wordTokens(w).forEach(t => { T.push(t); owners.push(wi); }));
    const hit = new Set(prevHit || []), now = new Set();
    const TS = new Set(T);
    /* يدمج أو يفصل الكلمات المركبة: home work = homework، everyday = every day */
    const fixH = H => {
      const out = [];
      for(let j = 0; j < H.length; j++){
        if(j + 1 < H.length && !TS.has(H[j]) && TS.has(H[j] + H[j + 1])){ out.push(H[j] + H[j + 1]); j++; continue; }
        if(!TS.has(H[j])){ const k = T.findIndex((t, i) => i + 1 < T.length && t + T[i + 1] === H[j]); if(k >= 0){ out.push(T[k], T[k + 1]); continue; } }
        out.push(H[j]);
      }
      return out;
    };
    (heardList || []).filter(Boolean).forEach(h => align(T, fixH(tokens(h))).forEach(k => { now.add(k); hit.add(k); }));
    const total = T.reduce((a, t) => a + weight(t), 0) || 1;
    const lightN = T.filter(t => weight(t) < 1).length;
    /* لو قلت كل الكلمات المهمة وما فات إلا كلمة صغيرة أو كلمتين (الجهاز كثير يسقطها) = ١٠٠٪ */
    const sc = set => {
      const missHeavy = T.some((t, k) => weight(t) === 1 && !set.has(k));
      const missLight = T.filter((t, k) => weight(t) < 1 && !set.has(k)).length;
      if(set.size && !missHeavy && missLight <= Math.max(1, Math.floor(lightN / 3))) return 100;
      return Math.round([...set].reduce((a, k) => a + weight(T[k]), 0) / total * 100);
    };
    /* حالة كل كلمة أصلية: ok إذا كل أجزائها انقالت، part إذا بعضها، miss إذا ولا شي */
    const state = words.map((w, wi) => {
      const ks = owners.map((o, k) => o === wi ? k : -1).filter(k => k >= 0);
      if(!ks.length) return "ok";
      const got = ks.filter(k => hit.has(k)).length;
      return got === ks.length ? "ok" : got ? "part" : "miss";
    });
    const missing = words.filter((w, wi) => state[wi] !== "ok" && owners.some((o, k) => o === wi && weight(T[k]) === 1)).map(w => w.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, ""));
    return { score: sc(hit), attempt: sc(now), hit: [...hit], words, state, missing };
  }

  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  /* استماع: onLive(نص مباشر) أثناء الكلام، done(قائمة بدائل أو null) في النهاية. يرجع {stop} */
  function listen(done, onLive, opts){
    opts = opts || {};
    let finished = false, finals = [], interim = "", silence = null, maxT = null, heardAny = false;
    const fin = () => {
      if(finished) return; finished = true; clearTimeout(silence); clearTimeout(maxT);
      const alts = [];
      if(finals.length){
        const K = Math.max(...finals.map(f => f.length));
        for(let k = 0; k < K; k++) alts.push(finals.map(f => f[k] || f[0]).join(" "));
      }
      if(interim && !alts.length) alts.push(interim);
      if(interim && alts.length && !finals.some(f => f[0] === interim)) alts.push(alts[0] + " " + interim);
      done(alts.length ? alts : null);
    };
    if(!SR){ done(null); return { stop(){} }; }
    let r;
    try{
      r = new SR(); r.lang = "en-US"; r.interimResults = true; r.maxAlternatives = 5;
      r.continuous = !isAndroid; /* أندرويد يكرر النتائج في الوضع المستمر */
      r.onresult = e => {
        heardAny = true; interim = "";
        for(let i = e.resultIndex; i < e.results.length; i++){
          const res = e.results[i];
          if(res.isFinal) finals.push(Array.from(res).map(a => a.transcript.trim()));
          else interim += res[0].transcript;
        }
        interim = interim.trim();
        if(onLive) onLive((finals.map(f => f[0]).join(" ") + " " + interim).trim());
        clearTimeout(silence); silence = setTimeout(() => { try{ r.stop(); }catch(err){ fin(); } }, opts.silence || 1800);
      };
      r.onerror = ev => { if(ev && ev.error === "no-speech" && !heardAny){ finals = []; } fin(); };
      r.onend = fin;
      r.start();
      maxT = setTimeout(() => { try{ r.stop(); }catch(err){ fin(); } }, opts.max || 15000);
      /* ما تكلّم أبدًا خلال ٧ ثواني → نوقف بدل الانتظار الطويل */
      silence = setTimeout(() => { if(!heardAny){ try{ r.stop(); }catch(err){ fin(); } } }, opts.first || 7000);
    }catch(e){ fin(); }
    return { stop(){ try{ r && r.stop(); }catch(e){ fin(); } } };
  }
  return { listen, evaluate, tokens, same, numWords, supported: !!SR };
});
