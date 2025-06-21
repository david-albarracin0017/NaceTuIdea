document.addEventListener('DOMContentLoaded', async function () {
    const API_LOCALES = 'https://localhost:7135/api/Local';
    let currentUserId = null;

    // Sistema de favoritos simplificado (solo frontend)
    let userFavorites = JSON.parse(localStorage.getItem('userFavorites')) || [];

    // Función para actualizar el icono de favorito
    function updateFavoriteIcon(button, localId) {
        const isFav = userFavorites.includes(localId);
        button.setAttribute('name', isFav ? 'heart' : 'heart-outline');
        button.style.color = isFav ? 'var(--primary-color)' : 'var(--subtitle-color)';
    }

    // Función para alternar favoritos (solo frontend)
    function toggleFavorite(localId, button) {
        const isFav = userFavorites.includes(localId);

        if (isFav) {
            // Remover de favoritos
            userFavorites = userFavorites.filter(id => id !== localId);
            showToast('Local removido de favoritos');
        } else {
            // Agregar a favoritos
            userFavorites.push(localId);
            showToast('Local agregado a favoritos');
        }

        // Actualizar localStorage y UI
        localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
        updateFavoriteIcon(button, localId);
    }

    // Función para mostrar notificaciones
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `favorite-toast ${isError ? 'error' : ''}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }, 10);
    }

    // Función para renderizar una tarjeta de local
    function renderLocalCard(local) {
        const card = document.createElement('div');
        card.className = 'local-card-column';
        card.setAttribute('data-local-id', local.id);

        const fotos = local.fotos || [];
        const images = fotos.map(url => `
            <figure>
                <img src="${url}" alt="Imagen del local" style="width: 100%; height: 100%; object-fit: contain;">
            </figure>
        `).join('');

        const timeAgo = new Date(local.fechaCreacion).toLocaleDateString();

        card.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <div class="carousel-container">
                        <div class="carousel" id="carousel-${local.id}">
                            ${images}
                        </div>
                    </div>
                    <div class="carousel-controls">
                        <button class="carousel-control-prev" data-target="carousel-${local.id}">
                            <ion-icon name="chevron-back-outline"></ion-icon>
                        </button>
                        <button class="carousel-control-next" data-target="carousel-${local.id}">
                            <ion-icon name="chevron-forward-outline"></ion-icon>
                        </button>
                    </div>
                    <ol class="carousel-indicators" id="indicators-carousel-${local.id}">
                        ${fotos.map((_, i) => `<li data-target="carousel-${local.id}" data-slide-to="${i}"></li>`).join('')}
                    </ol>
                </div>
                <div class="card-content">
                    <div class="media-content">
                        <p class="title is-6">${local.name}</p>
                        <ion-icon class="favorite-btn" name="heart-outline" data-local-id="${local.id}"></ion-icon>
                        <p class="subtitle is-7">${local.description}</p>
                    </div>
                    <div class="content">
                        <p><strong>Ciudad:</strong> ${local.ciudad}</p>
                        <p><strong>Tipo:</strong> ${local.tipo}</p>
                        <p><strong>Dirección:</strong> ${local.direccion}</p>
                        <p><strong>Precio:</strong> $${local.costo.toLocaleString()}</p>
                        <small>${timeAgo}</small>
                    </div>
                </div>
            </div>`;

        const favBtn = card.querySelector('.favorite-btn');
        if (favBtn) {
            updateFavoriteIcon(favBtn, local.id);
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(local.id, favBtn);
            });
        }

        // Inicializar el carrusel después de un pequeño retraso
        setTimeout(() => {
            initializeCarousel(`carousel-${local.id}`);
        }, 50);

        return card;
    }

    // Función para renderizar una sección de locales
    function renderSection(title, gridId, icon, locales) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        // Limpiar el grid
        grid.innerHTML = '';

        // Crear contenedor de sección
        const section = document.createElement('div');
        section.className = 'locales-section';

        // Crear título de sección
        const titleElement = document.createElement('h2');
        titleElement.innerHTML = `
            <ion-icon name="${icon}"></ion-icon>
            <span>${title}</span>
        `;

        // Crear contenedor de tarjetas
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'locales-grid';

        // Agregar locales al contenedor
        locales.forEach(local => {
            cardsContainer.appendChild(renderLocalCard(local));
        });

        // Ensamblar la sección
        section.appendChild(titleElement);
        section.appendChild(cardsContainer);
        grid.appendChild(section);
    }

    // Función para obtener el token JWT
    async function getJwtToken() {
        try {
            const res = await fetch('/Token/Obtener', { method: 'GET', credentials: 'include' });
            const data = await res.json();
            return data?.success ? data.token : null;
        } catch {
            console.error('Error al obtener token');
            return null;
        }
    }

    // Función para obtener el ID de usuario
    async function getCurrentUserId() {
        const token = await getJwtToken();
        if (!token) return null;
        const res = await fetch('/Token/GetUserId', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        return res.ok ? await res.text() : null;
    }

    // Función para cargar locales
    async function loadLocales(endpoint) {
        const token = await getJwtToken();
        if (!token) return [];

        try {
            const res = await fetch(`${API_LOCALES}/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Error al cargar ${endpoint}`);
            return await res.json();
        } catch (error) {
            console.error(`Error al cargar ${endpoint}:`, error);
            return [];
        }
    }

    // Función de inicialización
    async function init() {
        currentUserId = await getCurrentUserId();

        try {
            // Cargar todas las secciones en paralelo
            const [todos, recientes, recomendados] = await Promise.all([
                loadLocales('todos'),
                loadLocales('recientes'),
                loadLocales('recomendados')
            ]);

            // Renderizar las secciones
            renderSection('Todos los locales', 'albums-all-grid', 'earth-outline', todos);
            renderSection('Publicados recientemente', 'albums-recent-grid', 'time-outline', recientes);
            renderSection('Recomendados para ti', 'albums-recommended-grid', 'star-outline', recomendados);

        } catch (error) {
            console.error('Error en init:', error);
            showToast('Error al cargar los locales', true);
        }
    }

    // ------------------------- CARRUSEL DE IMÁGENES -------------------------
    function initializeCarousel(carouselId) {
        const carousel = document.getElementById(carouselId);
        const slides = carousel ? carousel.querySelectorAll('figure') : [];
        const slideCount = slides.length;
        let currentIndex = 0;
        let autoSlideInterval;

        const nextButton = document.querySelector(`.carousel-control-next[data-target="${carouselId}"]`);
        const prevButton = document.querySelector(`.carousel-control-prev[data-target="${carouselId}"]`);
        const indicators = document.querySelectorAll(`#indicators-${carouselId} li`);

        if (!carousel || slideCount === 0) return;

        function updateIndicators() {
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = (index < 0) ? slideCount - 1 :
                (index >= slideCount) ? 0 : index;

            carousel.style.transform = `translateX(${-currentIndex * 100}%)`;
            updateIndicators();
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
            resetAutoSlide();
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
            resetAutoSlide();
        }

        function startAutoSlide(interval = 5000) {
            autoSlideInterval = setInterval(nextSlide, interval);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        if (nextButton) nextButton.addEventListener('click', nextSlide);
        if (prevButton) prevButton.addEventListener('click', prevSlide);

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                resetAutoSlide();
            });
        });

        // Iniciar
        startAutoSlide();
        goToSlide(0);
    }

    init();
});