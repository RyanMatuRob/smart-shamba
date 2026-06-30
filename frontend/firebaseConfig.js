import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcUWrt4oRhNXx-LMYPz7VHwKifHaDnjPQ",
  authDomain: "smart-shamba-a43e5.firebaseapp.com",
  databaseURL: "https://smart-shamba-a43e5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "smart-shamba-a43e5",
  storageBucket: "smart-shamba-a43e5.firebasestorage.app",
  messagingSenderId: "898449815237",
  appId: "1:898449815237:web:743495beb8de4085c7a2ac"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);