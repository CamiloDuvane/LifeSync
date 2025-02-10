import { auth } from './firebase-config.js';
import { login, signInWithGoogle, logout, showDashboard } from './auth.js';
import { 
  initStudyMode, 
  initWorkMode, 
  initHealthMode, 
  initHomeMode, 
  initFunMode,
  addTask,
  trackWater,
  trackExercise,
  addMedication,
  addShoppingItem,
  sendMessage,
  askAI,
  addFlashcard,
  reviewFlashcards,
  nextFlashcard,
  previousFlashcard,
  addSubject
} from './mode-handlers.js';

// Make functions available globally
window.login = login;
window.signInWithGoogle = signInWithGoogle;
window.logout = logout;
window.showDashboard = showDashboard;
window.initStudyMode = initStudyMode;
window.initWorkMode = initWorkMode;
window.initHealthMode = initHealthMode;
window.initHomeMode = initHomeMode;
window.initFunMode = initFunMode;
window.addTask = addTask;
window.trackWater = trackWater;
window.trackExercise = trackExercise;
window.addMedication = addMedication;
window.addShoppingItem = addShoppingItem;
window.sendMessage = sendMessage;
window.askAI = askAI;
window.addFlashcard = addFlashcard;
window.reviewFlashcards = reviewFlashcards;
window.nextFlashcard = nextFlashcard;
window.previousFlashcard = previousFlashcard;
window.addSubject = addSubject;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Auth state observer will handle initial navigation
  auth.onAuthStateChanged((user) => {
    if (user) {
      showDashboard();
    }
  });
});

// Mode switching function
window.switchMode = (mode) => {
  switch(mode) {
    case 'study':
      initStudyMode();
      break;
    case 'work':
      initWorkMode();
      break;
    case 'health':
      initHealthMode();
      break;
    case 'home':
      initHomeMode();
      break;
    case 'fun':
      initFunMode();
      break;
    default:
      console.error(`Invalid mode: ${mode}`);
  }
};