export async function fetchWeather() {
    const lat = 36.8341;
    const lon = -2.4637;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FMadrid`;

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
}

export function renderWeather(container, data) {
    const current = data.current_weather;
    const daily = data.daily;

    container.innerHTML = `
        <div class="current-weather">
            <h3>Hoy en Almería</h3>
            <div class="weather-temp">${Math.round(current.temperature)}°C</div>
            <p class="weather-desc">${getWeatherDesc(current.weathercode)}</p>
            <p style="margin-top: 10px; opacity: 0.8;">Viento: ${current.windspeed} km/h</p>
        </div>
        
        <h3 style="margin-top: 20px; font-weight: 600;">Próximos 7 días</h3>
        <div class="forecast-grid">
            ${daily.time.map((time, i) => {
                const date = new Date(time);
                const dayName = i === 0 ? 'Hoy' : new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date);
                return `
                    <div class="forecast-card">
                        <p style="font-weight: 600; text-transform: capitalize;">${dayName}</p>
                        <div style="font-size: 1.5rem; margin: 8px 0;">${getWeatherIcon(daily.weathercode[i])}</div>
                        <p style="font-size: 0.9rem; font-weight: 600;">${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function getWeatherDesc(code) {
    const codes = {
        0: 'Cielo despejado',
        1: 'Principalmente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla de escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna densa',
        61: 'Lluvia débil',
        63: 'Lluvia moderada',
        65: 'Lluvia fuerte',
        71: 'Nieve débil',
        73: 'Nieve moderada',
        75: 'Nieve fuerte',
        80: 'Chubascos débiles',
        81: 'Chubascos moderados',
        82: 'Chubascos violentos',
        95: 'Tormenta',
    };
    return codes[code] || 'Desconocido';
}

function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '🌤️';
    if (code <= 48) return '🌫️';
    if (code <= 55) return '🌦️';
    if (code <= 65) return '🌧️';
    if (code <= 75) return '❄️';
    if (code <= 82) return '⛈️';
    return '⛅';
}
