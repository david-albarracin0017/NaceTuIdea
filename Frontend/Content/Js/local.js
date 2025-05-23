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

// Inicializar todos los carruseles
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('[class^="carousel-"]');
    carousels.forEach((carousel, index) => {
        initializeCarousel(index + 1);
    });

    // ------------------------- MODALES GENERALES -------------------------
    const modal = document.querySelector('.modal-overlay');
    const openBtn = document.getElementById('publicbtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelUpdate');

    // Mostrar modal
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'flex';
        });
    }

    // Cerrar modal
    const closeModal = () => {
        if (modal) modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Manejo del modal de eliminación
    const deleteModal = document.getElementById('confirmDeleteModal');
    if (deleteModal) {
        const deleteConfirmBtn = deleteModal.querySelector('.btn-delete');
        const deleteCancelBtn = deleteModal.querySelector('.btn-cancel');
        const deleteCloseBtn = deleteModal.querySelector('.close-modal');

        // Abrir modal de confirmación de eliminación
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', () => {
                deleteModal.style.display = 'flex';
            });
        });

        // Cerrar modal de eliminación
        const closeDeleteModal = () => deleteModal.style.display = 'none';
        if (deleteCloseBtn) deleteCloseBtn.addEventListener('click', closeDeleteModal);
        if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeDeleteModal);

        // Confirmar eliminación
        if (deleteConfirmBtn) {
            deleteConfirmBtn.addEventListener('click', () => {
                console.log('Publicación eliminada');
                closeDeleteModal();
                showSuccessMessage('¡Publicación eliminada con éxito!');
            });
        }
    }

    // Mostrar mensaje de éxito
    function showSuccessMessage(message = '¡Operación realizada con éxito!') {
        const notif = document.getElementById('successNotification');
        if (notif) {
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
    }

    // Manejo de botones de edición
    document.querySelectorAll('.btn-editar').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card');
            const nombre = card.querySelector('.title.is-6')?.textContent.trim();
            const descripcion = card.querySelector('.subtitle.is-7')?.textContent.trim();
            const ciudad = card.querySelector('.content p:nth-child(1)')?.textContent.split(':')[1]?.trim();
            const tipo = card.querySelector('.content p:nth-child(2)')?.textContent.split(':')[1]?.trim();
            const direccion = card.querySelector('.content p:nth-child(3)')?.textContent.split(':')[1]?.trim();
            const costo = card.querySelector('.content p:nth-child(4)')?.textContent.replace(/\D/g, '');

            // Abrir modal de edición
            if (modal) {
                modal.style.display = 'flex';
                document.getElementById('Name').value = nombre || '';
                document.getElementById('Description').value = descripcion || '';
                document.getElementById('Costo').value = costo || '';
                document.getElementById('Ciudad').value = ciudad || '';
                document.getElementById('Direccion').value = direccion || '';
                document.getElementById('Tipo').value = tipo || '';
            }
        });
    });
});