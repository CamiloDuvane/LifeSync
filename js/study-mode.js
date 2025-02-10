import { auth } from './firebase-config.js';

export function initStudyMode() {
  document.getElementById('study-mode').classList.add('active');
  document.getElementById('dashboard').classList.remove('active');
}

export function showDashboard() {
  document.getElementById('study-mode').classList.remove('active');
  document.getElementById('dashboard').classList.add('active');
}

class PomodoroTimer {
  constructor() {
    this.timeLeft = 25 * 60; // 25 minutes in seconds
    this.isBreak = false;
    this.sessionCount = 1;
    this.isRunning = false;
    this.timer = null;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timer = setInterval(() => this.tick(), 1000);
      document.getElementById('start-timer').textContent = 'Pausar';
    } else {
      this.pause();
    }
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.timer);
    document.getElementById('start-timer').textContent = 'Continuar';
  }

  reset() {
    this.pause();
    this.timeLeft = 25 * 60;
    this.updateDisplay();
    document.getElementById('start-timer').textContent = 'Iniciar';
  }

  tick() {
    this.timeLeft--;
    this.updateDisplay();

    if (this.timeLeft === 0) {
      this.completeSession();
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('time-display').textContent = display;
  }

  completeSession() {
    this.pause();
    if (!this.isBreak) {
      this.sessionCount++;
      this.isBreak = true;
      this.timeLeft = this.sessionCount % 4 === 0 ? 15 * 60 : 5 * 60;
      new Notification('Pomodoro', { body: 'Hora da pausa!' });
    } else {
      this.isBreak = false;
      this.timeLeft = 25 * 60;
      new Notification('Pomodoro', { body: 'Hora de voltar ao trabalho!' });
    }
    this.updateSessionInfo();
  }

  updateSessionInfo() {
    document.getElementById('session-count').textContent = `Sessão: ${Math.ceil(this.sessionCount/2)}/4`;
    document.getElementById('break-info').textContent = 
      `Próximo: ${this.isBreak ? 'Sessão de Trabalho' : 'Pausa ' + (this.sessionCount % 4 === 0 ? 'Longa' : 'Curta')}`;
  }
}

class Flashcards {
  constructor() {
    this.cards = [];
    this.currentCard = 0;
  }

  addCard(front, back) {
    this.cards.push({ front, back });
    this.saveCards();
  }

  flipCard(element) {
    element.classList.toggle('flipped');
  }

  reviewMode() {
    if (this.cards.length === 0) return;
    
    this.currentCard = 0;
    this.showCard(this.currentCard);
  }

  showCard(index) {
    const card = this.cards[index];
    const flashcard = document.getElementById('flashcard');
    flashcard.querySelector('.flashcard-front p').textContent = card.front;
    flashcard.querySelector('.flashcard-back p').textContent = card.back;
  }

  saveCards() {
    localStorage.setItem('flashcards', JSON.stringify(this.cards));
  }

  loadCards() {
    const saved = localStorage.getItem('flashcards');
    if (saved) {
      this.cards = JSON.parse(saved);
    }
  }
}

class StudyPlanner {
  constructor() {
    this.subjects = [];
    this.schedule = {};
  }

  addSubject(name, color) {
    this.subjects.push({ name, color });
    this.renderSubjects();
  }

  dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
  }

  drop(e) {
    e.preventDefault();
    const subject = e.dataTransfer.getData('text/plain');
    const timeSlot = e.target.dataset.time;
    this.schedule[timeSlot] = subject;
    this.renderSchedule();
  }

  renderSubjects() {
    const container = document.querySelector('.subjects');
    container.innerHTML = this.subjects.map(subject => `
      <div class="subject-slot" 
           draggable="true" 
           style="background-color: ${subject.color}"
           ondragstart="planner.dragStart(event)">
        ${subject.name}
      </div>
    `).join('');
  }
}

// Initialize features
const pomodoro = new PomodoroTimer();
const flashcards = new Flashcards();
const planner = new StudyPlanner();

// Export classes and instances
export { PomodoroTimer, Flashcards, StudyPlanner, pomodoro, flashcards, planner };

// Add event listeners through a function that can be imported and called
export function initializeStudyMode() {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-timer')?.addEventListener('click', () => pomodoro.start());
    document.getElementById('reset-timer')?.addEventListener('click', () => pomodoro.reset());
    document.getElementById('flashcard')?.addEventListener('click', (e) => flashcards.flipCard(e.currentTarget));

    // Request notification permission
    Notification.requestPermission();

    // Initialize 
    flashcards.loadCards();
  });
}

// Initialize when this module loads
initializeStudyMode();