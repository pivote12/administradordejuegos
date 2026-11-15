const SPAN_DAYS = 22;
const FORECAST_DAYS = 16;
const LAST_HOUR = SPAN_DAYS * 24;

const WEATHER = {
  0: ["Despejado", "☀️", "sun"],
  1: ["Mayormente despejado", "🌤️", "sun"],
  2: ["Parcialmente nublado", "⛅", "sun"],
  3: ["Nublado", "☁️", "cloud"],
  45: ["Niebla", "🌫️", "fog"],
  48: ["Niebla", "🌫️", "fog"],
  51: ["Llovizna", "🌦️", "rain"],
  53: ["Llovizna", "🌦️", "rain"],
  55: ["Llovizna", "🌦️", "rain"],
  56: ["Llovizna", "🌦️", "rain"],
  57: ["Llovizna", "🌦️", "rain"],
  61: ["Lluvia", "🌧️", "rain"],
  63: ["Lluvia", "🌧️", "rain"],
  65: ["Lluvia", "🌧️", "rain"],
  66: ["Lluvia", "🌧️", "rain"],
  67: ["Lluvia", "🌧️", "rain"],
  71: ["Nieve", "❄️", "snow"],
  73: ["Nieve", "❄️", "snow"],
  75: ["Nieve", "❄️", "snow"],
  77: ["Nieve", "❄️", "snow"],
  80: ["Chaparrones", "🌦️", "rain"],
  81: ["Chaparrones", "🌦️", "rain"],
  82: ["Chaparrones", "🌧️", "rain"],
  85: ["Nieve", "❄️", "snow"],
  86: ["Nieve", "❄️", "snow"],
  95: ["Tormenta", "⛈️", "storm"],
  96: ["Tormenta", "⛈️", "storm"],
  99: ["Tormenta", "⛈️", "storm"]
};

let place = null;

function numeric(text) {
  const value = Number(text);
  return Number.isFinite(value) ? value : 0;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

function ymd(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

function hourKey(date) {
  return ymd(date) + "T" + String(date.getHours()).padStart(2, "0") + ":00";
}

function describe(code) {
  const found = WEATHER[code] || ["Clima", "🌡️", "cloud"];
  return { name: found[0], icon: found[1], sky: found[2] };
}

function hourNote(hour) {
  if (hour !== 0 && hour % 24 === 0) return "Día " + (hour / 24) + " · 24:00";
  const day = Math.floor(hour / 24);
  const clock = String(hour % 24).padStart(2, "0") + ":00";
  if (day === 0) return "Mismo día";
  return "Día +" + day + " · " + clock;
}

function nowParts() {
  const now = new Date();
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
    day: String(now.getDate()),
    hour: String(now.getHours()),
    minute: String(now.getMinutes()),
    second: String(now.getSeconds())
  };
}

function momentFrom(parts) {
  const start = new Date(Math.trunc(numeric(parts.year)), Math.trunc(numeric(parts.month)) - 1, Math.trunc(numeric(parts.day)), 0, 0, 0, 0);
  if (Number.isNaN(start.getTime())) return null;
  const stamp = start.getTime() + (numeric(parts.hour) * 3600 + numeric(parts.minute) * 60 + numeric(parts.second)) * 1000;
  const when = new Date(stamp);
  if (Number.isNaN(when.getTime())) return null;
  return { start, when };
}

function locateGps() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: "Tu zona" }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  });
}

async function locateIp() {
  const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
  if (!response.ok) throw new Error("lugar");
  const data = await response.json();
  const lat = Number(data.latitude);
  const lon = Number(data.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("lugar");
  return { lat, lon, name: [data.city, data.country].filter(Boolean).join(", ") || "Tu zona" };
}

async function labelPlace(found) {
  try {
    const response = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + found.lat + "&longitude=" + found.lon + "&localityLanguage=es");
    if (!response.ok) return found;
    const data = await response.json();
    const name = [data.city || data.locality, data.countryName].filter(Boolean).join(", ");
    if (name) found.name = name;
  } catch (_err) {
    /* queda el nombre anterior */
  }
  return found;
}

async function ensurePlace() {
  if (place) return place;
  place = await locateGps();
  if (!place) place = await locateIp();
  return labelPlace(place);
}

