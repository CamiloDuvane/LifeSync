import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

import { auth } from './firebase-config.js';

const provider = new GoogleAuthProvider();

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showDashboard();
  } catch (error) {
    alert('Erro ao fazer login: ' + error.message);
  }
}

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    showDashboard();
  } catch (error) {
    alert('Erro ao fazer login com Google: ' + error.message);
  }
}

async function logout() {
  try {
    await signOut(auth);
    showLoginScreen();
  } catch (error) {
    alert('Erro ao fazer logout: ' + error.message);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    showDashboard();
    updateUserInfo(user);
  } else {
    showLoginScreen();
  }
});

function updateUserInfo(user) {
  document.getElementById('user-name').textContent = user.displayName || user.email;
  document.getElementById('user-photo').src = user.photoURL || 'assets/default-avatar.png';
}

export { login, signInWithGoogle, logout };