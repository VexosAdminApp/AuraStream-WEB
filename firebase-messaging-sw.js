importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});

firebase.initializeApp({
    apiKey: "AIzaSyAkoZykh9QaROTsCQC7_qs4NGNl4-cdMBM",
    authDomain: "aurastreamweb.firebaseapp.com",
    databaseURL: "https://aurastreamweb-default-rtdb.firebaseio.com",
    projectId: "aurastreamweb",
    storageBucket: "aurastreamweb.firebasestorage.app",
    messagingSenderId: "380237625698",
    appId: "1:380237625698:web:db077e82d8ca77085cd43b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    // MAGIA ANTI-DUPLICATAS (iOS/ANDROID)
    // Se o payload tiver "notification", o Safari/Chrome já vai desenhar nativamente!
    if (payload.notification) {
        console.log('[SW] Bloqueada tentativa de duplicação. O SO assumiu.');
        return; 
    }
    
    // Fallback: Se for puramente "data", desenhamos manualmente
    const data = payload.data || {};
    const title = data.title || "⚠️ ALARME INDUSTRIAL";
    const options = {
        body: data.body || "Falha detectada no processo.",
        icon: '/icon.png',
        badge: '/icon.png',
        vibrate: [500, 200, 500, 200, 800, 200, 800],
        requireInteraction: true,
        data: { url: data.url || '/?tab=alarms' },
        tag: data.tag || 'scada-alarm-critical'
    };

    return self.registration.showNotification(title, options);
});

// ABERTURA IMEDIATA / FOCO NA ABA
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 
    
    // Firebase mapeia dados de FCM Options e Payload para cá
    const targetUrl = event.notification.data?.url || '/?tab=alarms';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url && 'focus' in client) {
                    client.postMessage({ type: 'SWITCH_TAB', tab: 'alarms' });
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});