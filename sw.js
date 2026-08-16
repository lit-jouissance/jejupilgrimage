/* 제주 순례여권 서비스워커
   - 앱 껍데기(index.html 등)를 캐시해 인터넷 없이도 열리게 합니다.
   - 파이어베이스 백그라운드 알림도 함께 처리합니다.
   ※ 배포할 때 이 파일도 사이트 루트(/sw.js)에 함께 올려 주세요. */

var CACHE = 'jeju-pilgrim-v1';         /* 앱을 크게 바꿨을 땐 v2, v3… 으로 올리세요 */
var SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

/* 설치: 앱 껍데기를 미리 담아둡니다 (없는 파일이 있어도 넘어가도록 개별 처리) */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SHELL.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

/* 활성화: 예전 버전 캐시를 정리합니다 */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) { return caches.delete(k); }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* 가져오기 규칙:
   - 파이어베이스/알림/카카오/API 등은 항상 네트워크로 (캐시하지 않음)
   - 화면 이동(navigate)은 네트워크 우선, 실패하면 캐시된 index.html
   - 같은 사이트의 나머지 요청은 캐시 우선, 없으면 네트워크(성공 시 캐시에 저장) */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') { return; }

  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var isApi = url.pathname.indexOf('/api/') === 0;

  /* 외부(파이어베이스·카카오 등)나 API는 그냥 네트워크로 흘려보냅니다 */
  if (!sameOrigin || isApi) { return; }

  /* 화면 이동 요청: 네트워크 먼저, 안 되면 캐시된 앱을 보여줍니다 */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match('/index.html').then(function (r) {
          return r || caches.match('/');
        });
      })
    );
    return;
  }

  /* 그 외 같은 사이트 파일: 캐시 우선 */
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) { return cached; }
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
    })
  );
});

/* ↓↓↓ 파이어베이스 백그라운드 알림 ↓↓↓
   index.html의 FIREBASE_CONFIG와 똑같은 값을 아래에도 넣어 주세요. */
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

  firebase.initializeApp({
   apiKey: "AIzaSyDiUPDAipBHyfwSpbflBERYFyVLAslorJ4",
  authDomain: "jeju-pilgrimage-653d9.firebaseapp.com",
  projectId: "jeju-pilgrimage-653d9",
  storageBucket: "jeju-pilgrimage-653d9.firebasestorage.app",
  messagingSenderId: "861297947695",
  appId: "1:861297947695:web:f52e64a53da2eda4be02da"
  });

  var messaging = firebase.messaging();
  messaging.onBackgroundMessage(function (payload) {
    var n = payload.notification || {};
    self.registration.showNotification(n.title || '순례 알림', {
      body: n.body || '',
      icon: '/icon-192.png'
    });
  });
} catch (err) {
  /* 파이어베이스 설정이 아직 비어 있어도 오프라인 캐싱은 계속 동작합니다 */
}
