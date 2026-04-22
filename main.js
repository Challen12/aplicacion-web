import { initMap, renderMapMarkers } from './map.js';
import { fetchWeather, renderWeather } from './weather.js';

let places = [];
let currentCategory = 'todos';
let searchQuery = '';
let currentView = 'cards';

const appContent = document.getElementById('app-content');
const searchInput = document.getElementById('search-input');
const categoryFilters = document.querySelectorAll('.filter-chip');
const navItems = document.querySelectorAll('.nav-item');
const modal = document.getElementById('details-modal');
const closeModal = document.querySelector('.close-modal');

// Load Data
async function loadPlaces() {
    try {
        const response = await fetch('lista.json');
        places = await response.json();
        renderCurrentView();
    } catch (error) {
        console.error('Error loading places:', error);
        appContent.innerHTML = '<p class="error">Error al cargar los lugares. Por favor, intenta de nuevo.</p>';
    }
}

// Rendering Functions
function renderCurrentView() {
    const filteredPlaces = filterPlaces();
    
    appContent.innerHTML = '';
    
    if (filteredPlaces.length === 0) {
        appContent.innerHTML = `
            <div class="empty-state">
                <span style="font-size: 3rem;">🔍</span>
                <p>No se encontraron lugares que coincidan con tu búsqueda.</p>
                <button class="btn-secondary" onclick="resetFilters()" style="margin-top: 15px;">Limpiar filtros</button>
            </div>
        `;
        return;
    }

    if (currentView === 'cards') {
        renderCards(filteredPlaces);
    } else if (currentView === 'lista') {
        renderList(filteredPlaces);
    } else if (currentView === 'mapa') {
        renderMapView(filteredPlaces);
    } else if (currentView === 'clima') {
        renderWeatherView();
    }
}

function filterPlaces() {
    return places.filter(place => {
        const matchesCategory = currentCategory === 'todos' || place.tipo === currentCategory;
        const matchesSearch = place.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             place.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
}

function renderCards(data) {
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    
    data.forEach(place => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
            <img src="${place.imagen}" alt="${place.nombre}" loading="lazy">
            <div class="place-card-info">
                <span class="place-tag">${place.tipo}</span>
                <h3>${place.nombre}</h3>
                <p>${place.descripcion}</p>
            </div>
        `;
        card.addEventListener('click', () => showDetails(place));
        grid.appendChild(card);
    });
    
    appContent.appendChild(grid);
}

function renderList(data) {
    const container = document.createElement('div');
    container.className = 'list-container';
    
    data.forEach(place => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <img src="${place.imagen}" alt="${place.nombre}">
            <div class="list-item-info">
                <h3>${place.nombre}</h3>
                <span>${place.tipo}</span>
            </div>
        `;
        item.addEventListener('click', () => showDetails(place));
        container.appendChild(item);
    });
    
    appContent.appendChild(container);
}

function renderMapView(data) {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    appContent.appendChild(mapContainer);
    
    // Initialize map after it's in the DOM
    setTimeout(() => {
        const map = initMap();
        renderMapMarkers(map, data, showDetails);
    }, 100);
}

async function renderWeatherView() {
    const container = document.createElement('div');
    container.className = 'weather-container';
    container.innerHTML = '<div class="spinner"></div>';
    appContent.appendChild(container);
    
    const weatherData = await fetchWeather();
    if (weatherData) {
        renderWeather(container, weatherData);
    } else {
        container.innerHTML = '<p>Error al obtener información meteorológica.</p>';
    }
}

// Modal logic
function showDetails(place) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <img src="${place.imagen}" class="modal-hero" alt="${place.nombre}">
        <div class="modal-info">
            <span class="place-tag">${place.tipo}</span>
            <h2>${place.nombre}</h2>
            <p style="margin: 15px 0; color: var(--text-muted);">${place.descripcion}</p>
            
            <div class="modal-actions">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" class="btn-primary">
                    <span>🚗</span> Cómo llegar
                </a>
                <button class="btn-secondary" id="share-btn">
                    <span>📤</span> Compartir
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('share-btn').addEventListener('click', () => {
        sharePlace(place);
    });
}

async function sharePlace(place) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Visita ${place.nombre} en Almería`,
                text: `¡Mira este lugar en Almería! ${place.nombre}: ${place.descripcion}`,
                url: window.location.href
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        alert('La función de compartir no está disponible en este navegador. Copia el enlace manualmente.');
    }
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCurrentView();
});

categoryFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        categoryFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        currentCategory = filter.dataset.category;
        renderCurrentView();
    });
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentView = item.dataset.view;
        
        // Show/hide search and filters based on view
        const headerFilters = document.querySelector('.filters-container');
        if (currentView === 'clima') {
            headerFilters.classList.add('hidden');
        } else {
            headerFilters.classList.remove('hidden');
        }
        
        renderCurrentView();
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

window.resetFilters = () => {
    searchQuery = '';
    currentCategory = 'todos';
    searchInput.value = '';
    categoryFilters.forEach(f => {
        f.classList.remove('active');
        if (f.dataset.category === 'todos') f.classList.add('active');
    });
    renderCurrentView();
};

// Init
loadPlaces();

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW error', err));
    });
}
