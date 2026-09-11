/* ===== Progress: per-question memory, mastery per topic, spaced repetition, server sync ===== */
const Progress = (() => {
  const KEY = "step_prog";
  const MIN = 60e3, DAY = 864e5;
  const INTERVALS = [10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
  let data = Store.get(KEY, null);
  if(!data || !data.q) data = { v: 1, updated: 0, q: {}, days: {} };
  if(!data.days) data.days = {};
  if(!Array.isArray(data.marks)) data.marks = [];
  const dayKey = t => new Date(t || Date.now()).toLocaleDateString("en-CA");
  const save = () => { data.updated = Date.now(); Store.set(KEY, data); };

  function record(id, correct){
    const r = data.q[id] || { n: 0, c: 0, s: 0, lvl: 0, last: 0, due: 0 };
    r.n++; if(correct){ r.c++; r.s++; r.lvl = Math.min(r.lvl + 1, 5); } else { r.s = 0; r.lvl = 0; }
    r.last = Date.now(); r.due = r.last + INTERVALS[r.lvl];
    data.q[id] = r;
    const d = dayKey(); data.days[d] = (data.days[d] || 0) + 1;
    save();
  }
  const qScore = r => !r || !r.n ? 0 : r.lvl >= 3 ? 1 : r.lvl === 2 ? .8 : r.lvl === 1 ? .6 : 0;
  function topicMastery(t){
    const ids = Bank.idsOfTopic(t); if(!ids.length) return { t, pct: 0, seen: 0, total: 0, wrong: 0 };
    let s = 0, seen = 0, wrong = 0;
    for(const id of ids){ const r = data.q[id]; if(r && r.n){ seen++; if(r.lvl === 0) wrong++; } s += qScore(r); }
    return { t, pct: Math.round(s / ids.length * 100), seen, total: ids.length, wrong };
  }
  const allTopics = () => Bank.topics().map(topicMastery);
  function overall(){
    const ms = allTopics(); const total = ms.reduce((a, m) => a + m.total, 0); const seen = ms.reduce((a, m) => a + m.seen, 0);
    const pct = ms.length ? Math.round(ms.reduce((a, m) => a + m.pct, 0) / ms.length) : 0;
    const answered = Object.values(data.q).reduce((a, r) => a + r.n, 0);
    const correct = Object.values(data.q).reduce((a, r) => a + r.c, 0);
    return { pct, seen, total, answered, correct, acc: answered ? Math.round(correct / answered * 100) : 0 };
  }
  const weakTopics = (min = 3) => allTopics().filter(m => m.seen >= min).sort((a, b) => a.pct - b.pct);
  const dueIds = () => { const now = Date.now(); return Object.entries(data.q).filter(([, r]) => r.n && r.due <= now).sort((a, b) => a[1].due - b[1].due).map(([id]) => id); };
  const wrongIds = () => Object.entries(data.q).filter(([, r]) => r.n && r.lvl === 0).map(([id]) => id);
  const nextDue = () => { const rs = Object.values(data.q).filter(r => r.n && r.due > Date.now()); return rs.length ? Math.min(...rs.map(r => r.due)) : null; };
  function streak(){
    let n = 0; const d = new Date(); if(!data.days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while(data.days[dayKey(d)]){ n++; d.setDate(d.getDate() - 1); } return n;
  }

  function weightOf(id, tm){
    const r = data.q[id], now = Date.now(); let w;
    if(!r || !r.n) w = 3; else if(r.lvl === 0) w = 6; else if(r.due <= now) w = 5; else if(r.lvl < 3) w = 1.2; else w = .25;
    return w * (1.6 - (tm[Bank.topicOf(id)] || 0) / 100);
  }
  function weightedSample(ids, n, tm){
    const pool = ids.map(id => ({ id, w: weightOf(id, tm) })); const out = [];
    while(out.length < n && pool.length){
      let tot = pool.reduce((a, p) => a + p.w, 0), r = Math.random() * tot, k = 0;
      for(; k < pool.length; k++){ r -= pool[k].w; if(r <= 0) break; }
      k = Math.min(k, pool.length - 1); out.push(pool[k].id); pool.splice(k, 1);
    }
    return out;
  }
  function smart(n, topicsFilter){
    const tm = {}; for(const m of allTopics()) tm[m.t] = m.pct;
    let ids = Bank.allIds(); if(topicsFilter && topicsFilter.length) ids = ids.filter(id => topicsFilter.includes(Bank.topicOf(id)));
    return Bank.groupPassages(Bank.byIds(weightedSample(ids, n, tm)));
  }
  function weak(n){ const wt = weakTopics(3).slice(0, 3).map(m => m.t); return wt.length ? smart(n, wt) : null; }
  function review(n){ return Bank.groupPassages(Bank.byIds(dueIds().slice(0, n))); }

  /* ---- server sync (per account) ---- */
  function merge(a, b){
    const out = { v: 1, updated: Math.max(a.updated || 0, b.updated || 0), q: { ...(a.q || {}) }, days: { ...(a.days || {}) }, marks: [...new Set([...(a.marks || []), ...(b.marks || [])])] };
    for(const [id, r] of Object.entries(b.q || {})){ const cur = out.q[id]; if(!cur || (r.last || 0) > (cur.last || 0)) out.q[id] = r; }
    for(const [d, n] of Object.entries(b.days || {})) out.days[d] = Math.max(out.days[d] || 0, n);
    return out;
  }
  let syncing = null;
  async function sync(push){
    if(typeof Auth === "undefined" || !Auth.user()) return false;
    if(syncing) return syncing;
    syncing = (async () => {
      try{
        const j = push ? await Auth.api("/api/progress", { method: "POST", body: { prog: data } }) : await Auth.api("/api/progress");
        if(j && j.prog){ const removed = new Set(data.unmarked || []); data = merge(data, j.prog); data.marks = data.marks.filter(id => !removed.has(id)); if(!data.days) data.days = {}; save(); }
        return true;
      }catch(e){ return false; } finally { syncing = null; }
    })();
    return syncing;
  }
  function reset(){ data = { v: 1, updated: Date.now(), q: {}, days: {}, marks: [] }; save(); }
  const isMarked = id => data.marks.includes(id);
  function toggleMark(id){ const i = data.marks.indexOf(id); data.unmarked = data.unmarked || []; if(i >= 0){ data.marks.splice(i, 1); data.unmarked.push(id); } else { data.marks.push(id); data.unmarked = data.unmarked.filter(x => x !== id); } save(); sync(true); return i < 0; }
  const marks = () => data.marks.slice();
  const marked = n => Bank.groupPassages(Bank.byIds(n ? shuffle(data.marks).slice(0, n) : data.marks));

  return { record, topicMastery, allTopics, overall, weakTopics, dueIds, wrongIds, nextDue, streak, smart, weak, review, sync, reset, merge, isMarked, toggleMark, marks, marked, get data(){ return data; } };
})();
