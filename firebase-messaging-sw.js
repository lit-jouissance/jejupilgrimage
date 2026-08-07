// FCM 백그라운드 알림 서비스워커 (사이트 루트에 두세요: /firebase-messaging-sw.js)
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

// ↓↓↓ index.html의 FIREBASE_CONFIG와 똑같은 값을 여기에도 넣어 주세요 ↓↓↓
firebase.initializeApp({
 apiKey: "AIzaSyDiUPDAipBHyfwSpbflBERYFyVLAslorJ4",
  authDomain: "jeju-pilgrimage-653d9.firebaseapp.com",
  projectId: "jeju-pilgrimage-653d9",
  storageBucket: "jeju-pilgrimage-653d9.firebasestorage.app",
  messagingSenderId: "861297947695",
  appId: "1:861297947695:web:f52e64a53da2eda4be02da"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || '순례 알림', {
    body: n.body || '',
    icon: '/icon-192.png'
  });
});
