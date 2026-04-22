// Application State
const state = {
    places: [],
    filteredPlaces: [],
    currentView: 'cards',
    filters: {
        text: '',
        category: 'todos'
    }
};

// DOM Elements
const cardsView = document.getElementById('cards-view');
const listView = document.getElementById('list-view');
const mapViewContainer = document.getElementById('map-view-container');
const weatherView = document.getElementById('weather-view');
const searchInput = document.getElementById('search-input');
const categoryFilters = document.getElementById('category-filters');
const modal = document.getElementById('place-modal');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');

// Initialize App
async function init() {
    try {
        const response = await fetch('lista.json');
        state.places = await response.json();
        state.filteredPlaces = [...state.places];
        
        setupEventListeners();
        renderCurrentView();
        registerSW();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        state.filters.text = e.target.value.toLowerCase();
        filterPlaces();
    });

    // Categories
    categoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;

        document.querySelectorAll('.category-btn').forEach(b => {
            b.classList.remove('bg-primary', 'text-white');
            b.classList.add('bg-white', 'text-on-surface');
        });
        btn.classList.remove('bg-white', 'text-on-surface');
        btn.classList.add('bg-primary', 'text-white');

        state.filters.category = btn.dataset.category;
        filterPlaces();
    });

    // Close modal
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };
}

function filterPlaces() {
    state.filteredPlaces = state.places.filter(place => {
        const matchesText = place.nombre.toLowerCase().includes(state.filters.text) || 
                           place.descripcion.toLowerCase().includes(state.filters.text);
        const matchesCategory = state.filters.category === 'todos' || 
                               place.tipo.toLowerCase() === state.filters.category.toLowerCase();
        return matchesText && matchesCategory;
    });
    renderCurrentView();
}

function setView(view) {
    state.currentView = view;
    
    // Update active nav state
    document.querySelectorAll('.view-nav, .nav-btn').forEach(el => {
        if (el.dataset.view === view) {
            el.classList.add('text-primary', 'font-bold');
            el.classList.remove('text-outline');
            if (el.classList.contains('view-nav')) el.classList.add('border-b-2', 'border-primary');
        } else {
            el.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-primary');
            el.classList.add('text-outline');
        }
    });

    // Update Titles
    if (view === 'cards' || view === 'list') {
        viewTitle.textContent = 'Serenidad Mediterránea';
        viewSubtitle.textContent = 'Descubre los tesoros ocultos de la costa volcánica y la historia viva de Almería.';
        document.getElementById('search-filter-section').classList.remove('hidden');
    } else if (view === 'map') {
        viewTitle.textContent = 'Mapa Interactivo';
        viewSubtitle.textContent = 'Localiza todos los puntos de interés y planifica tu ruta.';
        document.getElementById('search-filter-section').classList.add('hidden');
    } else {
        viewTitle.textContent = 'Pronóstico del Tiempo';
        viewSubtitle.textContent = 'Consulta el clima en Almería para los próximos días.';
        document.getElementById('search-filter-section').classList.add('hidden');
    }

    renderCurrentView();
}

function renderCurrentView() {
    // Hide all
    [cardsView, listView, mapViewContainer, weatherView].forEach(v => v.classList.add('hidden'));

    if (state.currentView === 'cards') {
        cardsView.classList.remove('hidden');
        renderCards();
    } else if (state.currentView === 'list') {
        listView.classList.remove('hidden');
        renderList();
    } else if (state.currentView === 'map') {
        mapViewContainer.classList.remove('hidden');
        initMap(state.filteredPlaces);
    } else if (state.currentView === 'weather') {
        weatherView.classList.remove('hidden');
        renderWeather();
    }
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHtml += '<span class="material-symbols-outlined text-sm" style="font-variation-settings: \'FILL\' 1;">star</span>';
        } else if (i === fullStars && hasHalfStar) {
            starsHtml += '<span class="material-symbols-outlined text-sm" style="font-variation-settings: \'FILL\' 1;">star_half</span>';
        } else {
            starsHtml += '<span class="material-symbols-outlined text-sm">star</span>';
        }
    }
    return starsHtml;
}

