# -*- coding: utf-8 -*-
"""يولّد ملفات الصوت لكل قصة مع توقيت كل جملة (للتلوين أثناء الاستماع)."""
import asyncio, edge_tts, json, io, os, sys, subprocess, re
sys.stdout.reconfigure(encoding="utf-8")
R = r"C:\Users\ARTHUR\step-English"
NODE = r"C:\Users\ARTHUR\tools\node\node.exe"
OUT = os.path.join(R, "audio", "stories")
os.makedirs(OUT, exist_ok=True)
VOICES = {  # قارئ مختلف حسب المستوى ليبقى الاستماع ممتعًا
    "A1": "en-US-AnaNeural", "A2": "en-US-EmmaNeural", "B1": "en-US-AndrewNeural",
    "B2": "en-GB-RyanNeural", "C1": "en-US-BrianNeural", "C2": "en-GB-SoniaNeural",
}
RATE = {"A1": "-18%", "A2": "-12%", "B1": "-6%", "B2": "-4%", "C1": "+0%", "C2": "+0%"}

js = r'''
const vm=require("vm"),fs=require("fs"),p=require("path");
const c={window:{}};vm.createContext(c);
const dir=p.join(process.argv[1],"data","stories");
for(const f of fs.readdirSync(dir).sort())vm.runInContext(fs.readFileSync(p.join(dir,f),"utf8"),c);
process.stdout.write(JSON.stringify(c.window.STORIES.map(s=>({id:s.id,lvl:s.lvl,paras:s.paras.map(x=>x.en)}))));
'''
stories = json.loads(subprocess.run([NODE, "-e", js, R], capture_output=True, text=True, encoding="utf-8").stdout)
only = sys.argv[1:] or None

async def build(st):
    path = os.path.join(OUT, st["id"] + ".mp3")
    voice, rate = VOICES.get(st["lvl"], "en-US-AndrewNeural"), RATE.get(st["lvl"], "+0%")
    text = "\n\n".join(st["paras"])
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="SentenceBoundary")
    audio, ev = bytearray(), []
    async for ch in comm.stream():
        if ch["type"] == "audio": audio += ch["data"]
        elif ch["type"] == "SentenceBoundary": ev.append((ch["offset"] / 1e7, ch["duration"] / 1e7, ch["text"]))
    if not audio: raise RuntimeError("no audio")
    spans, pi, pos = [], 0, 0
    for start, dur, txt in ev:
        t = re.sub(r"\s+", " ", txt).strip()
        found = None
        for k in range(pi, len(st["paras"])):
            hay = st["paras"][k]
            i = hay.find(t, pos if k == pi else 0)
            if i < 0 and k == pi: i = hay.find(t)
            if i >= 0: found = (k, i, i + len(t)); break
        if not found: continue
        pi, pos = found[0], found[2]
        spans.append([round(start, 2), round(start + dur, 2), found[0], found[1], found[2]])
    io.open(path, "wb").write(bytes(audio))
    return spans, len(audio)

async def main():
    times_path = os.path.join(R, "data", "story-times.js")
    old = {}
    if os.path.exists(times_path):
        m = re.search(r"=\s*(\{.*\});?\s*$", io.open(times_path, encoding="utf-8").read().strip(), re.S)
        if m:
            try: old = json.loads(m.group(1))
            except Exception: old = {}
    todo = [s for s in stories if (not only or s["id"] in only)]
    total = 0
    for i, st in enumerate(todo, 1):
        try:
            spans, n = await build(st)
            old[st["id"]] = spans; total += n
            print(f"{i}/{len(todo)} {st['lvl']} {st['id']}: {len(spans)} جملة, {n//1024} KB")
        except Exception as e:
            print(f"{i}/{len(todo)} {st['id']}: FAILED {e}")
        io.open(times_path, "w", encoding="utf-8").write(
            "/* توقيت جمل القصص: [بداية, نهاية, رقم الفقرة, من حرف, إلى حرف] */\nwindow.STORY_TIMES = " + json.dumps(old, ensure_ascii=False) + ";\n")
    print("total", total // 1024, "KB")

asyncio.run(main())
