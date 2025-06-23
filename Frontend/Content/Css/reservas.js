

// ==============================
//  Variables de entorno
// ==============================
const API_RESERVAS = 'https://localhost:7135/api/Reservas';
const API_LOCALES = 'https://localhost:7135/api/Local';

// ==============================
//  Obtener token JWT y usuario actual
// ==============================
async function getJwtToken() {
    try {
        const res = await fetch('/Token/Obtener', { method: 'GET', credentials: 'include' });
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

// ==============================
//  Funciones utilitarias
// ==============================
function sanitize(str) {
    if (!str) return '';
    return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `
        <ion-icon name="${isError ? 'alert-circle' : 'checkmark-circle'}"></ion-icon>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => toast.remove(), 3000);
}

// ==============================
//  Renderizar tarjetas de reservas
// ==============================
function renderReservaCard(reserva, esSolicitada = false) {
    const card = document.createElement('div');
    card.className = 'reserva-card';

    const fotos = reserva.local.fotos || [];
    const primerFoto = fotos[0] || '';

    card.innerHTML = `
        <div class="card">
            <div class="card-image">
                <div class="carousel-container">
                    <div class="carousel" id="carousel-${reserva.id}">
                        ${fotos.map(url => `<figure><div class="image-container"><img src="${sanitize(url)}" /></div></figure>`).join('')}
                    </div>
                    <button class="carousel-control-prev" data-target="carousel-${reserva.id}"><ion-icon name="chevron-back-outline"></ion-icon></button>
                    <button class="carousel-control-next" data-target="carousel-${reserva.id}"><ion-icon name="chevron-forward-outline"></ion-icon></button>
                    <ol class="carousel-indicators" id="indicators-carousel-${reserva.id}">
                        ${fotos.map((_, i) => `<li class="${i === 0 ? 'active' : ''}" data-target="carousel-${reserva.id}" data-slide-to="${i}"></li>`).join('')}
                    </ol>
                </div>
            </div>
            <div class="card-content">
                <h3>${sanitize(reserva.local.name)}</h3>
                <p><strong>Dirección:</strong> ${sanitize(reserva.local.direccion)}</p>
                <p><strong>Fecha:</strong> ${sanitize(reserva.fechaInicio)} - ${sanitize(reserva.fechaFin)}</p>
                <div class="buttons">
                    ${esSolicitada ? `
                        <button class="btn-accept" data-id="${reserva.id}"><ion-icon name="checkmark-outline"></ion-icon> Aceptar</button>
                        <button class="btn-reject" data-id="${reserva.id}"><ion-icon name="close-outline"></ion-icon> Rechazar</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    setTimeout(() => initializeCarousel(`carousel-${reserva.id}`), 10);

    return card;
}

// ==============================
//  Cargar y renderizar reservas
// ==============================
async function cargarReservas() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const token = await getJwtToken();
    if (!token) return;

    try {
        const res = await fetch(`${API_RESERVAS}/usuario/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('No se pudieron obtener las reservas');

        const reservas = await res.json();
        const hechas = reservas.filter(r => r.usuarioId === userId);
        const recibidas = reservas.filter(r => r.local?.usuarioId === userId);

        const hechasContenedor = document.getElementById('reservas-hechas');
        const recibidasContenedor = document.getElementById('reservas-recibidas');

        hechasContenedor.innerHTML = '';
        recibidasContenedor.innerHTML = '';

        hechas.forEach(reserva => hechasContenedor.appendChild(renderReservaCard(reserva)));
        recibidas.forEach(reserva => recibidasContenedor.appendChild(renderReservaCard(reserva, true)));

    } catch (error) {
        console.error(error);
        showToast('Error al cargar reservas', true);
    }
}

// ==============================
//  Init
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    cargarReservas();
});
