// Service Worker for "مودة ورحمة" PWA & TWA
const CACHE_NAME = "mawada-rahma-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for navigation
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Let Supabase API & external real-time requests go directly to network
  if (url.hostname.includes("supabase.co") || event.request.method !== "GET") {
    return;
  }

  // Static files and pages
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
        return new Response("الخدمة غير متوفرة حالياً بدون اتصال بالإنترنت", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
  );
});

// Push Event: Handle background push messages from FCM or Supabase Webhooks
self.addEventListener("push", (event) => {
  let payload = {
    title: "مودة ورحمة",
    body: "لديك إشعار جديد في حسابك المبارك",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/" },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icon-192.png",
      badge: payload.badge || "/icon-192.png",
      vibrate: [200, 100, 200],
      data: payload.data || { url: "/" },
      dir: "rtl",
      lang: "ar",
    })
  );
});

// Notification Click Event: Focus existing window or open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

