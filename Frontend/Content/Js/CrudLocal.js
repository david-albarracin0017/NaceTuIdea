document.addEventListener('DOMContentLoaded', function () {
    // Configuración de la API
    const API_BASE_URL = 'https://localhost:7135/api/Local';
    const IMGBB_API_KEY = '9107f6638e7dadfa22334599d9bc5d40'; // Considera mover esto a una variable de entorno

    // Elementos del DOM
    const crudSubmitBtn = document.getElementById('submitBtn');
    const publicBtn = document.getElementById('publicbtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelUpdateBtn = document.getElementById('cancelUpdate');
    const imagePreviews = [
        document.getElementById('image-preview-1'),
        document.getElementById('image-preview-2'),
        document.getElementById('image-preview-3')
    ];
    const publicationModal = document.querySelector('.modal-overlay');
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const successNotification = document.getElementById('successNotification');
    const errorNotification = document.getElementById('floatingNotification');

    // Variables de estado
    const selectedImages = Array(imagePreviews.length).fill(null);
    let uploadedImageUrls = [];

    // Inicialización
    initModals();
    initImageUpload();
    initFormSubmit();

    // ------------------------- MANEJO DE MODALS -------------------------

    // Reemplazar la función initModals() con esta versión mejorada
    function initModals() {
        // Abrir modal de publicación
        publicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            publicationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
        });

        // Cerrar modal de publicación
        [closeModalBtn, cancelUpdateBtn].forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                closePublicationModal();
            });
        });

        // Cerrar modals al hacer clic fuera del contenido
        [publicationModal, confirmDeleteModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closePublicationModal();
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Restaura el scroll
                }
            });
        });

        // Cerrar modals con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (publicationModal.style.display === 'flex') {
                    closePublicationModal();
                }
                if (confirmDeleteModal.style.display === 'flex') {
                    confirmDeleteModal.style.display = 'none';
                }
                document.body.style.overflow = 'auto'; // Restaura el scroll
            }
        });
    }

    // Modificar la función closePublicationModal
    function closePublicationModal() {
        document.querySelectorAll('.modal-content .input').forEach(input => input.value = '');
        selectedImages.fill(null);
        uploadedImageUrls = [];
        imagePreviews.forEach((_, index) => resetImagePreview(index));
        publicationModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaura el scroll
    }

    // ------------------------- FUNCIONES PRINCIPALES -------------------------

    function initImageUpload() {
        const fileInputs = imagePreviews.map((preview, index) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            input.dataset.index = index;
            document.body.appendChild(input);
            return input;
        });

        imagePreviews.forEach((preview, index) => {
            preview.addEventListener('click', () => fileInputs[index].click());
            fileInputs[index].addEventListener('change', (e) => handleImageUpload(e, preview, index));
        });

        document.querySelector('.image-upload-container').addEventListener('click', (e) => {
            if (e.target.closest('.remove-image-button')) {
                const button = e.target.closest('.remove-image-button');
                const index = parseInt(button.dataset.index);
                resetImagePreview(index);
            }
        });
    }

    // Modificar la función initFormSubmit para asegurar el ID del usuario
    async function initFormSubmit() {
        crudSubmitBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            // 🚫 Evitar múltiples clics
            if (crudSubmitBtn.disabled) return;

            crudSubmitBtn.disabled = true;
            crudSubmitBtn.innerHTML = 'Subiendo imágenes...';

            try {
                const formData = validateAndGetFormData();

                // Subir imágenes
                uploadedImageUrls = await uploadImagesToImgBB(selectedImages.filter(img => img !== null));
                if (uploadedImageUrls.length === 0) {
                    throw new Error('No se pudieron subir las imágenes. Por favor, inténtalo de nuevo.');
                }

                // Obtener ID de usuario autenticado
                const userId = await getUserId();
                if (!userId) {
                    throw new Error('No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
                }

                // Armar objeto local para el backend
                const localData = {
                    Name: formData.name,
                    Description: formData.description,
                    Costo: formData.costo,
                    Ciudad: formData.ciudad,
                    Direccion: formData.direccion,
                    Tipo: formData.tipo,
                    Fotos: uploadedImageUrls,
                    PropietarioId: userId
                };

                crudSubmitBtn.innerHTML = 'Creando local...';
                const nuevoLocal = await createLocal(localData); // ← Guarda y recibe local nuevo

                // Mostrar tarjeta en pantalla
                renderLocalCard(nuevoLocal);

                showSuccessMessage('¡Local creado exitosamente!');
                closePublicationModal();

            } catch (error) {
                console.error('Error:', error);
                showErrorMessage(error.message);
            } finally {
                crudSubmitBtn.disabled = false;
                crudSubmitBtn.innerHTML = 'Publicar';
            }
        });
    }


    // ------------------------- FUNCIONES AUXILIARES -------------------------

    function handleImageUpload(event, preview, index) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            if (!file.type.startsWith('image/')) {
                showErrorMessage('Por favor, selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño de imagen (opcional)
            if (file.size > 5 * 1024 * 1024) { // 5MB
                showErrorMessage('La imagen es demasiado grande (máximo 5MB)');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                preview.style.backgroundImage = `url(${e.target.result})`;
                preview.innerHTML = `
                    <button class="remove-image-button" data-index="${index}">
                        <ion-icon name="close-circle-outline"></ion-icon>
                    </button>
                `;
                selectedImages[index] = file;
            };
            reader.readAsDataURL(file);
        }
    }

    function resetImagePreview(index) {
        imagePreviews[index].style.backgroundImage = '';
        imagePreviews[index].innerHTML = '<ion-icon name="image-outline"></ion-icon>';
        selectedImages[index] = null;
    }

    function validateAndGetFormData() {
        const name = document.getElementById('Name').value.trim();
        const description = document.getElementById('Description').value.trim();
        const costo = document.getElementById('Costo').value.trim();
        const ciudad = document.getElementById('Ciudad').value.trim();
        const direccion = document.getElementById('Direccion').value.trim();
        const tipo = document.getElementById('Tipo').value.trim();

        if (!name) throw new Error('El nombre del local es requerido');
        if (!description) throw new Error('La descripción es requerida');
        if (!ciudad) throw new Error('La ciudad es requerida');
        if (!direccion) throw new Error('La dirección es requerida');
        if (!tipo) throw new Error('El tipo de local es requerido');
        if (!costo) throw new Error('El costo es requerido');

        const costoNum = parseFloat(costo);
        if (isNaN(costoNum)) throw new Error('El costo debe ser un número válido');
        if (costoNum <= 0) throw new Error('El costo debe ser mayor que cero');

        const selectedImagesCount = selectedImages.filter(img => img !== null).length;
        if (selectedImagesCount === 0) throw new Error('Se requiere al menos una imagen');

        return {
            name: name,
            description: description,
            costo: costoNum,
            ciudad: ciudad,
            direccion: direccion,
            tipo: tipo
        };
    }

    function showSuccessMessage(message) {
        if (successNotification) {
            successNotification.innerHTML = `<ion-icon name="checkmark-circle-outline"></ion-icon> ${message}`;
            successNotification.style.display = 'flex';
            successNotification.classList.add('visible');

            setTimeout(() => {
                successNotification.classList.remove('visible');
                setTimeout(() => {
                    successNotification.style.display = 'none';
                }, 300);
            }, 3000);
        }
    }

    function showErrorMessage(message) {
        if (errorNotification) {
            errorNotification.innerHTML = `<ion-icon name="close-circle-outline"></ion-icon> ${message}`;
            errorNotification.style.display = 'flex';
            errorNotification.classList.add('visible', 'error');

            setTimeout(() => {
                errorNotification.classList.remove('visible');
                setTimeout(() => {
                    errorNotification.style.display = 'none';
                    errorNotification.classList.remove('error');
                }, 300);
            }, 5000);
        } else {
            alert(message); // Fallback
        }
    }

    // ------------------------- FUNCIONES DE API -------------------------

    async function uploadImagesToImgBB(files) {
        if (!files || files.length === 0) return [];

        const urls = [];
        const uploadPromises = files.map(file => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('key', IMGBB_API_KEY);

            return fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        return data.data.url;
                    } else {
                        console.error('Error al subir imagen:', data.error);
                        return null;
                    }
                })
                .catch(error => {
                    console.error('Error al subir imagen:', error);
                    return null;
                });
        });

        const results = await Promise.all(uploadPromises);
        return results.filter(url => url !== null);
    }

    async function getJwtToken() {
        try {
            const response = await fetch('/Token/Obtener', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Error al obtener token');
            const data = await response.json();
            return data.success ? data.token : null;
        } catch (error) {
            console.error('Error al obtener token:', error);
            return null;
        }
    }

    // Modificar la función getUserId para asegurar el formato correcto
    async function getUserId() {
        try {
            const response = await fetch('/Token/GetUserId', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al obtener ID de usuario');
            }

            const userId = await response.text();
            // Validar que el ID sea un Guid válido
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId)) {
                throw new Error('ID de usuario no válido');
            }
            return userId;
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
            throw error;
        }
    }

    async function createLocal(localData) {
        const token = await getJwtToken();
        if (!token) {
            throw new Error('No estás autenticado. Por favor, inicia sesión primero.');
        }

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(localData)
            });

            if (!response.ok) {
                let errorMsg = 'Error al crear local';
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    if (errorData.errors) {
                        errorMsg = Object.values(errorData.errors).flat().join('\n');
                    } else if (errorData.title) {
                        errorMsg = errorData.title;
                    } else if (errorData.message) {
                        errorMsg = errorData.message;
                    }
                } else {
                    const text = await response.text();
                    errorMsg = text || errorMsg;
                }

                throw new Error(errorMsg);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear local:', error);
            throw new Error(`Error al comunicarse con el servidor: ${error.message}`);
        }
    }

    function renderLocalCard(local) {
        const container = document.getElementById('localCardContainer');
        if (!container) return;

        const imageUrl = local.fotos?.[0] || '../Img/espacio2.jpg'; // imagen por defecto

        const column = document.createElement('div');
        column.className = 'column is-one-third';

        column.innerHTML = `
        <div class="card">
            <div class="card-image">
                <div class="carousel carousel-${local.id}">
                    <figure class="image is-4by3">
                        <img src="${imageUrl}" alt="Imagen 1">
                    </figure>
                </div>
                <div class="carousel-navigation">
                    <button class="carousel-control-prev carousel-control-prev-${local.id}">
                        <ion-icon name="chevron-back-outline"></ion-icon>
                    </button>
                    <ol class="carousel-indicators carousel-indicators-${local.id}">
                        <li data-bs-slide-to="0" class="active"></li>
                    </ol>
                    <button class="carousel-control-next carousel-control-next-${local.id}">
                        <ion-icon name="chevron-forward-outline"></ion-icon>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <div class="media">
                    <div class="media-content">
                        <p class="title is-6">${local.name}</p>
                        <p class="subtitle is-7">${local.description}</p>
                    </div>
                </div>
                <div class="content">
                    <p><strong>Ciudad:</strong> ${local.ciudad}</p>
                    <p><strong>Tipo:</strong> ${local.tipo}</p>
                    <p><strong>Dirección:</strong> ${local.direccion}</p>
                    <p><strong>Precio por mes:</strong> $${local.costo.toLocaleString()}</p>
                    <br>
                    <small>Publicado ahora</small>
                </div>
                <div class="buttons are-small is-right mt-3">
                    <button class="button is-info is-light btn-editar">
                        <ion-icon name="create-outline"></ion-icon>
                        <span>Editar</span>
                    </button>
                    <button class="button is-danger is-light btn-eliminar">
                        <ion-icon name="trash-outline"></ion-icon>
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>
        </div>
    `;

        container.prepend(column);
    }
});