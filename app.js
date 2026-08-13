const STORAGE_KEY = 'mini-me-checkins-v2';
const form = document.querySelector('#signal-form');
const forecast = document.querySelector('#forecast');
const insights = document.querySelector('#insights');
const personaSummary = document.querySelector('#persona-summary');
const memoryCount = document.querySelector('#memory-count');
const saveButton = document.querySelector('#save-checkin');
const clearButton = document.querySelector('#clear-memory');

function readStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function loadHistory() {
  const storage = readStorage();
  if (!storage) return [];
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function saveHistory(history) {
  const storage = readStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30)));
}

function updateMemoryCount() {
  const count = loadHistory().length;
  memoryCount.textContent = `${count} saved check-in${count === 1 ? '' : 's'}`;
}

for (const input of form.querySelectorAll('input[type="range"]')) {
  const output = document.querySelector(`#${input.name}-value`);
  input.addEventListener('input', () => {
    output.textContent = input.value;
  });
}

function formData() {
  return {
    ...Object.fromEntries(new FormData(form).entries()),
    startDate: new Date(),
    history: loadHistory(),
  };
}

function renderPrediction(prediction) {
  personaSummary.textContent = prediction.summary;
  insights.innerHTML = `
    <div class="card forecast-header">
      <p class="eyebrow">Agent consensus</p>
      <h2>${prediction.outlook} · ${prediction.averageScore}/10 average</h2>
      <div class="insight-grid">
        ${prediction.insights.map((item) => `<p>${item}</p>`).join('')}
      </div>
    </div>`;
  forecast.innerHTML = `
    <div class="day-grid">
      ${prediction.days.map((day) => `
        <article class="day-card ${day.score >= 7 ? 'strong' : day.score < 4.5 ? 'soft' : ''}">
          <div class="day-topline"><h3>${day.relative}</h3><span>${day.confidence}% confidence</span></div>
          <p class="date-label">${day.label}</p>
          <meter min="1" max="10" value="${day.score}"></meter>
          <p class="theme">${day.theme} · ${day.score}/10</p>
          <p><strong>Do:</strong> ${day.action}</p>
          <p><strong>Watch:</strong> ${day.risk}</p>
          <details>
            <summary>Why mini-you thinks this</summary>
            <p>${day.why}</p>
            <p class="agents">${day.agents.join(' · ')}</p>
          </details>
          <p class="note">${day.note}</p>
        </article>
      `).join('')}
    </div>`;
}

function refresh() {
  updateMemoryCount();
  renderPrediction(MiniMeForecaster.predictWeek(formData()));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  refresh();
});

saveButton.addEventListener('click', () => {
  const checkin = { ...Object.fromEntries(new FormData(form).entries()), date: new Date().toISOString() };
  saveHistory(loadHistory().concat(checkin));
  refresh();
});

clearButton.addEventListener('click', () => {
  const storage = readStorage();
  if (storage) storage.removeItem(STORAGE_KEY);
  refresh();
});

refresh();