function weatherQuery(days) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "auto";
  return new URLSearchParams({
    latitude: place.lat.toFixed(4),
    longitude: place.lon.toFixed(4),
    hourly: "temperature_2m,weather_code",
    timezone: zone,
    forecast_days: String(days)
  });
}

async function fetchHourly(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.hourly && Array.isArray(data.hourly.time) && data.hourly.time.length) return data.hourly;
  } catch (_err) {
    /* prueba la otra fuente */
  }
  return null;
}

function addHours(map, hourly) {
  if (!hourly) return;
  hourly.time.forEach((time, index) => {
    const temp = hourly.temperature_2m[index];
    const code = hourly.weather_code[index];
    if (temp == null || code == null) return;
    map.set(time.slice(0, 13) + ":00", { temp, climate: describe(code) });
  });
}

async function loadMap() {
  const map = new Map();
  const longRange = weatherQuery(SPAN_DAYS + 1);
  longRange.set("models", "gfs_seamless");
  const [extended, near] = await Promise.all([
    fetchHourly("https://ensemble-api.open-meteo.com/v1/ensemble?" + longRange),
    fetchHourly("https://api.open-meteo.com/v1/forecast?" + weatherQuery(FORECAST_DAYS))
  ]);
  addHours(map, extended);
  addHours(map, near);
  return map;
}

function render(parts, caption, map) {
  const clock = momentFrom(parts);
  const bucket = new Date(clock.when);
  bucket.setMinutes(0, 0, 0);
  const exact = map.get(hourKey(bucket));
  const activeHour = Math.trunc(numeric(parts.hour));
  document.body.dataset.sky = exact ? exact.climate.sky : "cloud";
  const reading = exact
    ? '<p class="temp">' + Number(exact.temp).toFixed(1) + " °C</p>" + '<p class="weather">' + exact.climate.name + "</p>"
    : '<p class="weather">No hay temperatura publicada para esa hora.</p>';
  document.getElementById("now").innerHTML =
    '<div class="icon" aria-hidden="true">' + (exact ? exact.climate.icon : "🌡️") + "</div>" +
    "<div><p class=\"when\">" + caption + " · " + escapeHtml(place.name) + "</p>" +
    reading +
    "<p class=\"when\">Año " + escapeHtml(parts.year) + " · mes " + escapeHtml(parts.month) + " · día " + escapeHtml(parts.day) +
    " · hora " + escapeHtml(parts.hour) + " · minuto " + escapeHtml(parts.minute) + " · segundo " + escapeHtml(parts.second) + "</p></div>";

  const root = document.getElementById("hours");
  root.innerHTML = "";
  for (let hour = 0; hour <= LAST_HOUR; hour += 1) {
    const at = new Date(clock.start.getTime() + hour * 3600000);
    const item = map.get(hourKey(at));
    const row = document.createElement("article");
    row.className = "hour" + (hour === activeHour ? " on" : "");
    row.innerHTML =
      '<div><strong>Hora ' + hour + '</strong><div class="hour-note">' + hourNote(hour) + "</div></div>" +
      '<div class="hour-icon" aria-hidden="true">' + (item ? item.climate.icon : "🌡️") + "</div>" +
      "<div>" + (item ? item.climate.name : "Sin dato") + "</div>" +
      '<div class="hour-temp">' + (item ? Number(item.temp).toFixed(1) + " °C" : "—") + "</div>";
    root.appendChild(row);
  }
  const marked = root.querySelector(".hour.on");
  if (marked) marked.scrollIntoView({ block: "nearest" });
}

async function searchWeather(parts, caption) {
  const status = document.getElementById("placeLine");
  status.textContent = "Buscando la temperatura…";
  try {
    await ensurePlace();
    const clock = momentFrom(parts);
    if (!clock) {
      status.textContent = "No se pudo buscar la temperatura.";
      return;
    }
    const map = await loadMap();
    if (!map.size) {
      status.textContent = "No se pudo buscar la temperatura. Revisá la conexión.";
      return;
    }
    render(parts, caption, map);
    status.textContent = "Temperatura de " + place.name + ".";
  } catch (_err) {
    status.textContent = "No se pudo buscar la temperatura. Revisá la conexión.";
  }
}

const opening = nowParts();
document.getElementById("now").innerHTML = "<div><p class=\"when\">Buscando la temperatura…</p></div>";
searchWeather(opening, "Ahora");
