const fs=require("fs"),path=require("path");
const R=String.raw`C:\Users\ARTHUR\step-English`;
fs.readFileSync(path.join(R,".env.local"),"utf8").split(/\r?\n/).forEach(l=>{const m=l.match(/^([A-Z_]+)="?([^"]*)"?$/);if(m)process.env[m[1]]=m[2];});
const db=require(path.join(R,"lib","db.js")); const AR=require(path.join(R,"lib","areas.js"));
(async()=>{
  const users=await db.call("SMEMBERS","users"); const names=db.flatToObj(await db.call("HGETALL","names"));
  for(const u of users){
    const [a,x,t,m,st,nt]=await db.pipeline([["HGETALL","ptsa:"+u],["HGETALL","ptsx:"+u],["ZSCORE","lb:total",u],["ZSCORE","lb:month:2026-09",u],["SMEMBERS","stages:"+u],["HGETALL","notices:"+u]]);
    const num=o=>Object.entries(db.flatToObj(o)).map(([k,v])=>[k,Number(v)]);
    const A=num(a),X=num(x); const sum=[...A,...X].reduce((s,[,v])=>s+v,0); const total=Number(t||0);
    const notes=Object.values(db.flatToObj(nt)).map(s=>JSON.parse(s)).map(n=>n.title+" (+"+n.points+")");
    console.log(`${names[u]||u}: المجموع ${total} | التفصيل ${sum} ${sum===total?"✓ مطابق":"✗"} | البطولة ${Number(m||0)} | مراحل ${st.length} | رسائل: ${notes.join(", ")||"—"}`);
    console.log("   "+[...A.map(([k,v])=>`${AR.LABELS[k]||k}=${v}`),...X.map(([k,v])=>`${AR.EXTRAS[k]||k}=${v}`)].join(" · "));
  }
})();
