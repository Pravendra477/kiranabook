const CACHE_NAME = 'kiranabook-v4.2.4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './assets/icon.svg',
  './js/core/app.js',
  './js/core/actions.js',
  './js/core/constants.js',
  './js/core/db.js',
  './js/core/router.js',
  './js/core/security.js',
  './js/core/state.js',
  './js/core/utils.js',
  './js/components/confirm.js',
  './js/components/modal.js',
  './js/components/pin.js',
  './js/components/sync-status.js',
  './js/components/timers.js',
  './js/components/toast.js',
  './js/components/ui.js',
  './js/pages/analytics.js',
  './js/pages/billing.js',
  './js/pages/customers.js',
  './js/pages/home.js',
  './js/pages/inventory.js',
  './js/pages/settings.js',
  './js/services/analytics.js',
  './js/services/audit.js',
  './js/services/bill-pdf.js',
  './js/services/backup.js',
  './js/services/barcode-scanner.js',
  './js/services/bills.js',
  './js/services/customers.js',
  './js/services/google-drive.js',
  './js/services/products.js',
  './js/services/qrcode.js',
  './js/services/seed.js',
  './js/services/sync.js',
  './js/services/sync-queue.js',
  './js/services/upi.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'kiranabook-sync') {
    event.waitUntil(self.clients.matchAll().then(clients => {
      for (const client of clients) client.postMessage({ type: 'SYNC_REQUESTED' });
    }));
  }
});
