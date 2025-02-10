import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

import { auth } from './firebase-config.js';

const provider = new GoogleAuthProvider();

export async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Login successful, auth state change will handle navigation
  } catch (error) {
    alert('Erro ao fazer login: ' + error.message);
  }
}

export async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, provider);
    // Login successful, auth state change will handle navigation
  } catch (error) {
    alert('Erro ao fazer login com Google: ' + error.message);
  }
}

export async function logout() {
  try {
    await signOut(auth);
    // Logout successful, auth state change will handle navigation
  } catch (error) {
    alert('Erro ao fazer logout: ' + error.message);
  }
}

export function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.style.display = 'none';
    screen.classList.remove('active');
  });
}

export function showLoginScreen() {
  hideAllScreens();
  const loginScreen = document.getElementById('login-screen');
  loginScreen.style.display = 'flex';
  loginScreen.classList.add('active');
}

export function showDashboard() {
  hideAllScreens();
  const dashboard = document.getElementById('dashboard');
  dashboard.style.display = 'block';
  dashboard.classList.add('active');
}

// Handle auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    hideAllScreens();
    showDashboard();
    updateUserInfo(user);
  } else {
    hideAllScreens();
    showLoginScreen();
  }
});

function updateUserInfo(user) {
  const userNameElement = document.getElementById('user-name');
  const userPhotoElement = document.getElementById('user-photo');
  
  if (userNameElement) {
    userNameElement.textContent = user.displayName || user.email;
  }
  
  if (userPhotoElement) {
    userPhotoElement.src = user.photoURL || 'assets/default-avatar.png';
  }
}