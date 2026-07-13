// Dictionnaire de décodage pour le paramètre 'weathercode' de l'API Open-Meteo
const weatherCodesMapping = {
0: "Ensoleillé",
1: "Principalement dégagé",
2: "Partiellement nuageux",
3: "Nuageux",
45: "Brouillard",
48: "Brouillard givrant",
51: "Bruine légère",
53: "Bruine modérée",
55: "Bruine dense",
61: "Pluie légère",
63: "Pluie modérée",
65: "Pluie forte",
71: "Chute de neige légère",
73: "Chute de neige modérée",
75: "Chute de neige forte",
77: "Grains de neige",
80: "Averses de pluie légères",
81: "Averses de pluie modérées",
82: "Averses de pluie violentes",
85: "Averses de neige légères",
86: "Averses de neige fortes",
95: "Orage faible ou modéré",
96: "Orage avec grêle légère",
99: "Orage avec grêle forte"
};

// Sélection des éléments du DOM
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const cityError = document.getElementById('city-error');
const apiError = document.getElementById('api-error');
const loader = document.getElementById('loader');
const weatherCard = document.getElementById('weather-card');

const weatherLocation = document.getElementById('weather-location');
const weatherStatusText = document.getElementById('weather-status-text');
const weatherTemp = document.getElementById('weather-temp');
const weatherWind = document.getElementById('weather-wind');

// --- AJOUT CONSIGNE 2 (a11y) : Réinitialisation automatique de l'état d'erreur ---
cityInput.addEventListener('input', function() {
if (cityInput.value.trim() !== "") {
cityInput.setAttribute('aria-invalid', 'false');
cityError.textContent = "";
}
});

// Intercepter l'événement submit
weatherForm.addEventListener('submit', async function(event) {
event.preventDefault(); // Empêcher le rechargement automatique de la page

const cityName = cityInput.value.trim(); // Nettoyer l'entrée textuelle avec .trim()

// Masquer les résultats précédents et les erreurs API d'une ancienne recherche
weatherCard.classList.add('hidden');
apiError.classList.add('hidden');

// Validation Numérique / Accessibilité (a11y) si le champ est vide
if (cityName === "") {
cityInput.setAttribute('aria-invalid', 'true');
cityError.textContent = "Veuillez saisir le nom d'une ville.";
return;
}

// Lancer la recherche asynchrone si le champ est valide
await fetchWeather(cityName);
});

// --- Architecture asynchrone async/await structurée dans un bloc try...catch ---
async function fetchWeather(city) {
// Afficher l'indicateur visuel de chargement
loader.classList.remove('hidden');

try {
// ÉTAPE 1 : Géocodage
const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
const geoResponse = await fetch(geocodingUrl);

// Gestion des erreurs d'API (ex: erreur HTTP) ou si le tableau de résultats est vide
if (!geoResponse.ok) {
throw new Error("Aucun résultat trouvé pour cette recherche. Veuillez vérifier l'orthographe.");
}

const geoData = await geoResponse.json();

// Vérification explicite demandée si le tableau est vide
if (!geoData.results || geoData.results.length === 0) {
throw new Error("Aucun résultat trouvé pour cette recherche. Veuillez vérifier l'orthographe.");
}

const location = geoData.results[0];
const { latitude, longitude, name, country } = location;

// ÉTAPE 2 : Prévisions Météo
const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
const weatherResponse = await fetch(weatherUrl);

if (!weatherResponse.ok) {
throw new Error("Aucun résultat trouvé pour cette recherche. Veuillez vérifier l'orthographe.");
}

const weatherData = await weatherResponse.json();
const current = weatherData.current_weather;

// ÉTAPE 3 : Extraction et Décodage
const fullLocationName = `${name}, ${country}`;
const temperature = `${current.temperature}°C`;
const windSpeed = `${current.windspeed} km/h`;
const statusText = weatherCodesMapping[current.weathercode] || "Conditions inconnues";

// ÉTAPE 4 : Injection finale des données dans le DOM
weatherLocation.textContent = fullLocationName;
weatherStatusText.textContent = statusText;
weatherTemp.textContent = temperature;
weatherWind.textContent = windSpeed;

// Rendre la carte météo visible
weatherCard.classList.remove('hidden');

} catch (error) {
// Capture et affichage propre du message d'erreur explicite dans l'interface
apiError.textContent = error.message;
apiError.classList.remove('hidden');
} finally {
// L'indicateur de chargement disparaît au moment de l'injection ou de l'erreur
loader.classList.add('hidden');
/* Validation et structure responsive correcte*/
}
}
