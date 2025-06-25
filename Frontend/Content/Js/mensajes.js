document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = 'https://localhost:7135/api/Mensaje';
    let currentUserId = null;
    let currentRecipientId = null;
    let currentRecipientName = null;

    // Elementos del DOM
    const messageInput = document.getElementById('message-input');
    const messagesChat = document.querySelector('.messages-chat');
    const discussions = document.querySelector('.discussions');
    const sendButton = document.getElementById('send-button');
    const contactNameHeader = document.getElementById('chat-contact-name');
    const deleteChatBtn = document.getElementById('delete-chat');
    const emojiToggle = document.getElementById('emoji-toggle');
    const emojiPicker = document.getElementById('emoji-picker');

    // Verificación de elementos esenciales
    if (!messageInput || !messagesChat || !discussions || !sendButton || !contactNameHeader || !deleteChatBtn) {
        console.error('Elementos esenciales del chat no encontrados');
        return;
    }

    // ========= Funciones de Autenticación =========
    async function getJwtToken() {
        try {
            const res = await fetch('/Token/Obtener', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            return data?.success ? data.token : null;
        } catch (error) {
            console.error('Error al obtener token:', error);
            return null;
        }
    }

    async function getCurrentUserId(token) {
        try {
            const res = await fetch('/Token/GetUserId', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            return res.ok ? await res.text() : null;
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
            return null;
        }
    }

    // ========= Funciones de Utilidad =========
    function sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function formatTime(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.error('Error al formatear hora:', error);
            return '';
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const messageDate = new Date(date);
            messageDate.setHours(0, 0, 0, 0);

            if (messageDate.getTime() === today.getTime()) {
                return 'Hoy';
            }

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (messageDate.getTime() === yesterday.getTime()) {
                return 'Ayer';
            }

            return messageDate.toLocaleDateString();
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return '';
        }
    }

    function scrollToBottom() {
        messagesChat.scrollTop = messagesChat.scrollHeight;
    }

    // ========= Funciones de UI Helper =========
    function showLoading(container, message) {
        container.innerHTML = `
            <div class="loading-text">
                <ion-icon name="refresh-outline" class="loading-icon"></ion-icon>
                <p>${message}</p>
            </div>
        `;
    }

    function showError(container, message) {
        container.innerHTML = `
            <div class="error-text">
                <ion-icon name="warning-outline"></ion-icon>
                <p>${message}</p>
            </div>
        `;
    }

    // ========= Renderizado de Elementos =========
    function renderUserItem(user) {
        const div = document.createElement('div');
        div.className = 'discussion';
        div.setAttribute('data-user-id', user.id);

        div.innerHTML = `
            <ion-icon name="person-circle-outline" class="contact-icon"></ion-icon>
            <div class="desc-contact">
                <p class="name">${sanitize(user.name)}</p>
                <p class="message">${user.lastMessage || 'Haz clic para chatear'}</p>
            </div>
            <div class="timer">${formatDate(user.lastMessageDate)}</div>
        `;

        div.addEventListener('click', () => {
            document.querySelectorAll('.discussion').forEach(el => {
                el.classList.remove('active');
            });
            div.classList.add('active');
            loadConversationWithUser(user);
        });

        return div;
    }

    function renderMessage(msg) {
        const isMine = msg.remitenteId === currentUserId;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message${isMine ? ' response' : ''}`;

        msgDiv.innerHTML = `
            ${!isMine ? `<ion-icon name="person-circle-outline" class="message-icon"></ion-icon>` : ''}
            <div class="text">
                ${sanitize(msg.contenido)}
                <div class="time">${formatTime(msg.fecha)} • ${formatDate(msg.fecha)}</div>
            </div>
        `;

        return msgDiv;
    }

    // ========= Funciones de Carga de Datos =========
    async function loadConversationUsers() {
        try {
            const token = await getJwtToken();
            if (!token) {
                showError(discussions, 'Error de autenticación');
                return [];
            }

            const res = await fetch(`${API_BASE}/usuarios-conversacion`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                showError(discussions, 'Error al cargar contactos');
                return [];
            }

            const data = await res.json();
            return data || [];
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            showError(discussions, 'Error de conexión');
            return [];
        }
    }

    async function loadConversationWithUser(user) {
        try {
            currentRecipientId = user.id;
            currentRecipientName = user.name;
            contactNameHeader.textContent = sanitize(user.name || 'Usuario');

            showLoading(messagesChat, 'Cargando conversación...');

            const token = await getJwtToken();
            if (!token) {
                showError(messagesChat, 'Error de autenticación');
                return;
            }

            const res = await fetch(`${API_BASE}/conversacion/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                showError(messagesChat, 'Error al cargar la conversación');
                return;
            }

            const messages = await res.json();
            renderMessages(messages);
        } catch (error) {
            console.error('Error cargando conversación:', error);
            showError(messagesChat, 'Error de conexión');
        }
    }

    function renderMessages(messages) {
        messagesChat.innerHTML = '';

        if (messages.length === 0) {
            messagesChat.innerHTML = `
                <div class="empty-chat">
                    <ion-icon name="chatbubbles-outline"></ion-icon>
                    <p>No hay mensajes</p>
                    <small>Envía un mensaje para iniciar la conversación</small>
                </div>
            `;
            return;
        }

        messages.forEach(msg => messagesChat.appendChild(renderMessage(msg)));
        scrollToBottom();
    }

    // ========= Funciones de Interacción =========
    async function sendMessage() {
        const content = messageInput.value.trim();
        if (!content) {
            messageInput.focus();
            return;
        }

        if (!currentRecipientId) {
            showError(messagesChat, 'Selecciona un contacto primero');
            return;
        }

        const token = await getJwtToken();
        if (!token || !currentUserId) {
            showError(messagesChat, 'Error de autenticación');
            return;
        }

        try {
            // Mostrar mensaje localmente inmediatamente
            const tempMessage = {
                id: 'temp-' + Date.now(),
                contenido: content,
                remitenteId: currentUserId,
                destinatarioId: currentRecipientId,
                fecha: new Date().toISOString(),
                remitenteNombre: 'Tú',
                destinatarioNombre: currentRecipientName
            };

            messagesChat.appendChild(renderMessage(tempMessage));
            scrollToBottom();
            messageInput.value = '';

            // Enviar al servidor
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contenido: content,
                    destinatarioId: currentRecipientId
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al enviar mensaje');
            }

            // Recargar la conversación para obtener el mensaje real con ID
            await loadConversationWithUser({
                id: currentRecipientId,
                name: currentRecipientName,
                lastMessage: content,
                lastMessageDate: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            showError(messagesChat, 'Error al enviar mensaje');
            await loadConversationWithUser({
                id: currentRecipientId,
                name: currentRecipientName
            });
        }
    }

    async function deleteConversation() {
        if (!currentRecipientId) {
            showError(messagesChat, 'No hay conversación seleccionada');
            return;
        }

        const token = await getJwtToken();
        if (!token) {
            showError(messagesChat, 'Error de autenticación');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/eliminar-conversacion/${currentRecipientId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar');
            }

            // Limpiar la interfaz
            messagesChat.innerHTML = `
                <div class="empty-chat">
                    <ion-icon name="chatbubbles-outline"></ion-icon>
                    <p>Conversación eliminada</p>
                </div>
            `;
            contactNameHeader.textContent = 'Selecciona un contacto';
            currentRecipientId = null;
            currentRecipientName = null;

            // Recargar la lista de conversaciones
            await initialize();
        } catch (error) {
            console.error('Error al eliminar conversación:', error);
            showError(messagesChat, 'Error al eliminar conversación');
        }
    }

    // ========= Inicialización del Emoji Picker =========
    
    function initEmojiPicker() {
        if (!emojiToggle || !emojiPicker) return;

        // Asegurarse de que el picker está inicializado
        if (!window.EmojiPickerElement) {
            console.error('EmojiPickerElement no está disponible');
            return;
        }

        emojiToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (e.target !== emojiToggle && !emojiPicker.contains(e.target)) {
                emojiPicker.style.display = 'none';
            }
        });

        emojiPicker.addEventListener('emoji-click', event => {
            messageInput.value += event.detail.unicode;
            messageInput.focus();
        });
    }

    // ========= Inicialización de la Aplicación =========
    async function initialize() {
        const token = await getJwtToken();
        if (!token) {
            showError(discussions, 'No autenticado. Recarga la página.');
            return;
        }

        currentUserId = await getCurrentUserId(token);
        if (!currentUserId) {
            showError(discussions, 'Error al cargar tu usuario.');
            return;
        }

        try {
            const usuarios = await loadConversationUsers();
            discussions.innerHTML = '';

            if (usuarios.length === 0) {
                discussions.innerHTML = `
                    <div class="empty-discussions">
                        <ion-icon name="people-outline"></ion-icon>
                        <p>No tienes conversaciones</p>
                        <small>Inicia una nueva conversación</small>
                    </div>
                `;
                return;
            }

            usuarios.forEach(user => discussions.appendChild(renderUserItem(user)));
        } catch (error) {
            console.error('Error al inicializar:', error);
            showError(discussions, 'Error al cargar contactos');
        }
    }

    // ========= Event Listeners =========
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    deleteChatBtn.addEventListener('click', deleteConversation);

    // Ajustar altura del textarea dinámicamente
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = `${Math.min(messageInput.scrollHeight, 100)}px`;
    });
    async function waitForEmojiPicker() {
        for (let i = 0; i < 10; i++) {
            if (window.EmojiPickerElement) {
                initEmojiPicker();
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.warn('EmojiPickerElement no se cargó a tiempo');
    }


    // Inicialización
    await waitForEmojiPicker();
    initialize();
});


