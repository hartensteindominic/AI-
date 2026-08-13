const form = document.querySelector('#signal-form');
const forecast = document.querySelector('#forecast');
const personaSummary = document.querySelector('#persona-summary');

for (const input of form.querySelectorAll('input[type="range"]')) {
  const output = document.querySelector(`#${input.name}-value`);
  input.addEventListener('input', () => {
    output.textContent = input.value;
  });
}

function formData() {
  return Object.fromEntries(new FormData(form).entries());
}

function renderPrediction(prediction) {
  personaSummary.textContent = prediction.summary;
  forecast.innerHTML = `
    <div class="card forecast-header">
      <p class="eyebrow">Next seven days</p>
      <h2>${prediction.outlook}</h2>
      <p>${prediction.summary}</p>
    </div>
    <div class="day-grid">
      ${prediction.days.map((day) => `
        <article class="day-card">
          <div class="day-topline"><h3>${day.day}</h3><span>${day.confidence}% confidence</span></div>
          <meter min="1" max="10" value="${day.score}"></meter>
          <p class="theme">${day.theme} · ${day.score}/10</p>
          <p><strong>Do:</strong> ${day.action}</p>
          <p><strong>Watch:</strong> ${day.risk}</p>
          <p class="note">${day.note}</p>
        </article>
      `).join('')}
    </div>`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderPrediction(MiniMeForecaster.predictWeek(formData()));
});

renderPrediction(MiniMeForecaster.predictWeek(formData()));
