document.addEventListener('DOMContentLoaded', async function () {
    const API_FAVORITOS = 'https://localhost:7135/api/Favoritos';
    const API_LOCALES = 'https://localhost:7135/api/Local';

    let currentUserId = null;
    let isLoading = false;
    const favoritesMain = document.querySelector('.favorites-main');

    if (!favoritesMain) {
        console.error('Error: Elemento .favorites-main no encontrado en el DOM.');
        return;
    }

    showLoadingState();

    async function getJwtToken() {
        try {
            const res = await fetch('/Token/Obtener', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            return data?.success ? data.token : null;
        } catch {
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
        } catch {
            return null;
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
            if (!res.ok) throw new Error();
            showToast('Eliminado de favoritos');
            return true;
        } catch {
            showToast('Error al eliminar favorito', true);
            return false;
        }
    }

    function sanitize(str) {
        if (!str) return '';
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

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

  

    function renderLocalCard(local, favorito) {
        const card = document.createElement('div');
        card.className = 'local-card-column';
        card.setAttribute('data-local-id', local.id);

        const fotos = local.fotos || [];
        const firstPhoto = fotos[0] || '';
        const timeAgo = new Date(local.fechaCreacion).toLocaleDateString();

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
                        name="heart"
                        data-favorito-id="${favorito?.id || ''}"
                        style="color: crimson; cursor: pointer;">
                    </ion-icon>
                </div>
                <p class="subtitle is-7">${sanitize(local.description)}</p>
                <p><strong>Ciudad:</strong> ${sanitize(local.ciudad)}</p>
                <p><strong>Tipo:</strong> ${sanitize(local.tipo)}</p>
                <p><strong>Dirección:</strong> ${sanitize(local.direccion)}</p>
                <p><strong>Precio:</strong> $${local.costo ? sanitize(local.costo.toLocaleString()) : '0'}</p>
                <small>Publicado: ${timeAgo}</small>
            </div>
        </div>`;

        const favIcon = card.querySelector('.favorite-icon');
        favIcon.addEventListener('click', async () => {
            const favoritoId = favIcon.dataset.favoritoId;
            if (favoritoId && await eliminarFavorito(favoritoId)) {
                card.remove();
                const remaining = document.querySelectorAll('.local-card-column').length;
                if (remaining === 0) renderNoFavorites();
            }
        });

        setTimeout(() => initializeCarousel(`carousel-${local.id}`), 50);
        return card;
    }

    function renderFavoritesList(locales, favoritos) {
        favoritesMain.innerHTML = '';

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
        grid.className = 'locales-grid';

        locales.forEach(local => {
            const fav = favoritos.find(f => f.localId === local.id);
            const card = renderLocalCard(local, fav);
            if (card) grid.appendChild(card);
        });

        container.appendChild(title);
        container.appendChild(grid);
        favoritesMain.appendChild(container);
    }

    function showLoadingState() {
        favoritesMain.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"><ion-icon name="refresh-outline" class="spinner-icon"></ion-icon></div>
                <p>Cargando tus favoritos...</p>
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

    async function loadFavorites() {
        if (isLoading) return;
        isLoading = true;

        try {
            const token = await getJwtToken();
            if (!token || !currentUserId) {
                renderNoFavorites();
                return;
            }

            const resFavs = await fetch(`${API_FAVORITOS}/usuario/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resFavs.ok) throw new Error();

            const favoritos = await resFavs.json();
            if (!favoritos.length) {
                renderNoFavorites();
                return;
            }

            const localIds = favoritos.map(f => f.localId).join(',');
            const resLocales = await fetch(`${API_LOCALES}/multiple?ids=${localIds}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resLocales.ok) throw new Error();

            const locales = await resLocales.json();
            renderFavoritesList(locales, favoritos);
        } catch {
            renderNoFavorites();
        } finally {
            isLoading = false;
        }
    }

    try {
        currentUserId = await getCurrentUserId();
        await loadFavorites();
    } catch {
        renderNoFavorites();
    }
});