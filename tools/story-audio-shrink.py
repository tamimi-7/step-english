# -*- coding: utf-8 -*-
"""يعيد ترميز ملفات صوت القصص بجودة أخف مع الحفاظ على المدة (فلا تتأثر مزامنة الجمل)."""
import os, sys, subprocess, imageio_ffmpeg, io
sys.stdout.reconfigure(encoding="utf-8")
FF = imageio_ffmpeg.get_ffmpeg_exe()
D = r"C:\Users\ARTHUR\step-English\audio\stories"
BR = sys.argv[1] if len(sys.argv) > 1 else "32k"
ONLY = set(sys.argv[2:])
def dur(p):
    r = subprocess.run([FF, "-i", p], capture_output=True, text=True, errors="ignore")
    for line in r.stderr.splitlines():
        if "Duration:" in line:
            h, m, s = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 0
files = sorted(f for f in os.listdir(D) if f.endswith(".mp3") and (not ONLY or f[:-4] in ONLY))
before = after = 0; worst = 0
for i, f in enumerate(files, 1):
    src = os.path.join(D, f); tmp = os.path.join(D, "_" + f)
    d0 = dur(src); b = os.path.getsize(src)
    r = subprocess.run([FF, "-y", "-i", src, "-c:a", "libmp3lame", "-b:a", BR, "-ac", "1", "-ar", "22050", tmp], capture_output=True)
    if r.returncode != 0 or not os.path.exists(tmp):
        print(f"{f}: FAILED"); continue
    d1 = dur(tmp); a = os.path.getsize(tmp)
    if abs(d1 - d0) > 0.35:
        print(f"{f}: duration drift {d0:.2f} -> {d1:.2f}, keeping original"); os.remove(tmp); after += b; before += b; continue
    worst = max(worst, abs(d1 - d0))
    os.remove(src); os.rename(tmp, src); before += b; after += a
    if i % 10 == 0: print(f"  {i}/{len(files)} …")
print(f"{len(files)} ملفًا: {before//1024//1024} MB -> {after//1024//1024} MB (أكبر فرق في المدة {worst:.2f}s)")
