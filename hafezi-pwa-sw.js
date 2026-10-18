/* আল-কুরআন হাফেজি — অফলাইন service worker (অ্যাপ-সংস্করণ) */
const VER = 'pwa-v1';
const SHELL = 'shell-' + VER, FONTS = 'fonts-' + VER;
const APP = './hafezi-pwa.html';
const EXTRA = ['./hafezi-pwa.json', './hafezi-pwa-192.png', './hafezi-pwa-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(async c => {
    await c.add(APP);
    await Promise.all(EXTRA.map(u => c.add(u).catch(() => {})));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { if (res.ok && u.pathname.endsWith('hafezi-pwa.html')) { const cp = res.clone(); caches.open(SHELL).then(c => c.put(APP, cp)); } return res; })
      .catch(() => caches.match(APP)));
    return;
  }
  if (u.origin === location.origin) {
    e.respondWith(caches.match(r).then(x => x || fetch(r)));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(c => c.match(r).then(x => {
      const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => x);
      return x || net;
    })));
  }
});
