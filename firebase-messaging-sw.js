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

// Apenas inicializa, não intercepta onBackgroundMessage
const messaging = firebase.messaging();

// TRATAMENTO EXCLUSIVO DE CLIQUE NA NOTIFICAÇÃO DO SISTEMA
self.addEventListener('notificationclick', function(event) {
    // 1. Fecha a notificação
    event.notification.close(); 
    
    const targetUrl = '/?tab=alarms';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // 2. Tenta focar numa aba existente do aplicativo
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url && 'focus' in client) {
                    client.postMessage({ type: 'SWITCH_TAB', tab: 'alarms' });
                    return client.focus();
                }
            }
            // 3. Se o app estiver 100% fechado (kill state), abre uma nova janela
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});