// sw.js - The Offline Manager
const cacheName = 'suzanaah-v1';
const staticAssets = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// 1. Install Event: Saves the app files to the phone's memory
self.addEventListener('install', async event => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  console.log('Suzanaah App: Offline Cache Installed');
});

// 2. Activate Event: Cleans up old versions of the app
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// 3. Fetch Event: Intercepts network requests
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // If it's a local file, try the cache first
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    // If it's an API call (like Firebase), go to the network
    event.respondWith(networkAndCache(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  return cached || fetch(req);
}

async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    // Don't cache Firebase real-time streams, just static assets
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached;
  }
}
