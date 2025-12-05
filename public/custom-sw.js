// public/custom-sw.js

self.addEventListener('push', (event) => {
  console.log('[SW] push event recibido:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Para tests desde DevTools (texto plano)
      console.warn('[SW] No es JSON, usando texto directo', e);
      data = { title: 'Nuevo mensaje', body: event.data.text() };
    }
  }

  // Estructura típica de FCM: { notification: { title, body }, data: {...} }
  const title =
    (data.notification && data.notification.title) ||
    data.title ||
    'Nuevo mensaje';

  const body =
    (data.notification && data.notification.body) ||
    data.body ||
    '';

  const payload = {
    title,
    body,
    conversation_id:
      (data.data && data.data.conversation_id) || data.conversation_id || '',
    sender_id:
      (data.data && data.data.sender_id) || data.sender_id || '',
    type: (data.data && data.data.type) || data.type || 'chat_message',
  };

  console.log('[SW] payload normalizado:', payload);

  // 1) Notificación del sistema (SIEMPRE)
  const showNotificationPromise = self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.svg',
    data: payload,
  });

  // 2) Avisar a todas las ventanas abiertas (para mostrar modal)
  const notifyClientsPromise = self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'PUSH_CHAT_MESSAGE',
          payload,
        });
      });
    });

  event.waitUntil(
    Promise.all([showNotificationPromise, notifyClientsPromise])
  );
});

// Click: abrir el chat
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const convId = event.notification.data?.conversation_id || '';
  const url = convId ? `/m/chat/${convId}` : '/m/chat';

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
