importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Configuração corrigida (databaseURL com "d")
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
  console.log('[ServiceWorker] Recebeu mensagem em background: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', 
    vibrate: [300, 100, 400, 100, 400], 
    requireInteraction: true 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});