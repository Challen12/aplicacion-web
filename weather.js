async function renderWeather() {
    const weatherContainer = document.getElementById('weather-view');
    weatherContainer.innerHTML = '<div class="flex items-center justify-center p-20"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>';

    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=36.8381&longitude=-2.4597&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Europe%2FBerlin');
        const data = await response.json();
        const current = data.current_weather;
        const daily = data.daily;

        const weatherIcons = {
            0: 'sunny',
            1: 'partly_cloudy_day',
            2: 'partly_cloudy_day',
            3: 'cloudy',
            45: 'foggy',
            48: 'foggy',
            51: 'rainy',
            61: 'rainy',
            71: 'snowing',
            80: 'rainy',
            95: 'thunderstorm'
        };

        const getIcon = (code) => weatherIcons[code] || 'sunny';

        weatherContainer.innerHTML = `
            <div class="space-y-12">
                <!-- Hero Weather Card -->
                <section>
                    <div class="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl group">
                        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                             style="background-image: url('https://picsum.photos/seed/almeriaweather/1200/800')"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
                        <div class="absolute inset-0 p-8 flex flex-col justify-end text-white">
                            <div class="flex justify-between items-end">
                                <div>
                                    <p class="font-bold text-secondary-container tracking-widest text-xs mb-2 uppercase">Hoy en Almería</p>
                                    <h2 class="text-7xl font-display font-bold">${Math.round(current.temperature)}°</h2>
                                    <p class="text-xl flex items-center gap-2 mt-2">
                                        <span class="material-symbols-outlined text-3xl">${getIcon(current.weathercode)}</span>
                                        ${getWeatherDesc(current.weathercode)}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <div class="flex items-center justify-end gap-2 mb-1">
                                        <span class="material-symbols-outlined text-secondary-container">air</span>
                                        <span class="text-lg">${current.windspeed} km/h Viento</span>
                                    </div>
                                    <div class="flex items-center justify-end gap-2">
                                        <span class="material-symbols-outlined text-secondary-container">schedule</span>
                                        <span class="text-lg">Actualizado hace poco</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Golden Hour Tracker -->
                <section class="space-y-6">
                    <h3 class="text-2xl font-display font-bold text-primary">Rastreador de Hora Dorada</h3>
                    <div class="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm">
                        <div class="flex justify-between items-center mb-6">
                            <div class="flex items-center gap-3">
                                <div class="bg-secondary-container/30 p-3 rounded-2xl text-secondary">
                                    <span class="material-symbols-outlined">light_mode</span>
                                </div>
                                <span class="font-bold text-on-surface">Condiciones de Luz</span>
                            </div>
                            <span class="text-primary font-bold bg-secondary-container px-4 py-1.5 rounded-full text-xs">Mejor hora para fotos: 19:30 - 21:00</span>
                        </div>
                        <div class="h-10 w-full bg-gradient-to-r from-orange-200 via-blue-900 to-slate-900 rounded-full relative overflow-hidden">
                            <div class="absolute top-0 bottom-0 left-[75%] w-1.5 bg-white/40 backdrop-blur-sm shadow-xl"></div>
                        </div>
                        <div class="flex justify-between mt-4 text-xs font-bold text-outline uppercase tracking-widest">
                            <span>Amanecer 07:12</span>
                            <span>Mediodía 14:24</span>
                            <span>Atardecer 21:05</span>
                        </div>
                    </div>
                </section>

                <!-- 7-Day Forecast -->
                <section class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl font-display font-bold text-primary">Pronóstico 7 días</h3>
                        <span class="text-xs font-bold text-outline uppercase tracking-widest">Próxima semana</span>
                    </div>
                    <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-5 px-5">
                        ${daily.time.map((date, i) => `
                            <div class="flex-none bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col items-center justify-center min-w-[120px] hover:border-primary transition-colors group">
                                <span class="text-xs font-bold text-outline mb-3 uppercase">${getDayName(date)}</span>
                                <span class="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform mb-3">${getIcon(daily.weathercode[i])}</span>
                                <div class="text-center">
                                    <span class="text-xl font-bold text-on-surface">${Math.round(daily.temperature_2m_max[i])}°</span>
                                    <span class="text-xs font-bold text-outline ml-1">${Math.round(daily.temperature_2m_min[i])}°</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- Insights -->
                <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-primary p-8 rounded-3xl text-white flex gap-6 items-start shadow-xl">
                        <div class="bg-white/10 p-4 rounded-2xl">
                            <span class="material-symbols-outlined text-3xl">beach_access</span>
                        </div>
                        <div>
                            <h4 class="text-xl font-bold mb-2">Temperatura del Mar</h4>
                            <p class="opacity-80 mb-4 text-sm">El Mediterráneo está a unos 22°C—ideal para un baño en el Cabo de Gata hoy.</p>
                            <span class="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full uppercase tracking-widest">Condiciones Óptimas</span>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-3xl flex gap-6 items-start border border-outline-variant/30 shadow-sm">
                        <div class="bg-primary/5 p-4 rounded-2xl text-primary">
                            <span class="material-symbols-outlined text-3xl">eco</span>
                        </div>
                        <div>
                            <h4 class="text-xl font-bold text-primary mb-2">Nivel de Polen</h4>
                            <p class="text-on-surface-variant mb-4 text-sm">Niveles bajos de polen de olivo detectados en la ciudad. Ideal para pasear.</p>
                            <span class="text-[10px] font-bold bg-background text-outline px-3 py-1 rounded-full uppercase tracking-widest">Nivel Bajo</span>
                        </div>
                    </div>
                </section>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

function getWeatherDesc(code) {
    const descriptions = {
        0: 'Cielo despejado',
        1: 'Mayormente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Escarcha',
        51: 'Llovizna',
        61: 'Lluvia ligera',
        71: 'Nieve ligera',
        80: 'Chubascos',
        95: 'Tormenta'
    };
    return descriptions[code] || 'Despejado';
}

function getDayName(dateStr) {
    const days = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const date = new Date(dateStr);
    return days[date.getDay()];
}

window.renderWeather = renderWeather;
init();
