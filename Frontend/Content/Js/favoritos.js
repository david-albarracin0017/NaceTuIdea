document.addEventListener('DOMContentLoaded', async function () {
    // URLs de la API
    const API_FAVORITOS = 'https://localhost:7135/api/Favoritos';
    const API_LOCALES = 'https://localhost:7135/api/Local';

    // Variables de estado
    let currentUserId = null;
    let isLoading = false;

    // Elementos del DOM
    const favoritesMain = document.querySelector('.favorites-main');

    // Verificar que el elemento principal existe
    if (!favoritesMain) {
        console.error('Error: No se encontró el elemento .favorites-main');
        return;
    }

    // Mostrar estado de carga inicial
    showLoadingState();

    // Función para obtener el token JWT
    async function getJwtToken() {
        try {
            const response = await fetch('/Token/Obtener', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            return data?.success ? data.token : null;
        } catch (error) {
            console.error('Error al obtener token:', error);
            return null;
        }
    }

    // Función para obtener el ID del usuario actual
    async function getCurrentUserId() {
        const token = await getJwtToken();
        if (!token) return null;

        try {
            const response = await fetch('/Token/GetUserId', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            return response.ok ? await response.text() : null;
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
            return null;
        }
    }

    // Función principal para cargar favoritos
    async function loadFavorites() {
        if (isLoading) return;
        isLoading = true;

        try {
            const token = await getJwtToken();

            // Verificar autenticación
            if (!token || !currentUserId) {
                renderAuthRequired();
                return;
            }

            // Obtener lista de favoritos del usuario
            const favoritesResponse = await fetch(`${API_FAVORITOS}/usuario/${currentUserId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!favoritesResponse.ok) {
                throw new Error('Error al obtener favoritos');
            }

            const favoritos = await favoritesResponse.json();

            // Manejar caso sin favoritos
            if (favoritos.length === 0) {
                renderNoFavorites();
                return;
            }

            // Obtener detalles de los locales favoritos
            const localIds = favoritos.map(f => f.localId).join(',');
            const localesResponse = await fetch(`${API_LOCALES}/multiple?ids=${localIds}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!localesResponse.ok) {
                throw new Error('Error al obtener detalles de locales');
            }

            const locales = await localesResponse.json();
            renderFavoritesList(locales);

        } catch (error) {
            console.error('Error al cargar favoritos:', error);
            renderErrorState(error.message || 'Error al cargar favoritos');
        } finally {
            isLoading = false;
        }
    }

    // Función para mostrar el estado de carga
    function showLoadingState() {
        favoritesMain.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">
                    <ion-icon name="refresh-outline" class="spinner-icon"></ion-icon>
                </div>
                <p>Cargando tus favoritos...</p>
            </div>
        `;
    }

    // Función para mostrar que se requiere autenticación
    function renderAuthRequired() {
        favoritesMain.innerHTML = `
            <div class="auth-required">
                <ion-icon name="lock-closed" class="auth-icon"></ion-icon>
                <h3>Inicia sesión para ver tus favoritos</h3>
                <a href="/Inicio/Principal" class="login-button">Iniciar sesión</a>
            </div>
        `;
    }

    // Función para mostrar lista vacía
    function renderNoFavorites() {
        favoritesMain.innerHTML = `
            <div class="no-favorites">
                <ion-icon name="heart-dislike" class="empty-icon"></ion-icon>
                <h3>No tienes locales favoritos aún</h3>
                <p>Cuando marques locales como favoritos, aparecerán aquí</p>
                <a href="/Dashboard/Local" class="explore-button">Explorar locales</a>
            </div>
        `;
    }

    // Función para mostrar estado de error
    function renderErrorState(message) {
        favoritesMain.innerHTML = `
            <div class="error-state">
                <ion-icon name="warning" class="error-icon"></ion-icon>
                <h3>Ocurrió un error</h3>
                <p>${message}</p>
                <button class="retry-button" id="retry-button">
                    <ion-icon name="refresh"></ion-icon>
                    Reintentar
                </button>
            </div>
        `;

        // Agregar evento al botón de reintentar
        document.getElementById('retry-button')?.addEventListener('click', loadFavorites);
    }

    // Función para renderizar la lista de favoritos
    function renderFavoritesList(locales) {
        // Crear contenedor principal
        const container = document.createElement('div');
        container.className = 'favorites-container';

        // Crear título
        const titleElement = document.createElement('div');
        titleElement.className = 'favorites-header';
        titleElement.innerHTML = `
            <ion-icon name="heart" class="title-icon"></ion-icon>
            <h1>Mis Locales Favoritos</h1>
            <span class="favorites-count">${locales.length} locales</span>
        `;

        // Crear grid de favoritos
        const gridElement = document.createElement('div');
        gridElement.className = 'favorites-grid';
        gridElement.id = 'favorites-grid';

        // Agregar locales al grid
        locales.forEach(local => {
            gridElement.appendChild(createFavoriteCard(local));
        });

        // Ensamblar todo
        container.appendChild(titleElement);
        container.appendChild(gridElement);

        // Limpiar y mostrar
        favoritesMain.innerHTML = '';
        favoritesMain.appendChild(container);
    }

    // Función para crear una tarjeta de favorito
    function createFavoriteCard(local) {
        const card = document.createElement('div');
        card.className = 'favorite-item';
        card.dataset.localId = local.id;

        // Obtener la primera foto o mostrar placeholder
        const fotos = local.fotos || [];
        const firstPhoto = fotos[0] || '';

        card.innerHTML = `
            <div class="favorite-image-container">
                <div class="favorite-image">
                    ${firstPhoto ?
                `<img src="${firstPhoto}" alt="${local.name}" loading="lazy">` :
                `<div class="no-image">
                            <ion-icon name="image"></ion-icon>
                        </div>`
            }
                </div>
                <button class="remove-favorite" data-local-id="${local.id}">
                    <ion-icon name="trash"></ion-icon>
                </button>
            </div>
            <div class="favorite-info">
                <h3 class="favorite-title">${local.name}</h3>
                <div class="favorite-details">
                    <p class="favorite-location">
                        <ion-icon name="location"></ion-icon>
                        ${local.ciudad}, ${local.direccion}
                    </p>
                    <p class="favorite-price">
                        <ion-icon name="pricetag"></ion-icon>
                        $${local.costo.toLocaleString()}
                    </p>
                </div>
                <a href="/Dashboard/Local/Detalle/${local.id}" class="view-details">
                    Ver detalles
                </a>
            </div>
        `;

        // Agregar evento al botón de eliminar
        const removeBtn = card.querySelector('.remove-favorite');
        removeBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await removeFavorite(local.id, card);
        });

        // Agregar evento para hacer clic en la tarjeta
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-favorite')) {
                window.location.href = `/Dashboard/Local/Detalle/${local.id}`;
            }
        });

        return card;
    }

    // Función para eliminar un favorito
    async function removeFavorite(localId, cardElement) {
        if (isLoading) return;
        isLoading = true;

        try {
            const token = await getJwtToken();
            if (!token || !currentUserId) {
                showToast('Debes iniciar sesión para esta acción', true);
                return;
            }

            // Obtener el ID del favorito
            const favRes = await fetch(`${API_FAVORITOS}/usuario/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!favRes.ok) throw new Error('Error al buscar favoritos');

            const favoritos = await favRes.json();
            const favorito = favoritos.find(f => f.localId === localId);

            if (!favorito) {
                throw new Error('Favorito no encontrado');
            }

            // Eliminar el favorito
            const deleteRes = await fetch(`${API_FAVORITOS}/${favorito.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!deleteRes.ok) {
                const errorData = await deleteRes.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar favorito');
            }

            // Eliminar la tarjeta con animación
            cardElement.style.transform = 'scale(0.9)';
            cardElement.style.opacity = '0';
            setTimeout(() => {
                cardElement.remove();

                // Verificar si quedan favoritos
                const remainingFavorites = document.querySelectorAll('.favorite-item').length;
                if (remainingFavorites === 0) {
                    renderNoFavorites();
                } else {
                    // Actualizar contador
                    const countElement = document.querySelector('.favorites-count');
                    if (countElement) {
                        countElement.textContent = `${remainingFavorites} locales`;
                    }
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

    // Función para mostrar notificaciones toast
    function showToast(message, isError = false) {
        // Evitar múltiples toasts
        const existingToast = document.querySelector('.favorite-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `favorite-toast ${isError ? 'error' : ''}`;
        toast.innerHTML = `
            <ion-icon name="${isError ? 'warning' : 'checkmark'}"></ion-icon>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Mostrar y ocultar con animación
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Inicialización
    try {
        currentUserId = await getCurrentUserId();
        await loadFavorites();
    } catch (error) {
        console.error('Error en la inicialización:', error);
        renderErrorState('Error al cargar la página');
    }
});