function renderCards() {
    cardsView.innerHTML = state.filteredPlaces.map(place => `
        <div onclick="App.showDetails(${place.id})" class="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div class="relative h-64 overflow-hidden">
                <img src="${place.imagen}" alt="${place.nombre}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 hero-gradient"></div>
                <div class="absolute bottom-4 left-4 right-4">
                    <span class="bg-primary/30 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                        ${place.tipo}
                    </span>
                    <h3 class="text-white font-display font-bold text-xl">${place.nombre}</h3>
                    <div class="flex items-center gap-1 text-secondary-container mt-1">
                        ${renderStars(place.puntuacion)}
                        <span class="text-xs ml-1 text-white/90">${place.puntuacion}</span>
                    </div>
                </div>
            </div>
            <div class="p-5">
                <p class="text-on-surface-variant text-sm line-clamp-2">${place.descripcion}</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-primary font-bold text-xs uppercase tracking-tighter">Ver detalles</span>
                    <button onclick="event.stopPropagation(); App.sharePlace(${place.id})" class="text-outline hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-lg">share</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderList() {
    listView.innerHTML = state.filteredPlaces.map(place => `
        <div onclick="App.showDetails(${place.id})" class="group bg-white border border-outline-variant/30 rounded-2xl p-3 flex gap-4 items-center hover:shadow-lg transition-all cursor-pointer">
            <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img src="${place.imagen}" alt="${place.nombre}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="flex-grow">
                <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1 block">${place.tipo}</span>
                    <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-sm">arrow_forward_ios</span>
                </div>
                <h3 class="font-display font-bold text-primary leading-tight mb-1">${place.nombre}</h3>
                <div class="flex items-center gap-3">
                    <div class="flex items-center text-secondary">
                        ${renderStars(place.puntuacion)}
                        <span class="text-xs font-bold ml-1">${place.puntuacion}</span>
                    </div>
                    <div class="flex items-center text-outline">
                        <span class="material-symbols-outlined text-xs">location_on</span>
                        <span class="text-xs ml-1">Almería</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function showDetails(id) {
    const place = state.places.find(p => p.id === id);
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="relative h-[300px]">
            <img src="${place.imagen}" class="w-full h-full object-cover" alt="${place.nombre}">
            <button onclick="App.closeModal()" class="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white hover:text-primary transition-all">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6">
                <span class="bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">${place.tipo}</span>
                <h2 class="text-3xl font-display font-bold text-white">${place.nombre}</h2>
                <div class="flex items-center gap-1 text-secondary-container mt-2">
                    ${renderStars(place.puntuacion)}
                    <span class="text-sm ml-1 text-white">${place.puntuacion} • Puntuación de Google</span>
                </div>
            </div>
        </div>
        <div class="p-8">
            <p class="text-on-surface-variant text-lg leading-relaxed mb-8">${place.long_descripcion || place.descripcion}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="flex items-start gap-4">
                    <div class="p-3 bg-background rounded-xl text-primary">
                        <span class="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                        <span class="block text-[10px] font-bold text-outline uppercase tracking-widest">Dirección</span>
                        <p class="text-on-surface font-semibold">${place.direccion || 'Consultar mapa'}</p>
                    </div>
                </div>
                <div class="flex items-start gap-4">
                    <div class="p-3 bg-background rounded-xl text-primary">
                        <span class="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                        <span class="block text-[10px] font-bold text-outline uppercase tracking-widest">Horario</span>
                        <p class="text-on-surface font-semibold">${place.horario || 'Abierto 24h'}</p>
                    </div>
                </div>
                <div class="flex items-start gap-4">
                    <div class="p-3 bg-background rounded-xl text-primary">
                        <span class="material-symbols-outlined">call</span>
                    </div>
                    <div>
                        <span class="block text-[10px] font-bold text-outline uppercase tracking-widest">Teléfono</span>
                        <p class="text-on-surface font-semibold">${place.telefono || 'No disponible'}</p>
                    </div>
                </div>
                ${place.web ? `
                <div class="flex items-start gap-4">
                    <div class="p-3 bg-background rounded-xl text-primary">
                        <span class="material-symbols-outlined">language</span>
                    </div>
                    <div>
                        <span class="block text-[10px] font-bold text-outline uppercase tracking-widest">Sitio Web</span>
                        <a href="${place.web}" target="_blank" class="text-primary font-bold hover:underline">Visitar web oficial</a>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="flex flex-wrap gap-4 pt-8 border-t border-outline-variant/30">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" 
                   class="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95">
                    <span class="material-symbols-outlined">directions</span> Cómo llegar
                </a>
                <button onclick="App.sharePlace(${place.id})" 
                        class="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95">
                    <span class="material-symbols-outlined">share</span> Compartir sitio
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

async function sharePlace(id) {
    const place = state.places.find(p => p.id === id);
    if (navigator.share) {
        try {
            await navigator.share({
                title: place.nombre,
                text: place.descripcion,
                url: window.location.href
            });
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        alert('Copiado al portapapeles: ' + window.location.href);
    }
}

function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
}

// Global App Object for HTML event handlers
window.App = {
    init,
    setView,
    showDetails,
    closeModal,
    sharePlace
};

init();
