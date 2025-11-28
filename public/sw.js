// public/sw.js o src/sw.js según tu build
self.addEventListener('push', function (event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || 'Nuevo mensaje';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.svg',
    data: data, // para usar luego en click
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
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
