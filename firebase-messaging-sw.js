importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// 1. FORÇA ATIVAÇÃO IMEDIATA DO MOTOR
self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});

// 2. CONFIGURAÇÃO FIREBASE (Use EXATAMENTE as suas chaves aqui)
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

// 3. RECEBIMENTO EM BACKGROUND (Aplicativo Fechado)
messaging.onBackgroundMessage(function(payload) {
    console.log('[ServiceWorker] Alarme Crítico Recebido:', payload);
    
    // ATENÇÃO: Lemos exclusivamente de payload.data
    const data = payload.data || {};
    
    const notificationTitle = data.title || "⚠️ ALARME INDUSTRIAL";
    const notificationOptions = {
        body: data.body || "Falha detectada no processo.",
        icon: '/icon.png',
        badge: '/icon.png',
        // Padrão de vibração agressivo (vibra, pausa, vibra longo)
        vibrate: [500, 200, 500, 200, 800, 200, 800],
        requireInteraction: true, // A notificação NÃO some até o operador interagir
        data: {
            url: data.url || '/?tab=alarms' // Salva a URL para o evento de clique
        },
        tag: data.tag || 'scada-alarm-critical' // Agrupa notificações do mesmo equipamento
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. EVENTO DE CLIQUE NA NOTIFICAÇÃO
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Fecha o banner da notificação
    
    const urlToOpen = event.notification.data.url || '/?tab=alarms';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // Procura se o app já está aberto em alguma aba
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    // Manda comando pro App mudar para a aba de alertas
                    client.postMessage({ type: 'SWITCH_TAB', tab: 'alarms' });
                    return client.focus();
                }
            }
            // Se o App estiver 100% fechado, abre uma nova janela
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});