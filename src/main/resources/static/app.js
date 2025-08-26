
'use strict';

const API_BASE = 'http://localhost:9090/weather/response';

const $ = (sel) => document.querySelector(sel);

const elements = {
  form: $('#searchForm'),
  cityInput: $('#cityInput'),
  daysSelect: $('#daysSelect'),
  currentIcon: $('#currentIcon'),
  currentTemp: $('#currentTemp'),
  currentCity: $('#currentCity'),
  currentMeta: $('#currentMeta'),
  currentCondition: $('#currentCondition'),
  forecastList: $('#forecastList'),
  status: $('#status'),
  preloader: $('#preloader'),
};

let inflightRequests = 0;
function showPreloader() {
  inflightRequests += 1;
  if (elements.preloader) elements.preloader.classList.remove('is-hidden');
}
function hidePreloader() {
  inflightRequests = Math.max(0, inflightRequests - 1);
  if (elements.preloader && inflightRequests === 0) elements.preloader.classList.add('is-hidden');
}

function setStatus(message, type = 'info') {
  const emoji = type === 'error' ? '⚠️' : type === 'loading' ? '⏳' : 'ℹ️';
  elements.status.textContent = message ? `${emoji} ${message}` : '';
}

function getIconId(conditionRaw = '') {
  const condition = conditionRaw.toLowerCase();
  if (/(thunder|storm|lightning)/.test(condition)) return '#i-thunder';
  if (/(snow|sleet|blizzard)/.test(condition)) return '#i-snow';
  if (/(rain|drizzle|shower)/.test(condition)) return '#i-rain';
  if (/(mist|fog|haze|smog)/.test(condition)) return '#i-mist';
  if (/(cloud)/.test(condition)) return '#i-partly';
  if (/(sun|clear|bright)/.test(condition)) return '#i-sun';
  return '#i-partly';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

async function fetchWeather(city, days) {
  const url = new URL(API_BASE);
  if (city != null) url.searchParams.set('city', city.trim());
  url.searchParams.set('days', String(days));

  setStatus('Fetching latest forecast…', 'loading');
  showPreloader();
  try {
    const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = await res.json();
    renderWeather(data);
    setStatus('');
  } catch (err) {
    console.error(err);
    setStatus('Unable to fetch weather. Ensure the API is running on localhost:9090 and allows CORS.', 'error');
  } finally {
    hidePreloader();
  }
}

function renderWeather(payload) {
  if (!payload || !payload.weatherResponse) return;

  const w = payload.weatherResponse;
  const cityLabel = [w.city, w.region, w.country].filter(Boolean).join(', ');
  const tempVal = w.temperature != null ? Number(w.temperature).toFixed(1) : '--';

  elements.currentCity.textContent = cityLabel || '—';
  elements.currentMeta.textContent = cityLabel ? `Region: ${w.region || '—'} • Country: ${w.country || '—'}` : '—';
  elements.currentCondition.textContent = w.condition || '—';
  elements.currentTemp.textContent = tempVal;
  elements.currentIcon.setAttribute('href', getIconId(w.condition));

  // Forecast
  elements.forecastList.innerHTML = '';
  const days = Array.isArray(payload.dayTemp) ? payload.dayTemp : [];
  if (days.length === 0) {
    elements.forecastList.innerHTML = '<div class="card" style="padding:16px; text-align:center; color: var(--muted);">No forecast data.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const d of days) {
    const card = document.createElement('div');
    card.className = 'f-card';

    const header = document.createElement('div');
    header.className = 'f-header';

    const icon = document.createElement('div');
    icon.className = 'f-icon';
    icon.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><use href="${getIconId(w.condition)}"/></svg>`;

    const date = document.createElement('div');
    date.className = 'f-date';
    date.textContent = formatDate(d.date);

    header.appendChild(icon);
    header.appendChild(date);

    const main = document.createElement('div');
    main.className = 'f-main';
    const avgValNum = d.avgTemp != null ? Number(d.avgTemp) : NaN;
    const avgVal = Number.isFinite(avgValNum) ? avgValNum.toFixed(1) : '—';
    main.innerHTML = `<div class="f-avg" aria-label="Average temperature">${avgVal}<span class="unit">°C</span></div>`;

    const minNum = d.minTemp != null ? Number(d.minTemp) : NaN;
    const maxNum = d.maxTemp != null ? Number(d.maxTemp) : NaN;
    const denom = Number.isFinite(minNum) && Number.isFinite(maxNum) ? (maxNum - minNum) : NaN;
    let pct = Number.isFinite(denom) && denom > 0 && Number.isFinite(avgValNum)
      ? (avgValNum - minNum) / denom
      : 0.5;
    pct = Math.max(0, Math.min(1, pct));

    const bar = document.createElement('div');
    bar.className = 'f-bar';
    bar.innerHTML = `
      <div class="f-bar-track"></div>
      <div class="f-bar-dot" style="left:${(pct * 100).toFixed(1)}%" title="avg ${avgVal}°" aria-label="Average ${avgVal}°"></div>
    `;

    const legend = document.createElement('div');
    legend.className = 'f-legend';
    const minLabel = Number.isFinite(minNum) ? minNum.toFixed(1) : '—';
    const maxLabel = Number.isFinite(maxNum) ? maxNum.toFixed(1) : '—';
    legend.innerHTML = `
      <div class="f-legend-item">min ${minLabel}°</div>
      <div class="f-legend-item" style="text-align:right">max ${maxLabel}°</div>
    `;

    card.appendChild(header);
    card.appendChild(main);
    card.appendChild(bar);
    card.appendChild(legend);

    fragment.appendChild(card);
  }
  elements.forecastList.appendChild(fragment);
}

function initFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city') || 'Amravati';
  const days = Number(params.get('days') || '1');
  elements.cityInput.value = city;
  elements.daysSelect.value = String([1,3,5,7].includes(days) ? days : 1);
  return { city, days: [1,3,5,7].includes(days) ? days : 1 };
}

function wireEvents() {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = elements.cityInput.value || '';
    const days = Number(elements.daysSelect.value);
    const url = new URL(window.location.href);
    url.searchParams.set('city', city);
    url.searchParams.set('days', String(days));
    history.replaceState({}, '', url);
    fetchWeather(city, days);
  });
}

(function main() {
  wireEvents();
  const { city, days } = initFromQuery();
  fetchWeather(city, days);
})(); 

/*
'use strict';

const API_BASE = 'http://localhost:9090/weather/response'; // Changed from /forecast to /response

const $ = (sel) => document.querySelector(sel);

const elements = {
  form: $('#searchForm'),
  cityInput: $('#cityInput'),
  daysSelect: $('#daysSelect'),
  currentIcon: $('#currentIcon'),
  currentTemp: $('#currentTemp'),
  currentCity: $('#currentCity'),
  currentMeta: $('#currentMeta'),
  currentCondition: $('#currentCondition'),
  forecastList: $('#forecastList'),
  status: $('#status'),
  preloader: $('#preloader'),
};

let inflightRequests = 0;
function showPreloader() {
  inflightRequests += 1;
  if (elements.preloader) elements.preloader.classList.remove('is-hidden');
}
function hidePreloader() {
  inflightRequests = Math.max(0, inflightRequests - 1);
  if (elements.preloader && inflightRequests === 0) elements.preloader.classList.add('is-hidden');
}

function setStatus(message, type = 'info') {
  const emoji = type === 'error' ? '⚠️' : type === 'loading' ? '⏳' : 'ℹ️';
  elements.status.textContent = message ? `${emoji} ${message}` : '';
}

function getIconId(conditionRaw = '') {
  const condition = conditionRaw.toLowerCase();
  if (/(thunder|storm|lightning)/.test(condition)) return '#i-thunder';
  if (/(snow|sleet|blizzard)/.test(condition)) return '#i-snow';
  if (/(rain|drizzle|shower)/.test(condition)) return '#i-rain';
  if (/(mist|fog|haze|smog)/.test(condition)) return '#i-mist';
  if (/(cloud)/.test(condition)) return '#i-partly';
  if (/(sun|clear|bright)/.test(condition)) return '#i-sun';
  return '#i-partly';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

async function fetchWeather(city, days) {
  const url = new URL(API_BASE);
  if (city != null) url.searchParams.set('city', city.trim());
  url.searchParams.set('days', String(days));

  setStatus('Fetching latest forecast…', 'loading');
  showPreloader();
  try {
    const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      renderWeather(data);
      setStatus('');
    } else {
      // Handle non-JSON response (like plain text)
      const text = await res.text();
      console.log('Non-JSON response:', text);
      setStatus(`Server returned: ${text}. Expected JSON response.`, 'error');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
      setStatus('Server returned invalid JSON. Check backend response format.', 'error');
    } else {
      setStatus('Unable to fetch weather. Ensure the API is running on localhost:9090 and allows CORS.', 'error');
    }
  } finally {
    hidePreloader();
  }
}

function renderWeather(payload) {
  if (!payload || !payload.weatherResponse) return;

  const w = payload.weatherResponse;
  const cityLabel = [w.city, w.region, w.country].filter(Boolean).join(', ');
  const tempVal = w.temperature != null ? Number(w.temperature).toFixed(1) : '--';

  elements.currentCity.textContent = cityLabel || '—';
  elements.currentMeta.textContent = cityLabel ? `Region: ${w.region || '—'} • Country: ${w.country || '—'}` : '—';
  elements.currentCondition.textContent = w.condition || '—';
  elements.currentTemp.textContent = tempVal;
  elements.currentIcon.setAttribute('href', getIconId(w.condition));

  // Forecast
  elements.forecastList.innerHTML = '';
  const days = Array.isArray(payload.dayTemp) ? payload.dayTemp : [];
  if (days.length === 0) {
    elements.forecastList.innerHTML = '<div class="card" style="padding:16px; text-align:center; color: var(--muted);">No forecast data.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const d of days) {
    const card = document.createElement('div');
    card.className = 'f-card';

    const header = document.createElement('div');
    header.className = 'f-header';

    const icon = document.createElement('div');
    icon.className = 'f-icon';
    icon.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><use href="${getIconId(w.condition)}"/></svg>`;

    const date = document.createElement('div');
    date.className = 'f-date';
    date.textContent = formatDate(d.date);

    header.appendChild(icon);
    header.appendChild(date);

    const main = document.createElement('div');
    main.className = 'f-main';
    const avgValNum = d.avgTemp != null ? Number(d.avgTemp) : NaN;
    const avgVal = Number.isFinite(avgValNum) ? avgValNum.toFixed(1) : '—';
    main.innerHTML = `<div class="f-avg" aria-label="Average temperature">${avgVal}<span class="unit">°C</span></div>`;

    const minNum = d.minTemp != null ? Number(d.minTemp) : NaN;
    const maxNum = d.maxTemp != null ? Number(d.maxTemp) : NaN;
    const denom = Number.isFinite(minNum) && Number.isFinite(maxNum) ? (maxNum - minNum) : NaN;
    let pct = Number.isFinite(denom) && denom > 0 && Number.isFinite(avgValNum)
      ? (avgValNum - minNum) / denom
      : 0.5;
    pct = Math.max(0, Math.min(1, pct));

    const bar = document.createElement('div');
    bar.className = 'f-bar';
    bar.innerHTML = `
      <div class="f-bar-track"></div>
      <div class="f-bar-dot" style="left:${(pct * 100).toFixed(1)}%" title="avg ${avgVal}°" aria-label="Average ${avgVal}°"></div>
    `;

    const legend = document.createElement('div');
    legend.className = 'f-legend';
    const minLabel = Number.isFinite(minNum) ? minNum.toFixed(1) : '—';
    const maxLabel = Number.isFinite(maxNum) ? maxNum.toFixed(1) : '—';
    legend.innerHTML = `
      <div class="f-legend-item">min ${minLabel}°</div>
      <div class="f-legend-item" style="text-align:right">max ${maxLabel}°</div>
    `;

    card.appendChild(header);
    card.appendChild(main);
    card.appendChild(bar);
    card.appendChild(legend);

    fragment.appendChild(card);
  }
  elements.forecastList.appendChild(fragment);
}

function initFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city') || 'Amravati';
  const days = Number(params.get('days') || '1');
  elements.cityInput.value = city;
  elements.daysSelect.value = String([1,3,5,7].includes(days) ? days : 1);
  return { city, days: [1,3,5,7].includes(days) ? days : 1 };
}

function wireEvents() {
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = elements.cityInput.value || '';
    const days = Number(elements.daysSelect.value);
    const url = new URL(window.location.href);
    url.searchParams.set('city', city);
    url.searchParams.set('days', String(days));
    history.replaceState({}, '', url);
    fetchWeather(city, days);
  });
}

(function main() {
  wireEvents();
  const { city, days } = initFromQuery();
  fetchWeather(city, days);
})();*/