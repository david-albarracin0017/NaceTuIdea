document.addEventListener('DOMContentLoaded', () => {
  const picker = document.getElementById('emoji-picker');
  const toggle = document.getElementById('emoji-toggle');
  const input = document.getElementById('message-input');

  toggle.addEventListener('click', () => {
    picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
  });

  picker.addEventListener('emoji-click', (event) => {
    input.value += event.detail.unicode;
    input.focus();
  });

  document.addEventListener('click', (e) => {
    if (!picker.contains(e.target) && e.target !== toggle) {
      picker.style.display = 'none';
    }
  });
});

// === mensajes.js completo e integrado ===
const apiBase = 'https://localhost:7135/api/Mensaje';
let userId = null;
let usuarioActivoId = null;

// === Obtener token desde la cookie ===
function getToken() {
  const match = document.cookie.match(/jwt_token=([^;]+)/);
  return match ? match[1] : null;
}

// === Obtener ID del usuario actual desde backend ===
async function obtenerUserId() {
  const res = await fetch('/Token/GetUserId');
  if (!res.ok) throw new Error('No se pudo obtener el ID de usuario');
  userId = await res.text();
}

// === Cargar lista de usuarios con los que hay conversación ===
async function cargarUsuarios() {
  const res = await fetch(`${apiBase}/usuarios-conversacion`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const usuarios = await res.json();
  const panel = document.querySelector('.discussions');
  panel.innerHTML = '';

  usuarios.forEach(user => {
    const div = document.createElement('div');
    div.classList.add('discussion');
    div.innerHTML = `
      <div class="photo" style="background-image: url(/img/default.png);"></div>
      <div class="desc-contact">
        <p class="name">${user.nombre || user.email || 'Usuario'}</p>
        <p class="message">Haz clic para ver</p>
      </div>
      <div class="timer">...</div>
    `;
    div.addEventListener('click', () => {
      usuarioActivoId = user.id;
      cargarConversacionCon(user.id);
    });
    panel.appendChild(div);
  });
}

// === Cargar mensajes con un usuario específico ===
async function cargarConversacionCon(destinatarioId) {
  const res = await fetch(`${apiBase}/conversacion/${destinatarioId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const mensajes = await res.json();
  const contenedor = document.querySelector('.messages-chat');
  contenedor.innerHTML = '';

  mensajes.forEach(mensaje => {
    const isYo = mensaje.remitenteId === userId;
    const clase = isYo ? 'message response' : 'message';
    contenedor.insertAdjacentHTML('beforeend', `
      <div class="${clase}">
        <p class="text">${mensaje.contenido}</p>
      </div>
    `);
  });
}

// === Enviar mensaje al usuario activo ===
async function enviarMensaje() {
  const input = document.getElementById('message-input');
  const contenido = input.value.trim();
  if (!contenido || !userId || !usuarioActivoId) return;

  const res = await fetch(apiBase, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      contenido,
      remitenteId: userId,
      destinatarioId: usuarioActivoId
    })
  });

  if (res.ok) {
    input.value = '';
    cargarConversacionCon(usuarioActivoId);
  } else {
    console.error('Error al enviar mensaje');
  }
}

// === Inicializar app ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('ion-icon[name="send-outline"]').addEventListener('click', enviarMensaje);
  obtenerUserId().then(() => {
    cargarUsuarios();
  });
});
