document.addEventListener('DOMContentLoaded', async function () {
    // Definimos las URLs base de nuestras APIs.
    // Asegúrate de que estas URLs coincidan con las de tu backend.
    const API_LOCALES = 'https://localhost:7135/api/Local';
    const API_FAVORITOS = 'https://localhost:7135/api/Favoritos'; // Endpoint para la gestión de favoritos

    // Versión simplificada de validación de GUID
    function isValidGuid(guid) {
        if (typeof guid !== 'string') return false;
        return guid.length === 36 && guid.split('-').length === 5;
    }

    let currentUserId = null; // Almacenará el ID del usuario logueado.
    // userFavorites ahora almacena solo los 'localId' de los locales que el usuario tiene como favoritos.
    // Esta lista se carga desde el backend al inicio.
    let userFavorites = [];

    /**
     * @brief Función para obtener el token JWT desde el backend.
     * @returns {string|null} El token JWT si la operación es exitosa, de lo contrario null.
     */
    async function getJwtToken() {
        try {
            const res = await fetch('/Token/Obtener', {
                method: 'GET',
                credentials: 'include' // Importante para enviar cookies de sesión (si usas autenticación basada en cookies con JWT)
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

    /**
     * @brief Carga la lista de favoritos del usuario actual desde el backend.
     * Esta función es crucial para inicializar el estado de los iconos de favorito al cargar la página.
     */
    async function fetchUserFavorites() {
        // Si no hay un ID de usuario, la lista de favoritos está vacía.
        if (!currentUserId) {
            userFavorites = [];
            return;
        }
        const token = await getJwtToken();
        if (!token) { // Si no hay token, el usuario no está autenticado, por lo tanto, no tiene favoritos cargados.
            userFavorites = [];
            return;
        }

        try {
            // Realizamos una solicitud GET al endpoint GetByUsuario en FavoritosController.
            const response = await fetch(`${API_FAVORITOS}/usuario/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                // Si la respuesta es 404 (Not Found), significa que el usuario no tiene favoritos.
                if (response.status === 404) {
                    userFavorites = [];
                } else {
                    // Para otros errores, lanzamos una excepción.
                    throw new Error('Error al obtener la lista de favoritos del usuario.');
                }
            } else {
                // Si la respuesta es exitosa, mapeamos los favoritos para obtener solo los 'localId'.
                const favorites = await response.json();
                userFavorites = favorites.map(fav => fav.localId);
            }
        } catch (error) {
            console.error('Error al cargar favoritos del usuario:', error);
            userFavorites = []; // En caso de error, aseguramos que la lista esté vacía.
        }
    }

    /**
     * @brief Actualiza la apariencia del icono de favorito (corazón lleno o delineado).
     * @param {HTMLElement} button El elemento botón que contiene el icono ion-icon.
     * @param {string} localId El ID del local asociado con el botón.
     */
    function updateFavoriteIcon(button, localId) {
        // Verificamos si el localId está en nuestra lista de favoritos del usuario.
        const isFav = userFavorites.includes(localId);
        // Cambiamos el nombre del icono y su color según el estado.
        button.setAttribute('name', isFav ? 'heart' : 'heart-outline');
        button.style.color = isFav ? 'var(--primary-color)' : 'var(--subtitle-color)';
    }

    async function toggleFavorite(localId, button) {
        const token = await getJwtToken();
        if (!token || !currentUserId) {
            showToast('Debes iniciar sesión para agregar favoritos.', true);
            return;
        }

        // Validación adicional de IDs
        if (!localId || !currentUserId) {
            console.error('IDs faltantes:', { localId, currentUserId });
            showToast('Error interno: IDs faltantes', true);
            return;
        }

        const isFav = userFavorites.includes(localId);

        try {
            if (isFav) {
                // Lógica para eliminar favorito
                const favToDeleteResponse = await fetch(`${API_FAVORITOS}/usuario/${currentUserId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!favToDeleteResponse.ok) throw new Error('Error al buscar favoritos');

                const allUserFavorites = await favToDeleteResponse.json();
                const favToDelete = allUserFavorites.find(f => f.localId === localId);

                if (!favToDelete) throw new Error('Favorito no encontrado');

                const deleteResponse = await fetch(`${API_FAVORITOS}/${favToDelete.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!deleteResponse.ok) throw new Error('Error al eliminar favorito');

                userFavorites = userFavorites.filter(id => id !== localId);
                showToast('Local removido de favoritos.');
            } else {
                // Lógica para agregar favorito
                const response = await fetch(API_FAVORITOS, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        UsuarioId: currentUserId,
                        LocalId: localId
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error del backend:', errorData);
                    throw new Error(errorData.title || 'Error al agregar favorito');
                }

                const newFavorite = await response.json();
                userFavorites.push(localId);
                showToast('Local agregado a favoritos.');
            }

            updateFavoriteIcon(button, localId);
        } catch (error) {
            console.error('Error completo en toggleFavorite:', {
                error: error.message,
                localId,
                currentUserId,
                isFav
            });
            showToast(error.message || 'Error al actualizar favorito', true);
        }
    }

    /**
     * @brief Muestra una notificación "toast" en la esquina inferior de la pantalla.
     * @param {string} message El mensaje a mostrar.
     * @param {boolean} [isError=false] Si es true, el toast se mostrará como un error.
     */
    function showToast(message, isError = false) {
        // Removemos cualquier toast existente para evitar superposiciones.
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

        // Pequeño retardo para permitir que el navegador aplique los estilos iniciales antes de la transición.
        setTimeout(() => toast.classList.add('show'), 10);
        // Ocultar y remover el toast después de 3 segundos.
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300); // Esperar la transición de salida antes de remover el elemento
        }, 3000);
    }

    /**
     * @brief Sanitiza una cadena de texto para prevenir ataques de Cross-Site Scripting (XSS).
     * @param {string} str La cadena a sanitizar.
     * @returns {string} La cadena sanitizada.
     */
    function sanitize(str) {
        if (!str) return '';
        // Reemplaza caracteres especiales HTML con sus equivalentes de entidad.
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /**
     * @brief Renderiza una tarjeta individual de local en el DOM.
     * @param {object} local Los datos del local a renderizar.
     * @returns {HTMLElement} El elemento de la tarjeta del local.
     */
    function renderLocalCard(local) {
        const card = document.createElement('div');
        card.className = 'local-card-column';
        // Asegúrate que el local.id es un GUID válido
        if (!local.id || typeof local.id !== 'string') {
            console.error('ID de local inválido:', local.id);
            return;
        }
        card.setAttribute('data-local-id', local.id); // Almacena el ID del local en un atributo de datos

        const fotos = local.fotos || [];
        // Generamos el HTML para el carrusel de imágenes.
        // Se asegura que las imágenes llenen su contenedor manteniendo su aspecto con object-fit: cover.
        const images = fotos.map(url => `
            <figure style="width: 100%; height: 100%;">
                <img src="${sanitize(url)}" alt="Imagen del local" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
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
                    <div class="media-content">
                        <p class="title is-6">${sanitize(local.name)}</p>
                        <ion-icon class="favorite-btn" name="heart-outline" data-local-id="${sanitize(local.id)}"></ion-icon>
                        <p class="subtitle is-7">${sanitize(local.description)}</p>
                    </div>
                    <div class="content">
                        <p><strong>Ciudad:</strong> ${sanitize(local.ciudad)}</p>
                        <p><strong>Tipo:</strong> ${sanitize(local.tipo)}</p>
                        <p><strong>Dirección:</strong> ${sanitize(local.direccion)}</p>
                        <p><strong>Precio:</strong> $${local.costo ? sanitize(local.costo.toLocaleString()) : '0'}</p>
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

        // Agregamos un event listener a la tarjeta completa para navegar a la página de detalles del local.
        card.querySelector('.card')?.addEventListener('click', (e) => {
            // Nos aseguramos de no navegar si el clic fue en el botón de favorito o en los controles del carrusel.
            if (!e.target.closest('.favorite-btn') && !e.target.closest('.carousel-controls')) {
                window.location.href = `/Dashboard/Local/Detalle/${local.id}`;
            }
        });

        // Inicializamos el carrusel después de un pequeño retraso para asegurar que los elementos estén renderizados.
        setTimeout(() => {
            initializeCarousel(`carousel-${local.id}`);
        }, 50);

        return card;
    }

    /**
     * @brief Renderiza una sección de locales (e.g., "Todos los locales", "Recientes").
     * @param {string} title El título de la sección.
     * @param {string} gridId El ID del contenedor donde se insertará la sección.
     * @param {string} icon El nombre del icono de Ionicons para el título de la sección.
     * @param {Array<object>} locales La lista de objetos locales a renderizar en esta sección.
     */
    function renderSection(title, gridId, icon, locales) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = ''; // Limpiamos el contenido existente.

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
            cardsContainer.appendChild(renderLocalCard(local)); // Agregamos cada tarjeta de local.
        });

        section.appendChild(titleElement);
        section.appendChild(cardsContainer);
        grid.appendChild(section);
    }

    /**
     * @brief Carga locales desde un endpoint específico de la API de locales.
     * @param {string} endpoint El sufijo del endpoint (e.g., 'todos', 'recientes', 'recomendados').
     * @returns {Array<object>} Una promesa que resuelve con la lista de locales.
     */
    async function loadLocales(endpoint) {
        const token = await getJwtToken();
        if (!token) return []; // Si no hay token, no podemos cargar locales protegidos.

        try {
            const res = await fetch(`${API_LOCALES}/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` } // Incluimos el token JWT.
            });
            if (!res.ok) throw new Error(`Error al cargar ${endpoint}`);
            return await res.json();
        } catch (error) {
            console.error(`Error al cargar ${endpoint}:`, error);
            return []; // Devolvemos un array vacío en caso de error.
        }
    }

    /**
     * @brief Función de inicialización que se ejecuta al cargar el DOM.
     * Obtiene el ID del usuario, carga sus favoritos y luego renderiza las secciones de locales.
     */
    async function init() {
        currentUserId = await getCurrentUserId(); // Obtenemos el ID del usuario actual.
        await fetchUserFavorites(); // ¡Importante! Cargamos los favoritos del usuario antes de renderizar los locales.

        try {
            // Cargamos todas las secciones de locales en paralelo para mejorar el rendimiento.
            const [todos, recientes, recomendados] = await Promise.all([
                loadLocales('todos'),
                loadLocales('recientes'),
                loadLocales('recomendados')
            ]);

            // Una vez cargados los datos, renderizamos las secciones en la interfaz.
            renderSection('Todos los locales', 'albums-all-grid', 'earth-outline', todos);
            renderSection('Publicados recientemente', 'albums-recent-grid', 'time-outline', recientes);
            renderSection('Recomendados para ti', 'albums-recommended-grid', 'star-outline', recomendados);

        } catch (error) {
            console.error('Error en init:', error);
            showToast('Error al cargar los locales', true); // Mostramos un error general si algo falla.
        }
    }

    // ------------------------- LÓGICA DEL CARRUSEL DE IMÁGENES -------------------------
    // (Esta sección no ha cambiado y se mantiene para la funcionalidad del carrusel)
    /**
     * @brief Inicializa la funcionalidad del carrusel para un contenedor específico.
     * @param {string} carouselId El ID del contenedor del carrusel.
     */
    function initializeCarousel(carouselId) {
        const carousel = document.getElementById(carouselId);
        // Asegúrate de que los slides sean las etiquetas <figure> que contienen las imágenes
        const slides = carousel ? carousel.querySelectorAll('figure') : [];
        const slideCount = slides.length;
        let currentIndex = 0;
        let autoSlideInterval;

        const nextButton = document.querySelector(`.carousel-control-next[data-target="${carouselId}"]`);
        const prevButton = document.querySelector(`.carousel-control-prev[data-target="${carouselId}"]`);
        const indicators = document.querySelectorAll(`#indicators-${carouselId} li`);

        if (!carousel || slideCount === 0) return; // No inicializar si no hay carrusel o slides.

        /** Actualiza el estado visual de los indicadores de posición del carrusel. */
        function updateIndicators() {
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        /**
         * Navega a un slide específico del carrusel.
         * @param {number} index El índice del slide al que se desea ir.
         */
        function goToSlide(index) {
            // Asegura que el índice esté dentro de los límites y permite el ciclo continuo.
            currentIndex = (index < 0) ? slideCount - 1 :
                (index >= slideCount) ? 0 : index;

            carousel.style.transform = `translateX(${-currentIndex * 100}%)`; // Mueve el carrusel.
            updateIndicators(); // Actualiza los indicadores.
        }

        /** Pasa al siguiente slide. */
        function nextSlide() {
            goToSlide(currentIndex + 1);
            resetAutoSlide(); // Reinicia el temporizador de auto-slide.
        }

        /** Regresa al slide anterior. */
        function prevSlide() {
            goToSlide(currentIndex - 1);
            resetAutoSlide(); // Reinicia el temporizador de auto-slide.
        }

        /**
         * Inicia el auto-slide del carrusel.
         * @param {number} [interval=5000] El intervalo en milisegundos entre cada slide.
         */
        function startAutoSlide(interval = 5000) {
            autoSlideInterval = setInterval(nextSlide, interval);
        }

        /** Reinicia el temporizador del auto-slide. */
        function resetAutoSlide() {
            clearInterval(autoSlideInterval); // Limpia el intervalo existente.
            startAutoSlide(); // Inicia un nuevo intervalo.
        }

        // Asigna event listeners a los botones de navegación.
        if (nextButton) nextButton.addEventListener('click', nextSlide);
        if (prevButton) prevButton.addEventListener('click', prevSlide);

        // Asigna event listeners a los indicadores.
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                resetAutoSlide();
            });
        });

        // Inicia el auto-slide y muestra el primer slide al cargar.
        startAutoSlide();
        goToSlide(0);
    }

    // Llamamos a la función de inicialización para que todo el proceso comience cuando el DOM esté listo.
    init();
});