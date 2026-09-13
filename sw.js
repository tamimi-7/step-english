/* عامل الخدمة: يستقبل الإشعارات فقط (ما يخزّن صفحات، عشان ما تعلق نسخة قديمة) */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
  let d = {};
  try{ d = e.data ? e.data.json() : {}; }catch(err){ d = { title: "إنقلش", body: e.data ? e.data.text() : "" }; }
  const url = typeof d.url === "string" && d.url.startsWith("/") && !d.url.startsWith("//") ? d.url : "/";
  e.waitUntil(self.registration.showNotification(d.title || "إنقلش", {
    body: d.body || "", icon: "/assets/brand/icon-192.png", badge: "/assets/brand/badge-96.png",
    tag: d.tag || "general", renotify: true, dir: "rtl", lang: "ar", data: { url }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin);
  if(target.origin !== self.location.origin) return; /* روابط الموقع فقط */
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for(const c of all){ if(new URL(c.url).origin === target.origin && "focus" in c){ await c.focus(); if("navigate" in c) try{ await c.navigate(target.href); }catch(err){} return; } }
    await self.clients.openWindow(target.href);
  })());
});
