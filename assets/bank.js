/* ===== Shared question bank (grammar + vocab + reading) ===== */
const Bank = (() => {
  const hasV = () => typeof VOCAB !== "undefined", hasQ = () => typeof QUESTIONS !== "undefined", hasP = () => typeof PASSAGES !== "undefined";
  const vpool = () => hasV() ? VOCAB.filter(v => !v.skip) : [];

  function vocabQ(v){
    const pool = vpool(); const correct = v.s[0];
    const others = pool.filter(o => o !== v && !v.s.includes(o.s[0]) && !o.s.includes(correct)).map(o => o.s[0]);
    const dis = []; for(const d of shuffle(others)){ if(!dis.includes(d) && d !== correct) dis.push(d); if(dis.length === 3) break; }
    const opts = shuffle([correct, ...dis]);
    return { id: "v-" + v.w, topic: "vocab", kind: "vocab", q: `The word "<b>${esc(v.w)}</b>" is closest in meaning to?`, opts, a: opts.indexOf(correct), ex: `${v.w} = ${v.s.join(" / ")} — ${v.ar}${v.orig ? ` (في التجميعات: ${v.orig})` : ""}` };
  }
  const readingQs = passages => passages.flatMap(p => p.qs.map((x, i) => ({ id: p.id + "-" + i, topic: "reading", kind: "reading", pid: p.id, q: esc(x.q), opts: x.opts, a: x.a, ex: x.ex })));
  const grammar = topic => hasQ() ? QUESTIONS.filter(q => !topic || topic === "all" || q.topic === topic).map(q => ({ ...q, kind: "grammar" })) : [];
  const vocab = () => vpool().map(vocabQ);
  const reading = () => hasP() ? readingQs(PASSAGES) : [];

  /* ---- collections (تجميعات) ---- */
  const hasC = () => typeof COLLECTIONS !== "undefined";
  const CTOPIC = { l: "clistening", g: "cgrammar", r: "creading" };
  const CKEY = { clistening: "listening", cgrammar: "grammar", creading: "reading" };
  const CLABEL = { clistening: "تجميعات الاستماع", cgrammar: "تجميعات القرامر", creading: "تجميعات القطع" };
  const quizable = it => !!(it && it.q && ((Array.isArray(it.o) && it.o.length >= 2 && typeof it.a === "number") || (typeof it.a === "string" && it.a)));
  function collQ(topic, m, i){
    if(!hasC()) return null;
    const c = COLLECTIONS[CKEY[topic]]; const model = c && c.models.find(x => x.n === m); const it = model && model.items[i];
    if(!quizable(it)) return null;
    const id = `c${topic[1]}-${m}-${i}`, label = `${CLABEL[topic]} — النموذج ${m}`;
    if(Array.isArray(it.o)) return { id, topic, kind: "coll", q: esc(it.q), opts: it.o, a: it.a, ex: label };
    const pool = [...new Set(model.items.filter(x => x.q && typeof x.a === "string" && x.a && x.a !== it.a).map(x => x.a))];
    const dis = sample(pool, 3); if(dis.length < 2) return null;
    const opts = shuffle([it.a, ...dis]);
    return { id, topic, kind: "coll", q: esc(it.q), opts, a: opts.indexOf(it.a), ex: label + (it.ar ? " — " + it.ar : "") };
  }
  const collIds = topic => { if(!hasC() || !COLLECTIONS[CKEY[topic]]) return []; const out = []; for(const m of COLLECTIONS[CKEY[topic]].models){ m.items.forEach((it, i) => { if(quizable(it) && (Array.isArray(it.o) || m.items.filter(x => x.q && typeof x.a === "string" && x.a && x.a !== it.a).length >= 2)) out.push(`c${topic[1]}-${m.n}-${i}`); }); } return out; };
  const collModel = (key, n) => { const t = Object.keys(CKEY).find(k => CKEY[k] === key); if(!t || !hasC()) return []; const m = COLLECTIONS[key].models.find(x => x.n === n); if(!m) return []; return m.items.map((it, i) => collQ(t, n, i)).filter(Boolean); };

  function byId(id){
    if(!id) return null;
    if(/^c[lgr]-\d+-\d+$/.test(id)){ const [, mm, ii] = id.split("-"); return collQ(CTOPIC[id[1]], +mm, +ii); }
    if(id.startsWith("g")){ const q = hasQ() && QUESTIONS.find(x => x.id === id); return q ? { ...q, kind: "grammar" } : null; }
    if(id.startsWith("v-")){ const w = id.slice(2); const v = hasV() && VOCAB.find(x => x.w === w); return v ? vocabQ(v) : null; }
    if(id.startsWith("p")){ const i = id.lastIndexOf("-"); const pid = id.slice(0, i), qi = +id.slice(i + 1); const p = hasP() && PASSAGES.find(x => x.id === pid); return p && p.qs[qi] ? readingQs([p])[qi] : null; }
    return null;
  }
  const byIds = ids => ids.map(byId).filter(Boolean);
  function pickReading(n){ let out = [], t = 0; for(const p of shuffle(PASSAGES)){ if(t >= n) break; out.push(p); t += p.qs.length; } return readingQs(out); }
  function pick(mode, topic, n){
    const N = n === "all" ? Infinity : +n;
    const cap = x => N === Infinity ? shuffle(x) : sample(x, N);
    if(mode === "grammar") return cap(grammar(topic));
    if(mode === "vocab") return cap(vocab());
    if(mode === "reading") return N === Infinity ? readingQs(shuffle(PASSAGES)) : pickReading(N);
    if(CKEY[mode]) return byIds(N === Infinity ? shuffle(collIds(mode)) : sample(collIds(mode), N));
    const total = N === Infinity ? 40 : N; const g = Math.round(total * .5), v = Math.round(total * .25), r = total - g - v;
    return [...sample(grammar("all"), g), ...sample(vocab(), v), ...pickReading(r)];
  }
  /* keep reading questions of the same passage adjacent */
  function groupPassages(list){ const out = [], seen = new Set(); for(const q of list){ if(!q.pid){ out.push(q); continue; } if(seen.has(q.pid)) continue; seen.add(q.pid); out.push(...list.filter(x => x.pid === q.pid)); } return out; }

  const topicLabel = t => t === "vocab" ? "المفردات" : t === "reading" ? "القراءة" : t === "challenge" ? "تحدي" : t === "train" ? "تدريب" : t === "general" ? "إنقلش عام" : CLABEL[t] || (typeof TOPICS !== "undefined" && TOPICS[t]) || t;
  const topics = () => [...(hasQ() ? Object.keys(TOPICS) : []), ...(hasV() ? ["vocab"] : []), ...(hasP() ? ["reading"] : []), ...(hasC() ? Object.keys(CKEY).filter(k => COLLECTIONS[CKEY[k]]) : [])];
  const kindOf = id => id.startsWith("v-") ? "vocab" : /^c[lgr]-/.test(id) ? "coll" : id.startsWith("p") ? "reading" : "grammar";
  const topicOf = id => { const k = kindOf(id); if(k === "coll") return CTOPIC[id[1]]; if(k !== "grammar") return k; const q = hasQ() && QUESTIONS.find(x => x.id === id); return q ? q.topic : "other"; };
  const idsOfTopic = t => CKEY[t] ? collIds(t) : t === "vocab" ? vpool().map(v => "v-" + v.w) : t === "reading" ? (hasP() ? PASSAGES.flatMap(p => p.qs.map((_, i) => p.id + "-" + i)) : []) : (hasQ() ? QUESTIONS.filter(q => q.topic === t).map(q => q.id) : []);
  const allIds = () => topics().flatMap(idsOfTopic);
  const count = () => allIds().length;
  const LETTERS = ["A", "B", "C", "D", "E"];
  return { vocabQ, grammar, vocab, reading, byId, byIds, pick, groupPassages, topicLabel, topics, kindOf, topicOf, idsOfTopic, allIds, count, LETTERS, collModel, collIds, CKEY, CLABEL };
})();
