// Çanakkale 112 İASB portalı: önce ağ, çevrimdışıysa son önbellek. Sadece kendi dosyalarımız saklanır, veri saklanmaz.
const V = 'iasb-v12';
const DOSYALAR = ['./', 'index.html', 'ajanda.html', 'bulten.html', 'genel-bilgiler.html', 'bildirim.html', 'bulten-app.js?v=10', 'bulten-config.js', 'ortak.js?v=6', 'ortak.js?v=7', 'manifest.json', 'icon-192.png', 'icon-512.png'];
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
    fetch(r, { cache: 'no-cache' }).then(res => {      // her seferinde sunucuya sorar (değişmediyse 304, hızlı); eski önbellekte takılmayı önler
      if (res.ok) { const kopya = res.clone(); caches.open(V).then(c => c.put(r, kopya)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
