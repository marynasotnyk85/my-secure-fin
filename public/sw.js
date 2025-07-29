const CACHE_NAME = 'my-secure-fin-v1';
const ASSETS = [
  '/', 
  '/index.html',
  '/styles.css',
  '/app.js',
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())   // activate immediately
  );
});



self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);

  if (url.pathname.startsWith('/api/')) {
    evt.respondWith(
      fetch(evt.request)
        .then(res => {
           if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(evt.request, copy));
          }
          else caches.match(evt.request) || offlineJSON()
        }
        )
        .catch(() =>
          caches.match(evt.request) || offlineJSON()
        )
    );
    
    return;  
  }

  // All other requests (HTML, CSS, JS, images):
  evt.respondWith(
    caches.match(evt.request)
      .then(cached => cached || fetch(evt.request))
  );
});

function offlineJSON() {
  return new Response(
    JSON.stringify({ error:'You are offline', offline:true }),
    { headers:{ 'Content-Type':'application/json' } }
  );
}

self.addEventListener('activate', evt => {
  // Clean up old caches
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())  // take control ASAP
  );
});

