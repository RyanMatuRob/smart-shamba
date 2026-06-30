let climateChart, soilChart;

function renderCharts(readings) {
  const labels = readings.map(r =>
    new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit' })
  );
  const temps = readings.map(r => r.temperature);
  const humidity = readings.map(r => r.humidity);
  const soil = readings.map(r => r.soilMoisture);

  const climateCtx = document.getElementById('climateChart');
  const soilCtx = document.getElementById('soilChart');

  if (climateChart) climateChart.destroy();
  if (soilChart) soilChart.destroy();

  climateChart = new Chart(climateCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temps,
          borderColor: '#d9534f',
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: 'Humidity (%)',
          data: humidity,
          borderColor: '#3b82f6',
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { x: { ticks: { maxTicksLimit: 6 } } }
    }
  });

  soilChart = new Chart(soilCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Soil Moisture (%)',
          data: soil,
          borderColor: '#1f6b3a',
          backgroundColor: 'rgba(31,107,58,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { maxTicksLimit: 6 } } }
    }
  });
}
