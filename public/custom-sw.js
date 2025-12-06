// public/custom-sw.js
//importScripts('./ngsw-worker.js');

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
    data: data,
  };

  // 1) Mostrar notificación del sistema
  event.waitUntil(self.registration.showNotification(title, options));

  // 2) Avisar a las pestañas abiertas (para modal / refrescar chat)
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'PUSH_MESSAGE',
            title,
            body: options.body,
            conversation_id: data.conversation_id || null,
          });
        });
      })
  );
});

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
