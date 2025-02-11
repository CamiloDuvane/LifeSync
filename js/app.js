import { auth } from './firebase-config.js';
import { login, signInWithGoogle, logout, showDashboard, checkAuth } from './auth.js';
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
  addSubject,
  startCWDQuiz,
  handleQuizAnswer,
  resetQuiz,
  selectSubject,
  viewMaterials,
  viewReport,
  downloadReport
} from './mode-handlers.js';

// Make functions available globally
window.login = login;
window.signInWithGoogle = signInWithGoogle;
window.logout = logout;
window.showDashboard = showDashboard;
window.switchMode = (mode) => {
  if (!checkAuth()) return;
  
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

// Make mode functions available globally
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

// Make quiz functions available globally
window.selectSubject = selectSubject;
window.viewMaterials = viewMaterials;
window.viewReport = viewReport;
window.downloadReport = downloadReport;
window.handleQuizAnswer = handleQuizAnswer;
window.resetQuiz = resetQuiz;
window.startCWDQuiz = startCWDQuiz;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Initially hide all screens except login
  document.querySelectorAll('.screen').forEach(screen => {
    if (screen.id !== 'login-screen') {
      screen.style.display = 'none';
    }
  });
  
  // Set up drag and drop handlers
  window.handleDragStart = (event) => {
    event.dataTransfer.setData('text/plain', event.target.textContent);
  };

  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      const subject = e.dataTransfer.getData('text/plain');
      if (e.target.classList.contains('time-slot')) {
        e.target.textContent = subject;
        e.target.style.backgroundColor = getRandomColor();
      }
    });
  });

  // Add flashcard flip handler
  document.getElementById('flashcard')?.addEventListener('click', (e) => {
    e.currentTarget.classList.toggle('flipped');
  });

  // Request notification permission
  Notification.requestPermission();
});

function getRandomColor() {
  const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];
  return colors[Math.floor(Math.random() * colors.length)];
}