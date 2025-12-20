const CACHE_NAME = 'mood-cafe-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});