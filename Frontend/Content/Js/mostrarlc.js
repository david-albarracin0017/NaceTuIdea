document.addEventListener('DOMContentLoaded', async function () {

    // ==============================
    // 🔗 URLs de la API
    // ==============================
    const API_LOCALES = 'https://localhost:7135/api/Local';
    const API_FAVORITOS = 'https://localhost:7135/api/Favoritos';

    // ==============================
    // ✅ Validación de GUID
    // ==============================
    function isValidGuid(guid) {
        return typeof guid === 'string' && guid.length === 36 && guid.split('-').length === 5;
    }

    // ==============================
    // 🔐 Token y Usuario actual
    // ==============================
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

    async function getCurrentUserId() {
        const token = await getJwtToken();
        if (!token) return null;

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

    async function obtenerFavoritosUsuario(usuarioId) {
        const token = await getJwtToken();
        if (!token || !usuarioId) return [];

        try {
            const res = await fetch(`${API_FAVORITOS}/usuario/${usuarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.ok ? await res.json() : [];
        } catch (error) {
            console.error('Error al obtener favoritos del usuario:', error);
            return [];
        }
    }

    async function crearFavorito(usuarioId, localId) {
        const token = await getJwtToken();
        if (!token) {
            showToast('Debes iniciar sesión para agregar favoritos.', true);
            return;
        }

        try {
            const response = await fetch(API_FAVORITOS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ UsuarioId: usuarioId, LocalId: localId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.title || 'Error al agregar favorito');
            }

            const result = await response.json();
            console.log('Favorito creado con éxito:', result);
            showToast('Agregado a favoritos');
            return result.id;
        } catch (error) {
            console.error('Error al guardar favorito:', error);
            showToast('No se pudo guardar el favorito', true);
        }
    }

    async function eliminarFavorito(favoritoId) {
        const token = await getJwtToken();
        if (!token) return false;

        try {
            const res = await fetch(`${API_FAVORITOS}/${favoritoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('No se pudo eliminar el favorito');
            showToast('Eliminado de favoritos');
            return true;
        } catch (error) {
            console.error('Error al eliminar favorito:', error);
            showToast('Error al eliminar favorito', true);
            return false;
        }
    }

    // ==============================
    // 🔔 Toasts (notificaciones)
    // ==============================
    function showToast(message, isError = false) {
        const existingToast = document.querySelector('.favorite-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `favorite-toast ${isError ? 'error' : ''}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <ion-icon name="${isError ? 'warning' : 'checkmark'}"></ion-icon>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==============================
    // 🔐 Sanitizador de strings
    // ==============================
    function sanitize(str) {
        if (!str) return '';
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ==============================
    // 🧱 Renderizado de tarjeta de local
    // ==============================
    function renderLocalCard(local, favoritos) {
        const card = document.createElement('div');
        card.className = 'local-card-column';
        card.setAttribute('data-local-id', local.id);

        const fotos = local.fotos || [];
        const firstPhoto = fotos[0] || '';
        const timeAgo = new Date(local.fechaCreacion).toLocaleDateString();
        const favorito = favoritos.find(f => f.localId === local.id);
        const esFavorito = !!favorito;

        card.innerHTML = `
        <div class="card">
            <div class="card-image">
                <div class="carousel-container">
                    <div class="carousel" id="carousel-${sanitize(local.id)}">
                        ${fotos.map(url => `
                            <figure style="width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background-color: #f9f9f9;">
                                <img src="${sanitize(url)}" alt="Imagen del local" loading="lazy" 
                                style="max-width: 100%; max-height: 100%; object-fit: contain;">
                            </figure>
                        `).join('')}
                    </div>
                </div>
                <ol class="carousel-indicators" id="indicators-carousel-${sanitize(local.id)}">
                    ${fotos.map((_, i) => `<li data-target="carousel-${sanitize(local.id)}" data-slide-to="${i}"></li>`).join('')}
                </ol>
            </div>
            <div class="card-content">
                <div class="media-content" style="display: flex; justify-content: space-between; align-items: center;">
                    <p class="title is-6">${sanitize(local.name)}</p>
                    <ion-icon 
                        class="favorite-icon" 
                        name="${esFavorito ? 'heart' : 'heart-outline'}" 
                        data-favorito-id="${favorito?.id || ''}"
                        style="font-size: 30px; color: ${esFavorito ? 'crimson' : 'var(--subtitle-color)'}; cursor: pointer;">
                    </ion-icon>
                </div>
                <p class="subtitle is-7">${sanitize(local.description)}</p>
                <p><strong>Ciudad:</strong> ${sanitize(local.ciudad)}</p>
                <p><strong>Tipo:</strong> ${sanitize(local.tipo)}</p>
                <p><strong>Dirección:</strong> ${sanitize(local.direccion)}</p>
                <p><strong>Precio:</strong> $${local.costo ? sanitize(local.costo.toLocaleString()) : '0'}</p>
                <small>${timeAgo}</small>
            </div>
        </div>`;

        const favIcon = card.querySelector('.favorite-icon');
        favIcon.addEventListener('click', async function () {
            const icon = this;
            const isActive = icon.getAttribute('name') === 'heart';
            const userId = await getCurrentUserId();

            if (!userId) return;

            if (isActive) {
                const favoritoId = icon.dataset.favoritoId;
                if (favoritoId && await eliminarFavorito(favoritoId)) {
                    icon.setAttribute('name', 'heart-outline');
                    icon.style.color = 'var(--subtitle-color)';
                    icon.removeAttribute('data-favorito-id');
                }
            } else {
                const nuevoId = await crearFavorito(userId, local.id);
                if (nuevoId) {
                    icon.setAttribute('name', 'heart');
                    icon.style.color = 'crimson';
                    icon.dataset.favoritoId = nuevoId;
                }
            }
        });

        setTimeout(() => initializeCarousel(`carousel-${local.id}`), 50);
        return card;
    }

    // ==============================
    // 📦 Renderizado de secciones
    // ==============================
    function renderSection(title, gridId, icon, locales, favoritos) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = '';
        const section = document.createElement('div');
        section.className = 'locales-section';

        section.innerHTML = `
            <h2>
                <ion-icon name="${icon}"></ion-icon>
                <span>${title}</span>
            </h2>
        `;

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'locales-grid';

        locales.forEach(local => {
            cardsContainer.appendChild(renderLocalCard(local, favoritos));
        });

        section.appendChild(cardsContainer);
        grid.appendChild(section);
    }

    // ==============================
    // 📥 Carga de locales desde API
    // ==============================
    async function loadLocales(endpoint) {
        const token = await getJwtToken();
        if (!token) return [];

        try {
            const res = await fetch(`${API_LOCALES}/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.ok ? await res.json() : [];
        } catch (error) {
            console.error(`Error al cargar ${endpoint}:`, error);
            return [];
        }
    }

    // ==============================
    // 🚀 Inicialización principal
    // ==============================
    async function init() {
        const userId = await getCurrentUserId();
        const favoritos = userId ? await obtenerFavoritosUsuario(userId) : [];

        try {
            const [todos, recientes, recomendados] = await Promise.all([
                loadLocales('todos'),
                loadLocales('recientes'),
                loadLocales('recomendados')
            ]);

            renderSection('Todos los locales', 'albums-all-grid', 'earth-outline', todos, favoritos);
            renderSection('Publicados recientemente', 'albums-recent-grid', 'time-outline', recientes, favoritos);
            renderSection('Recomendados para ti', 'albums-recommended-grid', 'star-outline', recomendados, favoritos);

        } catch (error) {
            console.error('Error en init:', error);
            showToast('Error al cargar los locales', true);
        }
    }

    // ==============================
    // 🎠 Lógica del Carrusel
    // ==============================
    function initializeCarousel(carouselId) {
        const carousel = document.getElementById(carouselId);
        const slides = carousel?.querySelectorAll('figure') || [];
        let currentIndex = 0;

        if (!carousel || slides.length === 0) return;

        function goToSlide(index) {
            currentIndex = (index + slides.length) % slides.length;
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        goToSlide(0);
    }

    // ==============================
    // 🟢 Ejecutar al cargar DOM
    // ==============================
    init();
});
