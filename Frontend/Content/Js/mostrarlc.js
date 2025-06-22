document.addEventListener('DOMContentLoaded', async function () {

    // ==============================
    // 🔗 URLs de la API
    // ==============================
    const API_LOCALES = 'https://localhost:7135/api/Local';

    // ==============================
    // ✅ Validación de GUID
    // ==============================
    function isValidGuid(guid) {
        if (typeof guid !== 'string') return false;
        return guid.length === 36 && guid.split('-').length === 5;
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
    function renderLocalCard(local) {
        const card = document.createElement('div');
        card.className = 'local-card-column';

        if (!local.id || typeof local.id !== 'string') {
            console.error('ID de local inválido:', local.id);
            return;
        }

        card.setAttribute('data-local-id', local.id);
        const fotos = local.fotos || [];
        const images = fotos.map(url => `
         <figure style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f9f9f9;">
             <img src="${sanitize(url)}" alt="Imagen del local" loading="lazy" style="max-width: 100%; max-height: 100%; object-fit: contain;">
         </figure>
        `).join('');


        const timeAgo = new Date(local.fechaCreacion).toLocaleDateString();

        card.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <div class="carousel-container">
                        <div class="carousel" id="carousel-${sanitize(local.id)}">
                            ${images}
                        </div>
                    </div>
                    <div class="carousel-controls">
                        <button class="carousel-control-prev" data-target="carousel-${sanitize(local.id)}">
                            <ion-icon name="chevron-back-outline"></ion-icon>
                        </button>
                        <button class="carousel-control-next" data-target="carousel-${sanitize(local.id)}">
                            <ion-icon name="chevron-forward-outline"></ion-icon>
                        </button>
                    </div>
                    <ol class="carousel-indicators" id="indicators-carousel-${sanitize(local.id)}">
                        ${fotos.map((_, i) => `<li data-target="carousel-${sanitize(local.id)}" data-slide-to="${i}"></li>`).join('')}
                    </ol>
                </div>
                <div class="card-content">
                    <div class="media-content" style="display: flex; justify-content: space-between; align-items: center;">
                        <p class="title is-6" style="margin: 0;">${sanitize(local.name)}</p>
                        <ion-icon class="favorite-icon" name="heart-outline" style="font-size: 30px; color: var(--subtitle-color); cursor: pointer;"onclick="this.setAttribute('name', this.getAttribute('name') === 'heart' ? 'heart-outline' : 'heart');this.style.color = this.getAttribute('name') === 'heart' ? 'crimson' : 'var(--subtitle-color)';">
                        </ion-icon>
                    </div>
                    <p class="subtitle is-7">${sanitize(local.description)}</p>
                    <div class="content">
                        <p><strong>Ciudad:</strong> ${sanitize(local.ciudad)}</p>
                        <p><strong>Tipo:</strong> ${sanitize(local.tipo)}</p>
                        <p><strong>Dirección:</strong> ${sanitize(local.direccion)}</p>
                        <p><strong>Precio:</strong> $${local.costo ? sanitize(local.costo.toLocaleString()) : '0'}</p>
                        <small>${timeAgo}</small>
                        <!-- ⭐⭐⭐⭐⭐ Sistema de valoración -->
                        <p class="subtitle is-7">Valoracion</p>
                    <div class="star-rating" style="display: flex; gap: 4px; margin-top: 4px;">
                         ${[1, 2, 3, 4, 5].map(i => `

                        <ion-icon 
                        name="star-outline" 
                        data-value="${i}" 
                        style="font-size: 18px; cursor: pointer; color: gold;"
                        onclick="
                        const parent = this.parentNode;
                        const stars = parent.querySelectorAll('ion-icon');
                        stars.forEach((s, idx) => {
                        s.setAttribute('name', idx < ${i} ? 'star' : 'star-outline');
                        });
                        ">
                        </ion-icon>
                         `).join('')}
                    </div>
                    </div>
                </div>
            </div>`;

        setTimeout(() => {
            initializeCarousel(`carousel-${local.id}`);
        }, 50);

        return card;
    }

    // ==============================
    // 📦 Renderizado de secciones
    // ==============================
    function renderSection(title, gridId, icon, locales) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = '';

        const section = document.createElement('div');
        section.className = 'locales-section';

        const titleElement = document.createElement('h2');
        titleElement.innerHTML = `
            <ion-icon name="${icon}"></ion-icon>
            <span>${title}</span>
        `;

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'locales-grid';

        locales.forEach(local => {
            cardsContainer.appendChild(renderLocalCard(local));
        });

        section.appendChild(titleElement);
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
            if (!res.ok) throw new Error(`Error al cargar ${endpoint}`);
            return await res.json();
        } catch (error) {
            console.error(`Error al cargar ${endpoint}:`, error);
            return [];
        }
    }

    // ==============================
    // 🚀 Inicialización principal
    // ==============================
    async function init() {
        const currentUserId = await getCurrentUserId();

        try {
            const [todos, recientes, recomendados] = await Promise.all([
                loadLocales('todos'),
                loadLocales('recientes'),
                loadLocales('recomendados')
            ]);

            renderSection('Todos los locales', 'albums-all-grid', 'earth-outline', todos);
            renderSection('Publicados recientemente', 'albums-recent-grid', 'time-outline', recientes);
            renderSection('Recomendados para ti', 'albums-recommended-grid', 'star-outline', recomendados);

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

        startAutoSlide();
        goToSlide(0);
    }

    // ==============================
    // 🟢 Ejecutar al cargar DOM
    // ==============================
    init();
});
