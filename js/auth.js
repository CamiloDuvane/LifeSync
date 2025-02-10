import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

import { auth } from './firebase-config.js';

const provider = new GoogleAuthProvider();

// Mock auth state for test user
let mockAuthState = null;

export function isAuthenticated() {
  return mockAuthState !== null || auth.currentUser !== null;
}

export function checkAuth() {
  if (!isAuthenticated()) {
    showLoginScreen();
    return false;
  }
  return true;
}

export async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Por favor preencha todos os campos');
    return;
  }

  try {
    // Test user login
    if (email === 'Milo' && password === '1234') {
      mockAuthState = {
        uid: 'test-user-id',
        email: 'Milo',
        displayName: 'Test User',
        photoURL: null
      };
      handleAuthStateChange(mockAuthState);
      return;
    }

    // Regular Firebase auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    handleAuthStateChange(userCredential.user);
  } catch (error) {
    console.error('Login error:', error);
    alert('Erro ao fazer login: ' + error.message);
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    handleAuthStateChange(result.user);
  } catch (error) {
    console.error('Google sign in error:', error);
    alert('Erro ao fazer login com Google: ' + error.message);
  }
}

export async function logout() {
  try {
    if (mockAuthState) {
      mockAuthState = null;
      handleAuthStateChange(null);
    } else {
      await signOut(auth);
    }
  } catch (error) {
    console.error('Logout error:', error);
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
  if (!checkAuth()) return;
  
  hideAllScreens();
  const dashboard = document.getElementById('dashboard');
  dashboard.style.display = 'block';
  dashboard.classList.add('active');
}

function handleAuthStateChange(user) {
  if (user) {
    updateUserInfo(user);
    showDashboard();
  } else {
    hideAllScreens();
    showLoginScreen();
  }
}

function updateUserInfo(user) {
  const userNameElement = document.getElementById('user-name');
  const userPhotoElement = document.getElementById('user-photo');
  
  if (userNameElement) {
    userNameElement.textContent = user.displayName || user.email;
  }
  
  if (userPhotoElement) {
    userPhotoElement.src = user.photoURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNlMGUwZTAiLz48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTRzLTEuNzktNCA0IDQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjOTA5MDkwIi8+PC9zdmc+';
  }
}

// Initialize auth state observer
onAuthStateChanged(auth, (user) => {
  handleAuthStateChange(user || mockAuthState);
});