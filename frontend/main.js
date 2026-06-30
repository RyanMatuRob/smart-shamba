function soilStatusLabel(value) {
  if (value < 30) return "Dry — irrigation may be needed";
  if (value <= 60) return "Optimal";
  return "Wet";
}

async function refreshDashboard() {
  const range = document.getElementById('rangeSelect').value;

  // Latest stat cards
  const latest = await DataService.getLatestReading();
  document.getElementById('tempValue').textContent = latest.temperature;
  document.getElementById('humidityValue').textContent = latest.humidity;
  document.getElementById('soilValue').textContent = latest.soilMoisture;
  document.getElementById('soilStatus').textContent = soilStatusLabel(latest.soilMoisture);
  document.getElementById('lastUpdated').textContent =
    "Last updated: " + new Date(latest.timestamp).toLocaleString();

  // Online/offline status
  const online = await DataService.isDeviceOnline();
  document.getElementById('statusDot').className = "dot " + (online ? "online" : "offline");
  document.getElementById('statusText').textContent = online ? "Device Online" : "Device Offline";

  // Trend charts
  const readings = await DataService.getReadingsForRange(range);
  renderCharts(readings);
}

document.getElementById('rangeSelect').addEventListener('change', refreshDashboard);

// Initial load
refreshDashboard();

// Auto-refresh every 60 seconds (mimics live monitoring)
setInterval(refreshDashboard, 60000);