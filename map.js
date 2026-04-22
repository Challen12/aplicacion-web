export function initMap() {
    // Coordenadas de Almería centro
    const map = L.map('map').setView([36.834, -2.463], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return map;
}

export function renderMapMarkers(map, data, onMarkerClick) {
    data.forEach(place => {
        const marker = L.marker([place.lat, place.lng]).addTo(map);
        
        const popupContent = `
            <div style="font-family: 'Outfit', sans-serif;">
                <h4 style="margin-bottom: 5px;">${place.nombre}</h4>
                <p style="font-size: 12px; margin-bottom: 10px;">${place.tipo}</p>
                <button class="popup-btn" style="background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 11px;">Ver Detalles</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        marker.on('popupopen', () => {
            const btn = document.querySelector('.popup-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    onMarkerClick(place);
                });
            }
        });
    });
}
