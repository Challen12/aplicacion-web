let map;
let markers = [];

function initMap(places) {
    if (map) {
        map.remove();
    }

    // Initialize map centered in Almería
    map = L.map('map-view').setView([36.8381, -2.4597], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Custom Icon
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="bg-primary p-2 rounded-full shadow-lg text-white flex items-center justify-center border-2 border-white scale-90 hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">location_on</span>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    markers = [];
    places.forEach(place => {
        const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);
        
        // Custom Popup
        const popupContent = `
            <div class="w-48 bg-white rounded-xl overflow-hidden shadow-xl border border-outline-variant/30 font-body">
                <img src="${place.imagen}" class="w-full h-24 object-cover" alt="${place.nombre}">
                <div class="p-3">
                    <h3 class="font-display font-bold text-primary text-sm leading-tight">${place.nombre}</h3>
                    <div class="flex items-center gap-1 text-secondary mt-1">
                        <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="text-[10px] font-bold">${place.puntuacion}</span>
                    </div>
                    <button onclick="App.showDetails(${place.id})" class="mt-2 w-full bg-primary text-white text-[10px] py-1.5 rounded-lg font-bold">Ver ficha</button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            closeButton: false,
            className: 'custom-leaflet-popup'
        });
        
        markers.push(marker);
    });
}

window.initMap = initMap;
