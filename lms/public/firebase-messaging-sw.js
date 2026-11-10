// This public configuration comes from the same build-time settings as the app.
let firebaseConfig = null;
try {
  firebaseConfig = JSON.parse(new URL(self.location.href).searchParams.get('config') || 'null');
} catch {
  // An unconfigured worker stays inactive instead of initializing placeholders.
}

if (firebaseConfig && ['apiKey', 'projectId', 'messagingSenderId', 'appId'].every(
  (key) => typeof firebaseConfig[key] === 'string' && firebaseConfig[key] && !/^x+$/i.test(firebaseConfig[key])
)) {
  importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
  firebase.initializeApp(firebaseConfig);
  firebase.messaging();

  self.addEventListener('push', function (event) {
    const payload = event.data?.json();
    if (!payload?.data?.title) return;
    event.waitUntil(self.registration.showNotification(payload.data.title, {
      body: payload.data.body || payload.data.title,
      icon: payload.data.image || undefined,
    }));
  });
}
