// local-crud.js
document.addEventListener('DOMContentLoaded', function () {
    const API_URL = 'https://localhost:7135/api/Local';
    let currentLocales = [];

    // Elementos del DOM
    const localesContainer = document.querySelector('.columns.is-multiline');
    const publicBtn = document.getElementById('publicbtn');
    const modal = document.querySelector('.modal-overlay');
    const deleteModal = document.getElementById('confirmDeleteModal');
    let currentLocalId = null;

    // Inicializar
    loadLocales();

    // Cargar locales desde la API
    async function loadLocales() {
        try {
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar locales');

            currentLocales = await response.json();
            renderLocales(currentLocales);
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al cargar locales', 'error');
        }
    }

    // Renderizar locales en tarjetas
    function renderLocales(locales) {
        localesContainer.innerHTML = '';

        locales.forEach(local => {
            const localCard = createLocalCard(local);
            localesContainer.appendChild(localCard);
        });
    }

    // Crear tarjeta de local
    function createLocalCard(local) {
        const column = document.createElement('div');
        column.className = 'column is-one-third';

        const carouselId = `carousel-${local.id}`;

        // Crear elementos del carrusel de imágenes
        const carouselItems = local.imagenes && local.imagenes.length > 0
            ? local.imagenes.map((img, index) => `
                <figure class="image is-4by3">
                    <img src="data:image/jpeg;base64,${img}" alt="Imagen ${index + 1}">
                </figure>
            `).join('')
            : `
                <figure class="image is-4by3">
                    <img src="../Img/espacio2.jpg" alt="Imagen por defecto">
                </figure>
            `;

        // Crear indicadores del carrusel
        const indicators = local.imagenes && local.imagenes.length > 1
            ? Array.from({ length: local.imagenes.length }, (_, i) => `
                <li data-bs-slide-to="${i}" ${i === 0 ? 'class="active"' : ''}></li>
            `).join('')
            : '';

        column.innerHTML = `
            <div class="card">
                <div class="card-image">
                    <div class="carousel ${carouselId}">
                        ${carouselItems}
                    </div>
                    ${local.imagenes && local.imagenes.length > 1 ? `
                    <div class="carousel-navigation">
                        <button class="carousel-control-prev carousel-control-prev-${carouselId}">
                            <ion-icon name="chevron-back-outline"></ion-icon>
                        </button>
                        <ol class="carousel-indicators carousel-indicators-${carouselId}">
                            ${indicators}
                        </ol>
                        <button class="carousel-control-next carousel-control-next-${carouselId}">
                            <ion-icon name="chevron-forward-outline"></ion-icon>
                        </button>
                    </div>
                    ` : ''}
                </div>
                <div class="card-content">
                    <div class="media">
                        <div class="media-content">
                            <p class="title is-6">${local.nombre}</p>
                            <p class="subtitle is-7">${local.descripcion}</p>
                        </div>
                    </div>
                    <div class="content">
                        <p><strong>Ciudad:</strong> ${local.ciudad}</p>
                        <p><strong>Tipo:</strong> ${local.tipo}</p>
                        <p><strong>Dirección:</strong> ${local.direccion}</p>
                        <p><strong>Precio por mes:</strong> $${local.costo.toLocaleString()}</p>
                        <br>
                        <small>Publicado ${formatDate(local.fechaCreacion)}</small>
                    </div>
                    <div class="buttons are-small is-right mt-3">
                        <button class="button is-info is-light btn-editar" data-id="${local.id}">
                            <ion-icon name="create-outline"></ion-icon>
                            <span>Editar</span>
                        </button>
                        <button class="button is-danger is-light btn-eliminar" data-id="${local.id}">
                            <ion-icon name="trash-outline"></ion-icon>
                            <span>Eliminar</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Inicializar carrusel si hay más de una imagen
        if (local.imagenes && local.imagenes.length > 1) {
            initializeCarousel(carouselId.replace('carousel-', ''));
        }

        return column;
    }

    // Formatear fecha
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 60) return `hace ${minutes} minutos`;
        if (hours < 24) return `hace ${hours} horas`;
        return `hace ${days} días`;
    }

    // Manejar publicación/edición de local
    publicBtn.addEventListener('click', () => {
        currentLocalId = null;
        resetForm();
        modal.style.display = 'flex';
    });

    // Manejar edición de local
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-editar')) {
            const localId = e.target.closest('.btn-editar').dataset.id;
            editLocal(localId);
        }

        if (e.target.closest('.btn-eliminar')) {
            const localId = e.target.closest('.btn-eliminar').dataset.id;
            confirmDelete(localId);
        }
    });

    // Editar local
    async function editLocal(localId) {
        try {
            const response = await fetch(`${API_URL}/${localId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar local');

            const local = await response.json();
            currentLocalId = localId;

            // Llenar formulario con datos del local
            document.getElementById('Name').value = local.nombre;
            document.getElementById('Description').value = local.descripcion;
            document.getElementById('Costo').value = local.costo;
            document.getElementById('Ciudad').value = local.ciudad;
            document.getElementById('Direccion').value = local.direccion;
            document.getElementById('Tipo').value = local.tipo;

            // Mostrar imágenes existentes (si las hay)
            if (local.imagenes && local.imagenes.length > 0) {
                const imagePreviews = [
                    document.getElementById('image-preview-1'),
                    document.getElementById('image-preview-2'),
                    document.getElementById('image-preview-3')
                ];

                local.imagenes.forEach((img, index) => {
                    if (index < 3) {
                        imagePreviews[index].innerHTML = `
                            <img src="data:image/jpeg;base64,${img}" alt="Preview">
                            <button class="remove-image-button" data-index="${index}">&times;</button>
                        `;
                    }
                });
            }

            modal.style.display = 'flex';
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al cargar local para edición', 'error');
        }
    }

    // Confirmar eliminación
    function confirmDelete(localId) {
        currentLocalId = localId;
        deleteModal.style.display = 'flex';
    }

    // Eliminar local
    document.querySelector('.btn-delete').addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/${currentLocalId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!response.ok) throw new Error('Error al eliminar local');

            deleteModal.style.display = 'none';
            showNotification('¡Local eliminado con éxito!', 'success');
            loadLocales();
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al eliminar local', 'error');
        }
    });

    // Guardar local (crear o actualizar)
    document.querySelector('.btn-confirm').addEventListener('click', async () => {
        const formData = new FormData();
        const name = document.getElementById('Name').value;
        const description = document.getElementById('Description').value;
        const cost = document.getElementById('Costo').value;
        const city = document.getElementById('Ciudad').value;
        const address = document.getElementById('Direccion').value;
        const type = document.getElementById('Tipo').value;
        const fotosInput = document.getElementById('fotos');

        // Validar campos requeridos
        if (!name || !description || !cost || !city || !address || !type) {
            showNotification('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        // Agregar datos del formulario
        formData.append('nombre', name);
        formData.append('descripcion', description);
        formData.append('costo', cost);
        formData.append('ciudad', city);
        formData.append('direccion', address);
        formData.append('tipo', type);

        // Agregar imágenes (si hay nuevas)
        if (fotosInput.files.length > 0) {
            for (let i = 0; i < fotosInput.files.length; i++) {
                formData.append('imagenes', fotosInput.files[i]);
            }
        }

        try {
            let response;

            if (currentLocalId) {
                // Actualizar local existente
                response = await fetch(`${API_URL}/${currentLocalId}`, {
                    method: 'PUT',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                });
            } else {
                // Crear nuevo local
                response = await fetch(API_URL, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                });
            }

            if (!response.ok) throw new Error('Error al guardar local');

            modal.style.display = 'none';
            showNotification(
                currentLocalId
                    ? '¡Local actualizado con éxito!'
                    : '¡Local creado con éxito!',
                'success'
            );
            loadLocales();
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al guardar local', 'error');
        }
    });

    // Obtener token JWT
    function getToken() {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(c => c.trim().startsWith('jwt_token='));
        return tokenCookie ? tokenCookie.split('=')[1] : '';
    }

    // Mostrar notificación
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('successNotification');
        notification.innerHTML = `<ion-icon name="${type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}"></ion-icon> ${message}`;
        notification.className = `floating-notification ${type}`;
        notification.style.display = 'flex';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Resetear formulario
    function resetForm() {
        document.getElementById('Name').value = '';
        document.getElementById('Description').value = '';
        document.getElementById('Costo').value = '';
        document.getElementById('Ciudad').value = '';
        document.getElementById('Direccion').value = '';
        document.getElementById('Tipo').value = '';

        const imagePreviews = [
            document.getElementById('image-preview-1'),
            document.getElementById('image-preview-2'),
            document.getElementById('image-preview-3')
        ];

        imagePreviews.forEach(preview => {
            preview.innerHTML = '<ion-icon name="image-outline"></ion-icon>';
        });

        document.getElementById('fotos').value = '';
    }
});