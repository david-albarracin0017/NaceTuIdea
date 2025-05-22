
    // ------------------------- CARRUSEL DE IMÁGENES -------------------------
    function initializeCarousel(carouselId) {
        const carousel = document.querySelector(`.carousel-${carouselId}`);
        const slides = carousel ? carousel.querySelectorAll('figure') : [];
        const slideCount = slides.length;
        let currentIndex = 0;
        let autoSlideInterval;
        const nextButton = document.querySelector(`.carousel-control-next-${carouselId}`);
        const prevButton = document.querySelector(`.carousel-control-prev-${carouselId}`);
        const indicators = document.querySelectorAll(`.carousel-indicators-${carouselId} li`);

        if (!carousel) return;
            
        function updateIndicators() {
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            if (index < 0) {
                currentIndex = slideCount - 1;
            } else if (index >= slideCount) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }

            const translateX = -currentIndex * 100;
            carousel.style.transform = `translateX(${translateX}%)`;
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

        function startAutoSlide(interval = 3000) {
            autoSlideInterval = setInterval(nextSlide, interval);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        if (nextButton && prevButton) {
            nextButton.addEventListener('click', nextSlide);
            prevButton.addEventListener('click', prevSlide);
        }

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                resetAutoSlide();
            });
        });

        if (slideCount > 0) {
            startAutoSlide();
            goToSlide(0);
        }
    }

    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach((carousel, index) => {
        initializeCarousel(index + 1);
    });

// modals
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal-overlay');
    const openBtn = document.getElementById('publicbtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelUpdate');
    const submitBtn = document.querySelector('.btn-confirm');
    const modalTitle = document.querySelector('.public-modal h3');

    const fotosInput = document.getElementById('fotos');
    const imagePreviews = [
        document.getElementById('image-preview-1'),
        document.getElementById('image-preview-2'),
        document.getElementById('image-preview-3')
    ];
    let selectedImages = [null, null, null];
    let currentImageIndex = null;

    const deleteModal = document.getElementById('confirmDeleteModal');
    const deleteConfirmBtn = deleteModal?.querySelector('.btn-delete');
    const deleteCancelBtn = deleteModal?.querySelector('.btn-cancel');
    const deleteCloseBtn = deleteModal?.querySelector('.close-modal');

    const openPublicationModal = (edit = false, data = null) => {
        modal.style.display = 'flex';
        modalTitle.innerHTML = edit
            ? '<ion-icon name="create-outline"></ion-icon> Editar publicación'
            : '<ion-icon name="add-outline"></ion-icon> Publicar nuevo local';

        if (edit && data) {
            document.getElementById('Name').value = data.nombre || '';
            document.getElementById('Description').value = data.descripcion || '';
            document.getElementById('Costo').value = data.costo || '';
            document.getElementById('Ciudad').value = data.ciudad || '';
            document.getElementById('Direccion').value = data.direccion || '';
            document.getElementById('Tipo').value = data.tipo || '';
        } else {
            resetForm();
        }
    };

    const closeModal = () => {
        modal.style.display = 'none';
        resetForm();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    openBtn?.addEventListener('click', () => openPublicationModal());

    fotosInput.addEventListener('change', () => {
        const file = fotosInput.files[0];
        if (file && currentImageIndex !== null) {
            selectedImages[currentImageIndex] = file;
            const reader = new FileReader();
            reader.onload = e => {
                imagePreviews[currentImageIndex].innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <button class="remove-image-button" data-index="${currentImageIndex}">&times;</button>
        `;
            };
            reader.readAsDataURL(file);
        }
        fotosInput.value = '';
    });

    imagePreviews.forEach((preview, index) => {
        preview.addEventListener('click', () => {
            currentImageIndex = index;
            fotosInput.click();
        });
    });

    document.querySelector('.image-upload-container').addEventListener('click', e => {
        if (e.target.classList.contains('remove-image-button')) {
            const index = parseInt(e.target.dataset.index);
            selectedImages[index] = null;
            resetImagePreview(index);
        }
    });

    function resetImagePreview(index) {
        imagePreviews[index].innerHTML = `<ion-icon name="image-outline"></ion-icon>`;
    }

    function resetImagePreviews() {
        for (let i = 0; i < imagePreviews.length; i++) {
            resetImagePreview(i);
        }
        selectedImages = [null, null, null];
    }

    function resetForm() {
        document.getElementById('Name').value = '';
        document.getElementById('Description').value = '';
        document.getElementById('Costo').value = '';
        document.getElementById('Ciudad').value = '';
        document.getElementById('Direccion').value = '';
        document.getElementById('Tipo').value = '';
        resetImagePreviews();
    }

    function showSuccessMessage(message = '¡Operación realizada con éxito!') {
        const notif = document.getElementById('successNotification');
        notif.innerHTML = `<ion-icon name="checkmark-circle-outline"></ion-icon> ${message}`;
        notif.style.display = 'flex';
        notif.classList.add('visible');
        setTimeout(() => {
            notif.classList.remove('visible');
            setTimeout(() => {
                notif.style.display = 'none';
            }, 300);
        }, 3000);
    }

    submitBtn.addEventListener('click', () => {
        const data = {
            nombre: document.getElementById('Name').value,
            descripcion: document.getElementById('Description').value,
            costo: document.getElementById('Costo').value,
            ciudad: document.getElementById('Ciudad').value,
            direccion: document.getElementById('Direccion').value,
            tipo: document.getElementById('Tipo').value,
            imagenes: selectedImages.filter(img => img)
        };

        if (!data.nombre || !data.descripcion || !data.costo || !data.ciudad || !data.direccion || !data.tipo) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        console.log('Datos a enviar:', data);
        closeModal();
        showSuccessMessage('¡Publicación realizada con éxito!');
    });

    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', () => {
            deleteModal.style.display = 'flex';
        });
    });

    const closeDeleteModal = () => deleteModal.style.display = 'none';
    deleteCloseBtn?.addEventListener('click', closeDeleteModal);
    deleteCancelBtn?.addEventListener('click', closeDeleteModal);

    deleteConfirmBtn?.addEventListener('click', () => {
        console.log('Publicación eliminada');
        closeDeleteModal();
        showSuccessMessage('¡Publicación eliminada con éxito!');
    });

    document.querySelectorAll('.btn-editar').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card');
            const nombre = card.querySelector('.title.is-6')?.textContent.trim();
            const descripcion = card.querySelector('.subtitle.is-7')?.textContent.trim();
            const ciudad = card.querySelector('.content p:nth-child(1)')?.textContent.split(':')[1]?.trim();
            const tipo = card.querySelector('.content p:nth-child(2)')?.textContent.split(':')[1]?.trim();
            const direccion = card.querySelector('.content p:nth-child(3)')?.textContent.split(':')[1]?.trim();
            const costo = card.querySelector('.content p:nth-child(4)')?.textContent.replace(/\D/g, '');
            const data = { nombre, descripcion, ciudad, tipo, direccion, costo };
            openPublicationModal(true, data);
        });
    });
});
