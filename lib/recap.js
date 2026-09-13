/* ملخص ساعة الذهب بعد انتهائها: كم جمع كل واحد، ومن كم إلى كم ارتفع، وترتيبه قبل وبعد */
const db = require("./db");
const EV = require("../data/events.js");
const H = 3600e3, D = 24 * H, TZ = 3;
/* آخر ساعة ذهب انتهت (إذا مرّ عليها أقل من ٢٦ ساعة) */
function lastGolden(now){
  const G = (EV.CONFIG.recurring || []).find(r => r.id === "golden"); if(!G) return null;
  const dayStart = Math.floor((now + TZ * H) / D) * D - TZ * H;
  let start = dayStart + G.fromH * H, end = dayStart + G.toH * H;
  if(now < end){ start -= D; end -= D; }
  if(now - end > 26 * H) return null;
  return { id: "golden", key: "golden-" + EV.dateKey(start), title: G.title, start, end, mult: G.mult };
}
async function recap(win){
  const users = (await db.call("SMEMBERS", "users")) || [];
  if(!users.length) return { ...win, list: [] };
  const names = db.flatToObj(await db.call("HGETALL", "names"));
  const totals = await db.pipeline(users.map(u => ["ZSCORE", "lb:total", u]));
  const res = await db.pipeline(users.map(u => ["LRANGE", "results:" + u, 0, 499]));
  const list = users.map((u, i) => {
    const rounds = (res[i] || []).map(x => { try{ return JSON.parse(x); }catch(e){ return null; } }).filter(r => r && r.at >= win.start && r.at < win.end);
    const gained = rounds.reduce((a, r) => a + (r.points || 0), 0), newQ = rounds.reduce((a, r) => a + (r.base || 0), 0), stages = rounds.filter(r => r.stage).length;
    const after = Number(totals[i] || 0);
    return { u, name: names[u] || u, gained, newQ, rounds: rounds.length, stages, after, before: after - gained };
  });
  const rankBy = key => { const s = [...list].sort((a, b) => b[key] - a[key]); return Object.fromEntries(s.map((x, i) => [x.u, x[key] > 0 ? i + 1 : null])); };
  const rb = rankBy("before"), ra = rankBy("after");
  list.forEach(x => { x.rankBefore = rb[x.u]; x.rankAfter = ra[x.u]; });
  list.sort((a, b) => b.gained - a.gained || b.after - a.after);
  return { ...win, list };
}
module.exports = { lastGolden, recap };
