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
                    <figure>
                        <div class="image-container">
                            <img src="${sanitize(url)}" alt="Imagen del local" loading="lazy">
                        </div>
                    </figure>
                `).join('')}
            </div>
            
            <button class="carousel-control-prev" data-target="carousel-${sanitize(local.id)}">
                <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
            <button class="carousel-control-next" data-target="carousel-${sanitize(local.id)}">
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
            
            <ol class="carousel-indicators" id="indicators-carousel-${sanitize(local.id)}">
                ${fotos.map((_, i) => `
                    <li class="${i === 0 ? 'active' : ''}" 
                        data-target="carousel-${sanitize(local.id)}" 
                        data-slide-to="${i}">
                    </li>
                `).join('')}
            </ol>
        </div>
    </div>
    <div class="card-content">
        <div class="media-content">
            <p class="title is-6">${sanitize(local.name)}</p>
            <ion-icon 
                class="favorite-icon" 
                name="${esFavorito ? 'heart' : 'heart-outline'}" 
                data-favorito-id="${favorito?.id || ''}">
            </ion-icon>
        </div>
        <p class="subtitle is-7">${sanitize(local.description)}</p>
        <p><strong>Ciudad:</strong> ${sanitize(local.ciudad)}</p>
        <p><strong>Tipo:</strong> ${sanitize(local.tipo)}</p>
        <p><strong>Dirección:</strong> ${sanitize(local.direccion)}</p>
        <p><strong>Precio:</strong> $${local.costo ? sanitize(local.costo.toLocaleString()) : '0'}</p>
        <small>Publicado: ${timeAgo}</small>
        <p class="subtitle is-7">Valoracion</p>
        <div class="rating-container interactive">
                    <div class="rating-stars">
                        <ion-icon name="star-outline" class="rating-star" data-value="1"></ion-icon>
                        <ion-icon name="star-outline" class="rating-star" data-value="2"></ion-icon>
                        <ion-icon name="star-outline" class="rating-star" data-value="3"></ion-icon>
                        <ion-icon name="star-outline" class="rating-star" data-value="4"></ion-icon>
                        <ion-icon name="star-outline" class="rating-star" data-value="5"></ion-icon>
                    </div>
                    <span class="rating-value">0.0</span>
                </div>
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

            // Inicializar el sistema de valoración después de renderizar
            setupStarRatings();

        } catch (error) {
            console.error('Error en init:', error);
            showToast('Error al cargar los locales', true);
        }
    }

    // ==============================
    // Función para inicializar las valoraciones
    function setupStarRatings() {
        const ratingContainers = document.querySelectorAll('.rating-container.interactive');

        ratingContainers.forEach(container => {
            const stars = container.querySelectorAll('.rating-star');
            const ratingValue = container.querySelector('.rating-value');
            let currentRating = 0;

            // Función para actualizar la visualización
            const updateStars = (rating) => {
                stars.forEach((star, index) => {
                    if (index < rating) {
                        star.classList.add('filled');
                        star.setAttribute('name', 'star');
                    } else {
                        star.classList.remove('filled');
                        star.setAttribute('name', 'star-outline');
                    }
                });
                ratingValue.textContent = rating + '.0';
            };

            // Eventos para cada estrella
            stars.forEach(star => {
                // Al hacer hover
                star.addEventListener('mouseenter', () => {
                    const value = parseInt(star.getAttribute('data-value'));
                    stars.forEach((s, idx) => {
                        if (idx < value) {
                            s.classList.add('hover');
                            s.setAttribute('name', 'star');
                        } else {
                            s.classList.remove('hover');
                            s.setAttribute('name', 'star-outline');
                        }
                    });
                });

                // Al hacer click
                star.addEventListener('click', () => {
                    currentRating = parseInt(star.getAttribute('data-value'));
                    updateStars(currentRating);
                    console.log('Valoración seleccionada:', currentRating);
                });

                // Al quitar el mouse
                star.addEventListener('mouseleave', () => {
                    updateStars(currentRating);
                });
            });

            // Inicializar con valor 0
            updateStars(0);
        });
    }

    // Llamar esta función después de renderizar las tarjetas
    document.addEventListener('DOMContentLoaded', () => {
        setupStarRatings();
    });
    



    // ==============================
    // 🟢 Ejecutar al cargar DOM
    // ==============================
    init();
});
