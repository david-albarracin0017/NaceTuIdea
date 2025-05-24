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


// Inicializar todos los carruseles
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('[class^="carousel-"]');
    carousels.forEach((carousel, index) => {
        initializeCarousel(index + 1);
    });
});