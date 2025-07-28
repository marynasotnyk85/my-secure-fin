const CACHE_NAME = 'my-secure-fin-v1';
const ASSETS = [
  '/', 
  '/index.html',
  '/styles.css',
  '/app.js',
];

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

self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);

  if (url.pathname.startsWith('/api/')) {
    evt.respondWith(
      fetch(evt.request)
        .then(res => res.ok
          ? res
          : caches.match(evt.request) || offlineJSON()
        )
        .catch(() =>
          caches.match(evt.request) || offlineJSON()
        )
    );
    return;  // <-- important, don’t fall through
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

