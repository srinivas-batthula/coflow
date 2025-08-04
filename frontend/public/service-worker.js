
const CACHE_NAME = `coflow-cache-v${new Date().toISOString().slice(0,10)}`             //Change this to a new version before every New DEPLOY.............................
const HOME = process.env.NEXT_PUBLIC_HOME || "https://coflow.netlify.app";      // Provide a `Deployed` URL... (self.location.origin)

const STATIC_FILES = [
    `${HOME}/`,
    `${HOME}/manifest.json`,
    `${HOME}/badge.svg`,
    `${HOME}/notification.wav`,
];


    // Install event: Cache essential assets...
self.addEventListener("install", (event) => {
    console.log("Service Worker installing...")
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_FILES)
        })
    );
    self.skipWaiting()
})

    // Activate event: Delete old caches...
self.addEventListener("activate", (event) => {
    console.log("Service Worker activated!")
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key)
                })
            )
        )
    )
    self.clients.claim()
})

let url = HOME;
    // Display Push Notifications...
self.addEventListener('push', async(event) => {
    console.log("Push received...", event.data.json())
    let data = event.data ? event.data.json() : { title: 'New Alert!', body: 'You have a New Notification from ~CoFlow.' }
    if(data && data?.id){
        url = HOME+`/teams/${data.id}`; 
    }

    const options = {
        body: data.body,
        icon: './icon.png',
        badge: './badge.svg',
        vibrate: [150, 80, 150],
        sound: './notification.wav',    //Only works on some devices like `mobile`...
        actions: [
            {
                action: 'open',
                title: 'Open'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            },
        ]
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

    // Handle clicks on Notification box...
self.addEventListener('notificationclick', (event) => {
    const action = event.action

    if (action === 'dismiss') {
        event.notification.close()
    }
    else if (action === 'open') {
        event.notification.close()
        event.waitUntil(
            clients.openWindow(url)
        )
    }
    else {
        event.notification.close()
        event.waitUntil(
            clients.openWindow(HOME)
        )
    }
})