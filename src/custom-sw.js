// 1) Importa el service worker de Angular (ngsw-worker.js)
importScripts('./ngsw-worker.js');

// 2) Tu lógica de push

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
    data: data, // debe incluir, por ejemplo, { conversation_id: '...' }
  };

  // Mostrar notificación
  event.waitUntil(self.registration.showNotification(title, options));

  // Avisar a clientes abiertos para refrescar el chat
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      allClients.forEach((client) => {
        client.postMessage({
          type: 'NEW_MESSAGE',
          conversation_id: data.conversation_id,
        });
      });
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const convId = event.notification.data?.conversation_id;
  const url = convId ? `/m/chat/${convId}` : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
