// public/custom-sw.js

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
  const body  = data.body || '';

  const options = {
    body,
    icon: '/icons/icon-192x192.svg',
    data, // debe traer conversation_id, etc.
  };

  event.waitUntil(
    (async () => {
      // 1) Avisar a todas las pestañas / PWA que están abiertas
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      allClients.forEach((client) => {
        client.postMessage({
          type: 'NEW_MESSAGE',               // 👈 tipo que escuchará Angular
          title,
          body,
          conversation_id: data.conversation_id || null,
          raw: data,
        });
      });

      // 2) Mostrar notificación normal (para cuando la app está en background)
      await self.registration.showNotification(title, options);
    })()
  );
});

// Click en notificación → abrir chat
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

        console.log('evento',event)

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }
    )
  );
});

