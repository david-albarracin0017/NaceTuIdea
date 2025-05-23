document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM específicos para CRUD
    const crudSubmitBtn = document.getElementById('submitBtn');
    const crudCancelBtn = document.getElementById('cancelUpdate');
    const crudCloseModal = document.getElementById('closeModal');
    const crudFotosInput = document.getElementById('fotos');
    const crudImagePreviews = [
        document.getElementById('image-preview-1'),
        document.getElementById('image-preview-2'),
        document.getElementById('image-preview-3')
    ];

    // Variables para almacenar las imágenes
    let selectedImages = [];
    let uploadedImageUrls = [];

    // Click en recuadro para cargar imágenes
    crudImagePreviews.forEach(preview => {
        preview.addEventListener('click', () => crudFotosInput.click());
    });

    // Eliminar imagen seleccionada
    document.querySelector('.image-upload-container').addEventListener('click', e => {
        if (e.target.classList.contains('remove-image-button')) {
            const index = parseInt(e.target.dataset.index);
            selectedImages.splice(index, 1);
            uploadedImageUrls = [];
            resetImagePreviews();
            updateImagePreviews();
        }
    });

    function resetImagePreviews() {
        crudImagePreviews.forEach(preview => {
            preview.innerHTML = `<ion-icon name="image-outline"></ion-icon>`;
            preview.style.backgroundImage = '';
        });
        crudFotosInput.value = '';
    }

    function updateImagePreviews() {
        resetImagePreviews();

        selectedImages.slice(0, 3).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                crudImagePreviews[index].style.backgroundImage = `url(${event.target.result})`;
                crudImagePreviews[index].innerHTML = `
                    <button class="remove-image-button" data-index="${index}">
                        <ion-icon name="close-circle-outline"></ion-icon>
                    </button>
                `;
            };
            reader.readAsDataURL(file);
        });
    }

    // Manejar la selección de archivos
    crudFotosInput.addEventListener('change', function (e) {
        selectedImages = Array.from(e.target.files);
        uploadedImageUrls = [];
        updateImagePreviews();
    });

    // Función para subir imágenes a ImgBB
    async function uploadImagesToImgBB(files) {
        const urls = [];
        const apiKey = '9107f6638e7dadfa22334599d9bc5d40';

        for (const file of files.slice(0, 3)) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('key', apiKey);

            try {
                const response = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    urls.push(data.data.url);
                } else {
                    console.error('Error al subir imagen:', data);
                }
            } catch (error) {
                console.error('Error al subir imagen:', error);
            }
        }

        return urls;
    }

    // Función para obtener el token JWT
    async function getJwtToken() {
        try {
            const response = await fetch('/Token/Obtener', {
                method: 'GET'
            });

            const data = await response.json();
            return data.success ? data.token : null;
        } catch (error) {
            console.error('Error al obtener token:', error);
            return null;
        }
    }

    // Función para obtener el ID del usuario desde el token
    async function getUserId() {
        try {
            const response = await fetch('/Token/GetUserId', {
                method: 'GET'
            });

            if (response.ok) {
                return await response.text();
            } else {
                console.error('Error al obtener ID de usuario:', await response.text());
                return null;
            }
        } catch (error) {
            console.error('Error al obtener ID de usuario:', error);
            return null;
        }
    }

    // Función para crear el local
    async function createLocal(localData) {
        const token = await getJwtToken();
        if (!token) {
            alert('No estás autenticado. Por favor, inicia sesión primero.');
            return;
        }

        try {
            const response = await fetch('https://localhost:7135/api/Local', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(localData)
            });

            if (response.ok) {
                const data = await response.json();
                alert('Local creado exitosamente!');
                document.querySelectorAll('.modal-content .input').forEach(input => input.value = '');
                selectedImages = [];
                uploadedImageUrls = [];
                resetImagePreviews();
                document.querySelector('.modal-overlay').style.display = 'none';
            } else {
                const error = await response.text();
                console.error('Error al crear local:', error);
                alert('Error al crear local: ' + error);
            }
        } catch (error) {
            console.error('Error al crear local:', error);
            alert('Error al crear local: ' + error.message);
        }
    }

    // Manejar el envío del formulario
    crudSubmitBtn.addEventListener('click', async function () {
        const name = document.getElementById('Name').value;
        const description = document.getElementById('Description').value;
        const costo = document.getElementById('Costo').value;
        const ciudad = document.getElementById('Ciudad').value;
        const direccion = document.getElementById('Direccion').value;
        const tipo = document.getElementById('Tipo').value;

        if (!name || !description || !costo || !ciudad || !direccion || !tipo) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }

        if (selectedImages.length === 0) {
            alert('Por favor, selecciona al menos una imagen para el local.');
            return;
        }

        const userId = await getUserId();
        if (!userId) {
            alert('No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
            return;
        }

        crudSubmitBtn.disabled = true;
        crudSubmitBtn.innerHTML = 'Subiendo imágenes...';

        try {
            uploadedImageUrls = await uploadImagesToImgBB(selectedImages);
            if (uploadedImageUrls.length === 0) {
                alert('No se pudieron subir las imágenes. Por favor, inténtalo de nuevo.');
                crudSubmitBtn.disabled = false;
                crudSubmitBtn.innerHTML = 'Publicar';
                return;
            }
        } catch (error) {
            console.error('Error al subir imágenes:', error);
            alert('Error al subir imágenes: ' + error.message);
            crudSubmitBtn.disabled = false;
            crudSubmitBtn.innerHTML = 'Publicar';
            return;
        }

        const localData = {
            name: name,
            description: description,
            costo: parseFloat(costo),
            ciudad: ciudad,
            direccion: direccion,
            tipo: tipo,
            fotos: uploadedImageUrls.join(','),
            propietarioId: userId
        };

        crudSubmitBtn.innerHTML = 'Creando local...';
        await createLocal(localData);
        crudSubmitBtn.disabled = false;
        crudSubmitBtn.innerHTML = 'Publicar';
    });

    // Manejar botones de cancelar/cerrar
    crudCancelBtn.addEventListener('click', function () {
        document.querySelectorAll('.modal-content .input').forEach(input => input.value = '');
        selectedImages = [];
        uploadedImageUrls = [];
        resetImagePreviews();
        document.querySelector('.modal-overlay').style.display = 'none';
    });

    crudCloseModal.addEventListener('click', function () {
        crudCancelBtn.click();
    });
});