const CACHE_NAME = `coflow-cache-v${new Date().toISOString().slice(0, 10)}`; //Change this to a new version before every New DEPLOY.............................
const HOME = self.location.origin; // Provide a `Deployed` URL... (self.location.origin) / "https://coflow.netlify.app"

const STATIC_FILES = [
  `${HOME}/`,
  `${HOME}/manifest.json`,
  `${HOME}/badge.svg`,
  `${HOME}/notification.wav`,
  `${HOME}/offline.html`,
  // `${HOME}/_next/static/`,  // <- Next.js static build folder -installed in `fetch` event handler...
];

// Install event: Cache essential assets...
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Intercept fetch requests of same origin to cache and serve static assets & html, css, js files...
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Try fetching from network and cache it
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Only cache GET requests and same-origin requests
            if (
              event.request.method === 'GET' &&
              event.request.url.startsWith(self.location.origin)
            ) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // Optionally return a fallback page
          if (event.request.mode === 'navigate') {
            return caches.match(`${HOME}/offline.html`);
          }
        });
    })
  );
});

// Activate event: Delete old caches...
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated!');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

let url = HOME;
// Display Push Notifications...
self.addEventListener('push', async (event) => {
  console.log('Push received...', event.data.json());
  let data = event.data
    ? event.data.json()
    : {
        title: 'New Alert!',
        body: 'You have a New Notification from ~CoFlow.',
      };
  if (data && data?.id) {
    url = HOME + `/teams/${data.id}`;
  }

  const options = {
    body: data.body,
    icon: './icon.png',
    badge: './badge.svg',
    vibrate: [150, 80, 150],
    sound: './notification.wav', //Only works on some devices like `mobile`...
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle clicks on Notification box...
self.addEventListener('notificationclick', (event) => {
  const action = event.action;

  if (action === 'dismiss') {
    event.notification.close();
  } else if (action === 'open') {
    event.notification.close();
    event.waitUntil(clients.openWindow(url));
  } else {
    event.notification.close();
    event.waitUntil(clients.openWindow(HOME));
  }
});
