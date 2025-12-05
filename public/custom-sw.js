// public/custom-sw.js

// 1) Manejar los PUSH que manda FCM
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Nuevo mensaje', body: event.data.text() };
    }
  }

  const title = data.title || 'Nuevo mensaje';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.svg',
    data: data, // debe traer conversation_id, etc.
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2) Click en la notificación → abrir chat
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = '/m/chat/' + (event.notification.data?.conversation_id || '');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(
      (clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }
    )
  );
});
