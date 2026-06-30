// Mock data shaped exactly like what the backend team should send from Firebase.
// Swap this out once dataService.js is pointed at the real database —
// the rest of the app doesn't need to change as long as the shape matches.

function generateMockReadings(days = 7) {
  const readings = [];
  const now = new Date();

  for (let i = days * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    readings.push({
      deviceId: "esp32-01",
      timestamp: timestamp.toISOString(),
      temperature: +(22 + Math.random() * 6).toFixed(1),   // ~22-28°C
      humidity: +(50 + Math.random() * 20).toFixed(0),     // ~50-70%
      soilMoisture: +(30 + Math.random() * 40).toFixed(0)  // ~30-70%
    });
  }
  return readings;
}

const MOCK_READINGS = generateMockReadings(30);
