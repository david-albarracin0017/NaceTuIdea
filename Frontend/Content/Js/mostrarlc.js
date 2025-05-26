document.addEventListener('DOMContentLoaded', async function () {
    const API_BASE_URL = 'https://localhost:7135/api/Local';

    const token = await getJwtToken();
    if (!token) {
        console.error('No se pudo obtener el token JWT');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/todos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('No se pudieron obtener los locales.');
        const locales = await res.json();

        renderSection('Todas las publicaciones', 'albums-all-grid', 'earth-outline', locales);
        renderSection('Publicaciones más recientes', 'albums-recent-grid', 'time-outline', getLocalesRecientes(locales));
        renderSection('Publicaciones recomendadas', 'albums-recommended-grid', 'star-outline', getLocalesRecomendados(locales));

    } catch (err) {
        console.error('Error al cargar los locales:', err.message);
    }

    function renderSection(title, gridId, iconName, locales) {
        const section = document.getElementById(gridId)?.parentElement;
        const grid = document.getElementById(gridId);
        if (!section || !grid) return;

        section.querySelector('h2')?.remove(); // evita duplicado si recarga
        const header = document.createElement('h2');
        header.innerHTML = `<ion-icon name="${iconName}"></ion-icon> ${title}`;
        section.prepend(header);

        grid.innerHTML = '';
        locales.forEach(local => {
            const card = renderLocalCard(local);
            grid.appendChild(card);
        });
    }

    function renderLocalCard(local) {
        const column = document.createElement('div');
        column.className = 'local-card-column';
        column.setAttribute('data-local-id', local.id);

        const fotos = local.fotos || [];
        const carouselId = `carousel-${local.id}`;
        const timeAgo = getTimeAgo(local.fechaCreacion || new Date().toISOString());

        const slides = fotos.map(url => `<figure><img src="${url}" alt="Imagen"></figure>`).join('');
        const indicators = fotos.map((_, i) => `<li data-index="${i}" class="${i === 0 ? 'active' : ''}"></li>`).join('');

        column.innerHTML = `
    <div class="card">
        <div class="card-image">
            <div class="carousel-container">
                <div class="carousel" id="${carouselId}">${slides}</div>
                <div class="carousel-navigation">
                    <button class="carousel-control-prev" data-target="${carouselId}">
                        <ion-icon name="chevron-back-outline"></ion-icon>
                    </button>
                    <ol class="carousel-indicators" id="indicators-${carouselId}">
                        ${indicators}
                    </ol>
                    <button class="carousel-control-next" data-target="${carouselId}">
                        <ion-icon name="chevron-forward-outline"></ion-icon>
                    </button>
                </div>
            </div>
        </div>
        <div class="card-content">
            <div class="media-content">
                <p class="title is-6">${local.name}</p>
                <ion-icon class="favorite-btn" name="heart-outline"></ion-icon>
                <p class="subtitle is-7">${local.description}</p>
            </div>
            <div class="content">
                <p><strong>Ciudad:</strong> ${local.ciudad}</p>
                <p><strong>Tipo:</strong> ${local.tipo}</p>
                <p><strong>Dirección:</strong> ${local.direccion}</p>
                <p><strong>Precio:</strong> $${local.costo.toLocaleString()}</p>
                <small>${timeAgo}</small>
            </div>
            <div class="buttons">
                <button class="button is-primary"><ion-icon name="chatbubbles-outline"></ion-icon> Contactar</button>
                <button class="button is-success"><ion-icon name="calendar-outline"></ion-icon> Reservar</button>
            </div>
        </div>
    </div>`;

        // activar ícono de favorito
        const favBtn = column.querySelector('.favorite-btn');
        favBtn.addEventListener('click', () => {
            favBtn.name = favBtn.name === 'heart-outline' ? 'heart' : 'heart-outline';
        });

        // iniciar el carrusel
        setTimeout(() => {
            initializeCarousel(carouselId);
        }, 100);

        return column;
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

    function getLocalesRecientes(locales) {
        return [...locales]
            .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
            .slice(0, 5);
    }

    function getLocalesRecomendados(locales) {
        return locales.filter(l => l.costo && l.costo <= 1000); // criterio ajustable
    }

    async function getJwtToken() {
        const res = await fetch('/Token/Obtener', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        return data?.success ? data.token : null;
    }
});
