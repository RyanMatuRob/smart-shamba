/**
 * dataService.js
 * --------------
 * Live Firebase Realtime Database version (modular SDK).
 * Every other file just calls these functions and doesn't care
 * where the data actually comes from.
 *
 * API CONTRACT (agreed with backend team):
 * {
 *   deviceId: string,
 *   timestamp: ISO 8601 string,
 *   temperature: number (°C),
 *   humidity: number (%),
 *   soilMoisture: number (%)
 * }
 *
 * Set USE_MOCK_DATA to true to fall back to mockData.js if Firebase
 * isn't returning data yet (e.g. firmware not pushing readings yet).
 */

import { db } from "./firebaseConfig.js";
import {
  ref,
  query,
  orderByChild,
  limitToLast,
  startAt,
  get
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const USE_MOCK_DATA = false; // flip to true to test the UI without live data

const DataService = {

  // Returns the most recent reading
  async getLatestReading() {
    if (USE_MOCK_DATA) {
      return MOCK_READINGS[MOCK_READINGS.length - 1];
    }

    const readingsRef = query(
      ref(db, "readings"),
      orderByChild("timestamp"),
      limitToLast(1)
    );
    const snapshot = await get(readingsRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.val();
    return Object.values(data)[0];
  },

  // Returns an array of readings for the given range: "today" | "7days" | "30days"
  async getReadingsForRange(range) {
    const days = range === "today" ? 1 : range === "7days" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    if (USE_MOCK_DATA) {
      return MOCK_READINGS.filter(r => new Date(r.timestamp).getTime() >= cutoff);
    }

    const readingsRef = query(
      ref(db, "readings"),
      orderByChild("timestamp"),
      startAt(new Date(cutoff).toISOString())
    );
    const snapshot = await get(readingsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.values(data).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  },

  // Simple device "online" check — true if last reading was within 15 minutes
  async isDeviceOnline() {
    const latest = await this.getLatestReading();
    if (!latest) return false;
    const minutesSinceUpdate = (Date.now() - new Date(latest.timestamp).getTime()) / 60000;
    return minutesSinceUpdate < 15;
  }

};

export default DataService;