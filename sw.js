// Çanakkale 112 İASB portalı: önce ağ, çevrimdışıysa son önbellek. Sadece kendi dosyalarımız saklanır, veri saklanmaz.
const V = 'iasb-v3';
const DOSYALAR = ['./', 'index.html', 'ajanda.html', 'bulten.html', 'genel-bilgiler.html', 'bulten-app.js', 'bulten-config.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const kopya = res.clone(); caches.open(V).then(c => c.put(r, kopya)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
