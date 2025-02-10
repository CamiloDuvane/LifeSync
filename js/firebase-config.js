// Keep imports as ES modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js';

const firebaseConfig = {
  apiKey: "AIzaSyAJzL6sk0pDZtC-jtbpLNNR1dlQ94D9ccA",
  authDomain: "mea2024-d8f25.firebaseapp.com",
  databaseURL: "https://mea2024-d8f25-default-rtdb.firebaseio.com",
  projectId: "mea2024-d8f25",
  storageBucket: "mea2024-d8f25.firebasestorage.app",
  messagingSenderId: "770842232248",
  appId: "1:770842232248:web:f3da86205a5b3e6afbfb4d",
  measurementId: "G-2GMQCP11CF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);