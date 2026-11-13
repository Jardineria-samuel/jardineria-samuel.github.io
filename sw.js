// Mis trabajos: funciona sin internet. Primero intenta la red (para tener siempre la última versión) y si no, lo guardado.
const CACHE = "mis-trabajos-v3";
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "index.html", "manifest.json", "icono-192.png", "icono-512.png"]))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
// aviso de «se te olvidó ■» que manda el servidor
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { b: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.t || "Mis trabajos", { body: d.b || "", icon: "icono-192.png", badge: "icono-192.png", tag: "olvido", renotify: true, vibrate: [200, 100, 200] }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => {
    for (const c of l) if ("focus" in c) { c.navigate ? c.navigate("./").catch(() => {}) : 0; return c.focus(); }
    return self.clients.openWindow("./");
  }));
});
