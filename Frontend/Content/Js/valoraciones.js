// valoraciones.js - Versión optimizada y robusta
document.addEventListener('DOMContentLoaded', function () {
    // URLs de la API
    const API_VALORACIONES = 'https://localhost:7135/api/Valoraciones';

    // Cache para el token JWT y user ID
    let jwtToken = null;
    let currentUserId = null;
    let isSaving = false;

    // Mapa para almacenar valoraciones ya inicializadas
    const initializedRatings = new WeakMap();

    // ==================== FUNCIONES DE AUTENTICACIÓN ====================
    async function getJwtToken() {
        if (jwtToken) return jwtToken;

        try {
            const tokenRes = await fetch('/Token/Obtener', {
                method: 'GET',
                credentials: 'include'
            });

            if (!tokenRes.ok) throw new Error('No se pudo obtener el token');

            const tokenData = await tokenRes.json();
            jwtToken = tokenData?.token || null;
            return jwtToken;
        } catch (error) {
            console.error('Error al obtener token:', error);
            return null;
        }
    }

    async function getCurrentUserId() {
        if (currentUserId) return currentUserId;

        try {
            const token = await getJwtToken();
            if (!token) return null;

            const userIdRes = await fetch('/Token/GetUserId', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });

            if (!userIdRes.ok) throw new Error('No se pudo obtener el ID de usuario');

            currentUserId = await userIdRes.text();
            return currentUserId;
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
            return null;
        }
    }

    // ==================== FUNCIONES DE UI ====================
    function showToast(message, isError = false) {
        try {
            // Eliminar toast existente
            const existingToast = document.querySelector('.rating-toast');
            if (existingToast) existingToast.remove();

            // Crear nuevo toast
            const toast = document.createElement('div');
            toast.className = `rating-toast ${isError ? 'error' : ''}`;
            toast.setAttribute('role', 'alert');
            toast.innerHTML = `
                <ion-icon name="${isError ? 'warning' : 'checkmark'}"></ion-icon>
                <span>${message}</span>
            `;

            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 10);

            // Auto-eliminación después de 3 segundos
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        } catch (error) {
            console.error('Error al mostrar toast:', error);
        }
    }

    // ==================== FUNCIONES DE API ====================
    async function getValoracionUsuario(localId) {
        if (!currentUserId || !jwtToken) return null;

        try {
            const res = await fetch(`${API_VALORACIONES}/usuario/${currentUserId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            if (!res.ok) throw new Error('Error al obtener valoraciones del usuario');

            const valoraciones = await res.json();
            return Array.isArray(valoraciones) ?
                valoraciones.find(v => v && v.localId === localId) || null :
                null;
        } catch (error) {
            console.error('Error al obtener valoración:', error);
            return null;
        }
    }

    async function getPromedioValoraciones(localId) {
        if (!jwtToken) return { promedio: 0, count: 0 };

        try {
            const res = await fetch(`${API_VALORACIONES}/promedio/${localId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            if (!res.ok) throw new Error('Error al obtener promedio de valoraciones');

            const data = await res.json();
            return {
                promedio: parseFloat(data.promedio) || 0,
                count: parseInt(data.count) || 0
            };
        } catch (error) {
            console.error('Error al obtener promedio:', error);
            return { promedio: 0, count: 0 };
        }
    }

    // ==================== FUNCIONES DE VALORACIÓN ====================
    async function guardarValoracion(localId, estrellas) {
        if (isSaving) return false;
        isSaving = true;

        try {
            // Validaciones iniciales
            const usuarioId = await getCurrentUserId();
            if (!usuarioId) {
                showToast('Debes iniciar sesión para valorar', true);
                return false;
            }

            const token = await getJwtToken();
            if (!token) {
                showToast('Error de autenticación', true);
                return false;
            }

            if (!localId || estrellas < 1 || estrellas > 5) {
                showToast('Valoración inválida', true);
                return false;
            }

            // Preparar datos
            const valoracionData = {
                estrellas: estrellas,
                localId: localId,
                usuarioId: usuarioId
            };

            // Verificar valoración existente
            const valoracionExistente = await getValoracionUsuario(localId);
            let response;

            if (valoracionExistente?.id) {
                // Evitar actualización innecesaria
                if (valoracionExistente.estrellas === estrellas) {
                    return true;
                }

                // Actualización
                valoracionData.id = valoracionExistente.id;
                response = await fetch(`${API_VALORACIONES}/${valoracionExistente.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(valoracionData)
                });
            } else {
                // Creación nueva
                response = await fetch(API_VALORACIONES, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(valoracionData)
                });
            }

            // Manejar respuesta
            if (!response.ok) {
                if (response.status === 409) {
                    showToast('Ya has valorado este local', true);
                    return false;
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.title || 'Error al guardar valoración');
            }

            // Actualizar UI con datos frescos
            const { promedio, count } = await getPromedioValoraciones(localId);
            updateRatingDisplay(localId, promedio, count, estrellas);

            showToast('Valoración guardada');
            return true;
        } catch (error) {
            console.error('Error al guardar valoración:', error);
            showToast(error.message || 'Error al guardar valoración', true);
            return false;
        } finally {
            isSaving = false;
        }
    }

    function updateRatingDisplay(localId, promedio, count, userRating) {
        try {
            const container = document.querySelector(`.local-card-column[data-local-id="${localId}"] .rating-container.interactive`);
            if (!container) return;

            // Actualizar promedio
            const ratingValue = container.querySelector('.rating-value');
            if (ratingValue) {
                ratingValue.textContent = promedio.toFixed(1);
            }

            // Actualizar conteo
            const ratingCount = container.querySelector('.rating-count');
            if (ratingCount) {
                ratingCount.textContent = `(${count})`;
            }

            // Actualizar estrellas
            const stars = container.querySelectorAll('.rating-star');
            stars.forEach((star, index) => {
                if (star) {
                    star.setAttribute('name', index < userRating ? 'star' : 'star-outline');
                    star.style.color = index < userRating ? '#FFD700' : '#CCCCCC';
                }
            });
        } catch (error) {
            console.error('Error al actualizar visualización:', error);
        }
    }

    // ==================== CONFIGURACIÓN DE ESTRELLAS ====================
    async function setupStarRating(container) {
        if (initializedRatings.has(container)) return;
        initializedRatings.set(container, true);

        const localId = container.closest('.local-card-column')?.dataset?.localId;
        if (!localId) return;

        const stars = container.querySelectorAll('.rating-star');
        const ratingValue = container.querySelector('.rating-value');
        const ratingCount = container.querySelector('.rating-count');
        let currentRating = 0;

        // Función para actualizar estrellas
        const updateStars = (rating, save = true) => {
            stars.forEach((star, index) => {
                if (star) {
                    star.setAttribute('name', index < rating ? 'star' : 'star-outline');
                    star.style.color = index < rating ? '#FFD700' : '#CCCCCC';
                }
            });

            if (save && rating > 0 && !isSaving) {
                guardarValoracion(localId, rating);
            }
        };

        // Cargar datos iniciales
        try {
            const [valoracionUsuario, promedioData] = await Promise.all([
                getValoracionUsuario(localId),
                getPromedioValoraciones(localId)
            ]);

            // Actualizar UI
            if (ratingValue) ratingValue.textContent = promedioData.promedio.toFixed(1);
            if (ratingCount) ratingCount.textContent = `(${promedioData.count})`;
            if (valoracionUsuario) {
                currentRating = valoracionUsuario.estrellas;
                updateStars(currentRating, false);
            }
        } catch (error) {
            console.error('Error al cargar valoraciones iniciales:', error);
        }

        // Event handlers
        const handleStarClick = (index) => {
            const newRating = index + 1;
            if (currentRating !== newRating) {
                currentRating = newRating;
                updateStars(currentRating, true);
            }
        };

        const handleStarEnter = (index) => {
            stars.forEach((s, i) => {
                if (s) {
                    s.setAttribute('name', i <= index ? 'star' : 'star-outline');
                    s.style.color = i <= index ? '#FFD700' : '#CCCCCC';
                }
            });
        };

        const handleStarLeave = () => {
            updateStars(currentRating, false);
        };

        // Asignar eventos
        stars.forEach((star, index) => {
            if (!star) return;

            star.addEventListener('click', () => handleStarClick(index));
            star.addEventListener('mouseenter', () => handleStarEnter(index));
            star.addEventListener('mouseleave', handleStarLeave);
        });
    }

    // ==================== OBSERVADOR Y INICIALIZACIÓN ====================
    async function initializeAllStarRatings() {
        try {
            // Verificar autenticación
            if (!jwtToken || !currentUserId) {
                await getJwtToken();
                await getCurrentUserId();
                if (!jwtToken || !currentUserId) return;
            }

            // Inicializar todos los contenedores no inicializados
            const containers = document.querySelectorAll('.rating-container.interactive:not([data-initialized])');
            for (const container of containers) {
                try {
                    container.setAttribute('data-initialized', 'true');
                    await setupStarRating(container);
                } catch (error) {
                    console.error('Error al inicializar rating:', error);
                }
            }
        } catch (error) {
            console.error('Error en inicialización general:', error);
        }
    }

    // Configurar MutationObserver para nuevos elementos
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    initializeAllStarRatings();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    // Inicialización principal
    (async function init() {
        try {
            await initializeAllStarRatings();
            setupMutationObserver();

            // Disparar evento cuando esté listo
            document.dispatchEvent(new CustomEvent('ratingsReady'));
        } catch (error) {
            console.error('Error en inicialización principal:', error);
        }
    })();
});