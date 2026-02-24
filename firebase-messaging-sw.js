importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// 1. FORÇA ATIVAÇÃO IMEDIATA (Sem isso, o SW pode ficar em estado 'waiting' para sempre)
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});

// 2. CONFIGURAÇÃO FIREBASE
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

// 3. EVENTO DE BACKGROUND: O navegador está fechado/oculto
messaging.onBackgroundMessage(function(payload) {
    console.log('[ServiceWorker] Alarme Crítico Recebido em Background:', payload);
    
    const data = payload.data || {};
    
    const notificationTitle = data.title || "⚠️ ALARME INDUSTRIAL";
    const notificationOptions = {
        body: data.body || "Falha detectada no processo.",
        icon: '/icon.png',
        badge: '/icon.png',
        // Vibração agressiva estilo sirene (vibra-para-vibra-pausa...)
        vibrate: [500, 200, 500, 200, 800, 200, 800],
        requireInteraction: true, // Bloqueia sumiço da notificação; o operador PRECISA dispensar
        data: {
            url: data.url || '/?tab=alarms'
        },
        tag: data.tag || 'scada-alarm-critical'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. TRATAMENTO DO CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 
    
    const targetUrl = event.notification.data.url || '/?tab=alarms';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // Se o App já estiver aberto (mesmo em outra aba), foca nele e muda a aba internamente
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url && 'focus' in client) {
                    client.postMessage({ type: 'SWITCH_TAB', tab: 'alarms' });
                    return client.focus();
                }
            }
            // Se o App estiver 100% morto na memória, abre do zero
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});