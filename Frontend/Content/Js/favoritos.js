document.addEventListener('DOMContentLoaded', async function () {

    // ==============================
    // 🔗 URLs de la API
    // ==============================
    const API_FAVORITOS = 'https://localhost:7135/api/Favoritos';
    const API_LOCALES = 'https://localhost:7135/api/Local';

    // ==============================
    // ⚙️ Variables de estado
    // ==============================
    let currentUserId = null;
    let isLoading = false;

    // ==============================
    // 🔍 Selección del contenedor principal
    // ==============================
    const favoritesMain = document.querySelector('.favorites-main');
    if (!favoritesMain) {
        console.error('Error: Elemento .favorites-main no encontrado en el DOM.');
        return;
    }

    // Mostrar estado de carga
    showLoadingState();

    // ==============================
    // 🔐 Autenticación
    // ==============================
    async function getJwtToken() {
        try {
            const response = await fetch('/Token/Obtener', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const data = await response.json();
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
            const response = await fetch('/Token/GetUserId', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Error al obtener ID de usuario');

            return await response.text();
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
            return null;
        }
    }

    // ==============================
    // 📦 Carga y render de favoritos
    // ==============================
    async function loadFavorites() {
        if (isLoading) return;
        isLoading = true;

        try {
            const token = await getJwtToken();
            if (!token || !currentUserId) {
                renderAuthRequired();
                return;
            }

            const resFavs = await fetch(`${API_FAVORITOS}/usuario/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resFavs.ok) {
                throw new Error(resFavs.status === 404 ? 'No se encontraron favoritos' : 'Error al obtener favoritos');
            }

            const favoritos = await resFavs.json();
            if (!favoritos || favoritos.length === 0) {
                renderNoFavorites();
                return;
            }

            const localIds = [...new Set(favoritos.map(f => f.localId))].join(',');
            const resLocales = await fetch(`${API_LOCALES}/multiple?ids=${localIds}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resLocales.ok) {
                throw new Error(resLocales.status === 404 ? 'No se encontraron los locales' : 'Error al obtener detalles de locales');
            }

            const locales = await resLocales.json();
            if (!locales || locales.length === 0) {
                renderNoFavorites();
                return;
            }

            renderFavoritesList(locales);

        } catch (error) {
            console.error('Error al cargar favoritos:', error);
            renderErrorState(error.message || 'Error al cargar favoritos');
        } finally {
            isLoading = false;
        }
    }

    // ==============================
    // 🧱 Renderizado de tarjetas
    // ==============================
    function renderFavoritesList(locales) {
        const container = document.createElement('div');
        container.className = 'favorites-container';

        const title = document.createElement('div');
        title.className = 'favorites-header';
        title.innerHTML = `
            <ion-icon name="heart" class="title-icon"></ion-icon>
            <h1>Mis Locales Favoritos</h1>
            <span class="favorites-count">${locales.length} ${locales.length === 1 ? 'local' : 'locales'}</span>
        `;

        const grid = document.createElement('div');
        grid.className = 'favorites-grid';
        grid.id = 'favorites-grid';

        locales.forEach(local => {
            const card = createFavoriteCard(local);
            if (card) grid.appendChild(card);
        });

        if (grid.children.length === 0) {
            renderNoFavorites();
            return;
        }

        container.appendChild(title);
        container.appendChild(grid);
        favoritesMain.innerHTML = '';
        favoritesMain.appendChild(container);
    }

    function createFavoriteCard(local) {
        if (!local || !local.id) return null;

        const card = document.createElement('div');
        card.className = 'favorite-item';
        card.dataset.localId = local.id;

        const fotos = local.fotos || [];
        const firstPhoto = fotos[0] || '';

        const sanitize = (str) => (!str ? '' : String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;'));

        card.innerHTML = `
            <div class="favorite-image-container">
                <div class="favorite-image">
                    ${firstPhoto ?
                `<img src="${sanitize(firstPhoto)}" alt="${sanitize(local.name || 'Local')}" loading="lazy">` :
                `<div class="no-image"><ion-icon name="image"></ion-icon></div>`}
                </div>
                <button class="remove-favorite" data-local-id="${local.id}" aria-label="Eliminar de favoritos">
                    <ion-icon name="trash"></ion-icon> Eliminar
                </button>
            </div>
            <div class="favorite-info">
                <h3 class="favorite-title">${sanitize(local.name)}</h3>
                <div class="favorite-details">
                    <p class="favorite-location"><ion-icon name="location"></ion-icon> ${sanitize(local.ciudad)}, ${sanitize(local.direccion)}</p>
                    <p class="favorite-price"><ion-icon name="pricetag"></ion-icon> $${local.costo ? sanitize(local.costo.toLocaleString()) : '0'}</p>
                </div>
                <a href="/Dashboard/Local/Detalle/${local.id}" class="view-details">Ver detalles</a>
            </div>
        `;

        const removeBtn = card.querySelector('.remove-favorite');
        if (removeBtn) {
            removeBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await removeFavorite(local.id, card);
            });
        }

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-favorite') && !e.target.closest('.view-details')) {
                window.location.href = `/Dashboard/Local/Detalle/${local.id}`;
            }
        });

        return card;
    }

    // ==============================
    // 🗑️ Eliminar favoritos
    // ==============================
    async function removeFavorite(localId, cardElement) {
        if (isLoading) return;
        isLoading = true;

        try {
            const token = await getJwtToken();
            if (!token || !currentUserId) {
                showToast('Debes iniciar sesión para esta acción', true);
                return;
            }

            const res = await fetch(`${API_FAVORITOS}/usuario/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const favoritos = await res.json();
            const favorito = favoritos.find(f => f.localId === localId);
            if (!favorito) throw new Error('Favorito no encontrado');

            const deleteRes = await fetch(`${API_FAVORITOS}/${favorito.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!deleteRes.ok) {
                const errorData = await deleteRes.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar favorito');
            }

            // Animación y actualización visual
            cardElement.style.transform = 'scale(0.9)';
            cardElement.style.opacity = '0';
            setTimeout(() => {
                cardElement.remove();
                const remaining = document.querySelectorAll('.favorite-item').length;
                if (remaining === 0) renderNoFavorites();
                else {
                    const count = document.querySelector('.favorites-count');
                    if (count) count.textContent = `${remaining} ${remaining === 1 ? 'local' : 'locales'}`;
                }
            }, 300);

            showToast('Local eliminado de favoritos');

        } catch (error) {
            console.error('Error al eliminar favorito:', error);
            showToast(error.message || 'Error al eliminar favorito', true);
        } finally {
            isLoading = false;
        }
    }

    // ==============================
    // 📺 Estados visuales
    // ==============================
    function showLoadingState() {
        favoritesMain.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"><ion-icon name="refresh-outline" class="spinner-icon"></ion-icon></div>
                <p>Cargando tus favoritos...</p>
            </div>
        `;
    }

    function renderAuthRequired() {
        favoritesMain.innerHTML = `
            <div class="auth-required">
                <ion-icon name="lock-closed" class="auth-icon"></ion-icon>
                <h3>Inicia sesión para ver tus favoritos</h3>
                <a href="/Inicio/Principal" class="login-button">Iniciar sesión</a>
            </div>
        `;
    }

    function renderNoFavorites() {
        favoritesMain.innerHTML = `
            <div class="no-favorites">
                <ion-icon name="heart-dislike" class="empty-icon"></ion-icon>
                <h3>No tienes locales favoritos aún</h3>
                <p>Cuando marques locales como favoritos, aparecerán aquí</p>
                <a href="/Dashboard/Dashb" class="explore-button">Explorar locales</a>
            </div>
        `;
    }

    function renderErrorState(message) {
        favoritesMain.innerHTML = `
            <div class="error-state">
                <ion-icon name="warning" class="error-icon"></ion-icon>
                <h3>Ocurrió un error</h3>
                <p>${message}</p>
                <button class="retry-button" id="retry-button">
                    <ion-icon name="refresh"></ion-icon> Reintentar
                </button>
            </div>
        `;

        document.getElementById('retry-button')?.addEventListener('click', loadFavorites);
    }

    // ==============================
    // 🔔 Toast (Notificaciones)
    // ==============================
    function showToast(message, isError = false) {
        const existing = document.querySelector('.favorite-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `favorite-toast ${isError ? 'error' : ''}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `<ion-icon name="${isError ? 'warning' : 'checkmark'}"></ion-icon><span>${message}</span>`;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==============================
    // 🚀 Inicialización
    // ==============================
    try {
        currentUserId = await getCurrentUserId();
        await loadFavorites();
    } catch (error) {
        console.error('Error en la inicialización:', error);
        renderErrorState('Error al cargar la página');
    }
});
