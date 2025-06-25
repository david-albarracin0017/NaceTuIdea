// ✅ CRUD completo con editar y eliminar funcionales

document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = 'https://localhost:7135/api/Local';
    const IMGBB_API_KEY = '9107f6638e7dadfa22334599d9bc5d40';

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
    const successNotification = document.getElementById('successNotification');
    const errorNotification = document.getElementById('floatingNotification');

    const selectedImages = Array(imagePreviews.length).fill(null);
    let uploadedImageUrls = [];
    let editingLocalId = null;

    initModals();
    initImageUpload();
    initFormSubmit();
    loadUserLocales();

    window.renderLocalCard = renderLocalCard;

    function initModals() {
        publicBtn.addEventListener('click', () => {
            editingLocalId = null;
            publicationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });

        [closeModalBtn, cancelUpdateBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                closePublicationModal();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePublicationModal();
        });
    }

    function closePublicationModal() {
        // Limpiar inputs del formulario
        document.querySelectorAll('.modal-content .input').forEach(input => input.value = '');

        // Limpiar imágenes
        selectedImages.fill(null);
        uploadedImageUrls = [];
        imagePreviews.forEach((_, i) => resetImagePreview(i));

        // Ocultar el modal
        publicationModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Restaurar estado del botón
        crudSubmitBtn.innerHTML = 'Publicar';
        crudSubmitBtn.disabled = false;

        // Restaurar título del modal
        document.getElementById('modal-title').textContent = 'Publicar Local';

        // Limpiar modo edición
        editingLocalId = null;
    }


    function initImageUpload() {
        const fileInputs = imagePreviews.map((preview, i) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            input.dataset.index = i;
            document.body.appendChild(input);
            return input;
        });

        imagePreviews.forEach((preview, i) => {
            preview.addEventListener('click', () => fileInputs[i].click());

            fileInputs[i].addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = ev => {
                        preview.style.backgroundImage = `url(${ev.target.result})`;
                        preview.innerHTML = `<button class="remove-image-button" data-index="${i}"><ion-icon name="close-circle-outline"></ion-icon></button>`;
                        selectedImages[i] = file;
                        uploadedImageUrls[i] = null; // Se anula URL anterior si reemplaza
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Eliminar imagen con botón ✖
            preview.addEventListener('click', (e) => {
                if (e.target.closest('.remove-image-button')) {
                    e.stopPropagation(); // Previene abrir input
                    resetImagePreview(i);
                    uploadedImageUrls[i] = null;
                }
            });
        });
    }


    async function initFormSubmit() {
        crudSubmitBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            if (crudSubmitBtn.disabled) return;

            crudSubmitBtn.disabled = true;
            crudSubmitBtn.innerHTML = editingLocalId ? 'Actualizando...' : 'Publicando...';

            try {
                const formData = validateAndGetFormData();
                const userId = await getUserId();
                if (!userId) throw new Error('No se pudo obtener el ID del usuario.');

                // Upload images first
                if (!editingLocalId) {
                    uploadedImageUrls = await uploadImagesToImgBB(selectedImages.filter(img => img));
                    if (uploadedImageUrls.length === 0) throw new Error('Debes subir al menos una imagen.');
                }

                const localData = {
                    name: formData.name,
                    description: formData.description,
                    costo: formData.costo,
                    ciudad: formData.ciudad,
                    direccion: formData.direccion,
                    tipo: formData.tipo,
                    Fotos: uploadedImageUrls, // Make sure this matches your backend model
                    PropietarioId: userId
                };

                if (editingLocalId) {
                    await updateLocal(editingLocalId, localData);
                    showSuccessMessage('Local actualizado correctamente.');
                } else {
                    await createLocal(localData);
                    showSuccessMessage('Local creado correctamente.');
                }

                closePublicationModal();
                loadUserLocales(); // Refresh the list

            } catch (err) {
                console.error('Submission error:', err);
                showErrorMessage(err.message || 'Ocurrió un error al guardar.');
            } finally {
                crudSubmitBtn.disabled = false;
                crudSubmitBtn.innerHTML = editingLocalId ? 'Actualizar' : 'Publicar';
            }
        });
    }


    function validateAndGetFormData() {
        const name = document.getElementById('Name').value.trim();
        const description = document.getElementById('Description').value.trim();
        const costoInput = document.getElementById('Costo').value.trim();
        const costo = parseFloat(costoInput.replace(',', '.')) || 0; 
        const ciudad = document.getElementById('Ciudad').value.trim();
        const direccion = document.getElementById('Direccion').value.trim();
        const tipo = document.getElementById('Tipo').value.trim();

        if (!name || !description || !ciudad || !direccion || !tipo || isNaN(costo)) {
            throw new Error('Todos los campos son obligatorios y el costo debe ser válido.');
        }

        return { name, description, costo, ciudad, direccion, tipo };
    }

    function handleImageUpload(event, preview, index) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = e => {
                preview.style.backgroundImage = `url(${e.target.result})`;
                preview.innerHTML = `<button class="remove-image-button" data-index="${index}"><ion-icon name="close-circle-outline"></ion-icon></button>`;
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

    async function uploadImagesToImgBB(files) {
        const uploads = files.map(file => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('key', IMGBB_API_KEY);
            return fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData })
                .then(res => res.json())
                .then(data => data.data?.url || null);
        });
        const results = await Promise.all(uploads);
        return results.filter(Boolean);
    }

    async function getJwtToken() {
        const res = await fetch('/Token/Obtener', { method: 'GET', credentials: 'include' });
        const data = await res.json();
        return data?.success ? data.token : null;
    }

    async function getUserId() {
        const res = await fetch('/Token/GetUserId', { method: 'GET', credentials: 'include' });
        return await res.text();
    }

    async function createLocal(data) {
        const token = await getJwtToken();
        const requestData = {
            Name: data.name,
            Description: data.description,
            Costo: parseFloat(data.costo) || 0,
            Ciudad: data.ciudad,
            Direccion: data.direccion,
            Tipo: data.tipo,
            Fotos: data.Fotos || [], // Ensure this matches your backend model
            PropietarioId: await getUserId() // Make sure this is included
        };

        try {
            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error creating local');
            }

            return await res.json();
        } catch (error) {
            console.error('Error in createLocal:', error);
            throw error;
        }
    }

    async function updateLocal(id, data) {
        const token = await getJwtToken();
        const requestData = {
            Id: id,
            ...data,
            Costo: parseFloat(data.costo) || 0
        };
        const res = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData) // Changed from data to requestData
        });
        return await res.json();
    }


    async function handleDeleteLocal(id, cardElement) {
        const confirmModal = document.getElementById('confirmDeleteModal');
        const confirmBtn = confirmModal.querySelector('.btn-confirm');
        const cancelBtn = confirmModal.querySelector('.btn-cancel');
        const closeBtn = confirmModal.querySelector('.close-modal');

        confirmModal.style.display = 'flex';

        const closeConfirmModal = () => {
            confirmModal.style.display = 'none';
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            closeBtn.onclick = null;
        };

        confirmBtn.onclick = async () => {
            const token = await getJwtToken();
            await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            cardElement.remove();
            showSuccessMessage('¡Publicación eliminada con éxito!');
            closeConfirmModal();
        };

        cancelBtn.onclick = closeBtn.onclick = closeConfirmModal;
    }


    function handleEditLocal(local) {
        editingLocalId = local.id;

        document.getElementById('modal-title').textContent = 'Editar Local';
        crudSubmitBtn.textContent = 'Actualizar';

        document.getElementById('Name').value = local.name;
        document.getElementById('Description').value = local.description;
        document.getElementById('Costo').value = local.costo;
        document.getElementById('Ciudad').value = local.ciudad;
        document.getElementById('Direccion').value = local.direccion;
        document.getElementById('Tipo').value = local.tipo;

        // Limpiar previews e imágenes previas
        imagePreviews.forEach((_, i) => resetImagePreview(i));
        selectedImages.fill(null);
        uploadedImageUrls = local.fotos || [];

        // Mostrar imágenes anteriores
        uploadedImageUrls.forEach((url, i) => {
            if (i < imagePreviews.length) {
                imagePreviews[i].style.backgroundImage = `url(${url})`;
                imagePreviews[i].innerHTML = `<button class="remove-image-button" data-index="${i}"><ion-icon name="close-circle-outline"></ion-icon></button>`;
            }
        });

        publicationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }




    function renderLocalCard(local) {
        const container = document.getElementById('localCardContainer');
        if (!container || !local) {
            console.error('Container not found or local data is invalid');
            return;
        }

        // Create a safe version with proper decimal handling
        const safeLocal = {
            id: local.id || '',
            name: local.name || 'Sin nombre',
            description: local.description || 'Sin descripción',
            costo: (typeof local.costo === 'number' || typeof local.costo === 'string')
                ? Number(local.costo)
                : 0,
            ciudad: local.ciudad || 'Ciudad no especificada',
            direccion: local.direccion || 'Dirección no especificada',
            tipo: local.tipo || 'Tipo no especificado',
            fotos: Array.isArray(local.fotos) ? local.fotos : [],
            fechaCreacion: local.fechaCreacion || new Date().toISOString()
        };

        const column = document.createElement('div');
        column.className = 'local-card-column';
        column.setAttribute('data-local-id', safeLocal.id);

        const carouselId = `carousel-${safeLocal.id}`;

        const slides = safeLocal.fotos
            .filter(url => typeof url === 'string')
            .map(url => `<figure><img src="${url}" alt="Imagen"></figure>`)
            .join('');

        const indicators = safeLocal.fotos
            .map((_, i) => `<li data-index="${i}" class="${i === 0 ? 'active' : ''}"></li>`)
            .join('');

        const timeAgo = getTimeAgo(safeLocal.fechaCreacion);

        // Format the price safely
        const formattedPrice = !isNaN(safeLocal.costo)
            ? safeLocal.costo.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
            : '0.00';

        column.innerHTML = `
    <div class="card">
        <div class="card-image">
            <div class="carousel-container">
                <div class="carousel" id="${carouselId}">${slides}</div>
                <div class="carousel-navigation">
                    <button class="carousel-control-prev" data-target="${carouselId}"><ion-icon name="chevron-back-outline"></ion-icon></button>
                    <ol class="carousel-indicators" id="indicators-${carouselId}">${indicators}</ol>
                    <button class="carousel-control-next" data-target="${carouselId}"><ion-icon name="chevron-forward-outline"></ion-icon></button>
                </div>
            </div>
        </div>
        <div class="card-content">
            <div class="media">
                <div class="media-content">
                    <p class="title is-6">${safeLocal.name}</p>
                    <p class="subtitle is-7">${safeLocal.description}</p>
                </div>
            </div>
            <div class="content">
                <p><strong>Ciudad:</strong> ${safeLocal.ciudad}</p>
                <p><strong>Tipo:</strong> ${safeLocal.tipo}</p>
                <p><strong>Dirección:</strong> ${safeLocal.direccion}</p>
                <p><strong>Precio:</strong> $${formattedPrice}</p>
                <small>${timeAgo}</small>
            </div>
            <div class="buttons">
                <button class="button is-info is-light btn-editar"><ion-icon name="create-outline"></ion-icon><span>Editar</span></button>
                <button class="button is-danger is-light btn-eliminar"><ion-icon name="trash-outline"></ion-icon><span>Eliminar</span></button>
            </div>
        </div>
    </div>`;

        column.querySelector('.btn-editar')?.addEventListener('click', () => handleEditLocal(local));
        column.querySelector('.btn-eliminar')?.addEventListener('click', () => handleDeleteLocal(safeLocal.id, column));
        container.prepend(column);
        initializeCarousel(carouselId);
    }

    function getTimeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const seconds = Math.floor((now - past) / 1000);
        const intervals = [
            { label: 'año', seconds: 31536000 },
            { label: 'mes', seconds: 2592000 },
            { label: 'día', seconds: 86400 },
            { label: 'hora', seconds: 3600 },
            { label: 'minuto', seconds: 60 },
            { label: 'segundo', seconds: 1 }
        ];
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) return `Publicado hace ${count} ${interval.label}${count !== 1 ? 's' : ''}`;
        }
        return 'Publicado justo ahora';
    }

    async function loadUserLocales() {
        const token = await getJwtToken();
        const userId = await getUserId();
        const res = await fetch(`${API_BASE_URL}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const locales = await res.json();
        locales.forEach(renderLocalCard);
    }

    function showSuccessMessage(msg) {
        const notification = document.getElementById('floatingNotification');
        notification.classList.remove('error'); // ← por si quedó de un error previo
        notification.innerText = msg;
        notification.style.display = 'flex';
        notification.classList.add('visible');

        setTimeout(() => {
            notification.style.display = 'none';
            notification.classList.remove('visible');
        }, 3000);
    }



    function showErrorMessage(msg) {
        errorNotification.innerText = msg;
        errorNotification.classList.add('visible', 'error');
        setTimeout(() => errorNotification.classList.remove('visible', 'error'), 5000);
    }
});
