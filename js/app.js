import { app, auth, db } from './firebase-config.js';
import { login, signInWithGoogle, logout } from './auth.js';
import { initStudyMode, showDashboard } from './study-mode.js';

// Make functions available globally
window.login = login;
window.signInWithGoogle = signInWithGoogle;
window.logout = logout;
window.showDashboard = showDashboard;
window.initStudyMode = initStudyMode;

function showLoginScreen() {
  document.getElementById('login-screen').classList.add('active');
  document.getElementById('dashboard').classList.remove('active');
}

function switchMode(mode) {
  switch(mode) {
    case 'study':
      initStudyMode();
      break;
    // Add other modes here
    default:
      console.log(`Switching to ${mode} mode`);
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const user = auth.currentUser;
  if (user) {
    showDashboard();
  } else {
    showLoginScreen();
  }
});

// Make functions available globally
window.showLoginScreen = showLoginScreen;
window.switchMode = switchMode;