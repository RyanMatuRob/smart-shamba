/**
 * dataService.js
 * --------------
 * This is the ONLY file that should change once the backend team's
 * Firebase (or other) database is ready. Every other file just calls
 * these functions and doesn't care where the data actually comes from.
 *
 * API CONTRACT (agree this with backend team):
 * {
 *   deviceId: string,
 *   timestamp: ISO 8601 string,
 *   temperature: number (°C),
 *   humidity: number (%),
 *   soilMoisture: number (%)
 * }
 */

const DataService = {

  // Returns the most recent reading
  async getLatestReading() {
    // --- MOCK VERSION (current) ---
    const readings = MOCK_READINGS;
    return readings[readings.length - 1];

    // --- FIREBASE VERSION (uncomment + adapt when backend is ready) ---
    // const snapshot = await firebase.database()
    //   .ref('readings')
    //   .orderByChild('timestamp')
    //   .limitToLast(1)
    //   .once('value');
    // const data = snapshot.val();
    // return Object.values(data)[0];
  },

  // Returns an array of readings for the given range: "today" | "7days" | "30days"
  async getReadingsForRange(range) {
    const days = range === "today" ? 1 : range === "7days" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // --- MOCK VERSION (current) ---
    return MOCK_READINGS.filter(r => new Date(r.timestamp).getTime() >= cutoff);

    // --- FIREBASE VERSION (uncomment + adapt when backend is ready) ---
    // const snapshot = await firebase.database()
    //   .ref('readings')
    //   .orderByChild('timestamp')
    //   .startAt(new Date(cutoff).toISOString())
    //   .once('value');
    // const data = snapshot.val() || {};
    // return Object.values(data);
  },

  // Simple device "online" check — true if last reading was within 15 minutes
  async isDeviceOnline() {
    const latest = await this.getLatestReading();
    if (!latest) return false;
    const minutesSinceUpdate = (Date.now() - new Date(latest.timestamp).getTime()) / 60000;
    return minutesSinceUpdate < 15;
  }

};
