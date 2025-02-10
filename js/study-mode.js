import { auth, db } from './firebase-config.js';
import { hideAllScreens } from './auth.js';
import { 
  collection, 
  addDoc, 
  getDocs,
  query, 
  where,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export function initStudyMode() {
  hideAllScreens();
  document.getElementById('study-mode').classList.add('active');
}

export function initWorkMode() {
  hideAllScreens();
  document.getElementById('work-mode').classList.add('active');
  loadTasks();
}

export function initHealthMode() {
  hideAllScreens();
  document.getElementById('health-mode').classList.add('active');
  updateHealthStats();
}

export function initHomeMode() {
  hideAllScreens();
  document.getElementById('home-mode').classList.add('active');
  updateShoppingList();
}

export function initFunMode() {
  hideAllScreens();
  document.getElementById('fun-mode').classList.add('active');
  loadChatMessages();
}

export function addTask() {
  if (!auth.currentUser) return;

  const title = prompt('Digite o título da tarefa:');
  if (!title) return;

  const description = prompt('Digite a descrição da tarefa:');
  if (!description) return;

  const deadline = prompt('Digite o prazo (DD/MM/YYYY):');
  if (!deadline) return;

  try {
    const tasksCollection = collection(db, 'tasks');
    addDoc(tasksCollection, {
      userId: auth.currentUser.uid,
      title,
      description,
      deadline,
      status: 'pending',
      createdAt: serverTimestamp()
    }).then(() => {
      loadTasks();
    });
  } catch (error) {
    console.error('Error adding task:', error);
    alert('Erro ao adicionar tarefa: ' + error.message);
  }
}

export function trackWater() {
  const currentCount = parseInt(localStorage.getItem('waterCount') || '0');
  localStorage.setItem('waterCount', currentCount + 1);
  updateHealthStats();
}

export function trackExercise() {
  const minutes = prompt('Quantos minutos de exercício?');
  if (!minutes) return;
  
  const currentMinutes = parseInt(localStorage.getItem('exerciseMinutes') || '0');
  localStorage.setItem('exerciseMinutes', currentMinutes + parseInt(minutes));
  updateHealthStats();
}

export function addMedication() {
  const name = prompt('Nome do medicamento:');
  if (!name) return;
  
  const time = prompt('Horário (HH:MM):');
  if (!time) return;
  
  const medications = JSON.parse(localStorage.getItem('medications') || '[]');
  medications.push({ name, time });
  localStorage.setItem('medications', JSON.stringify(medications));
  updateHealthStats();
}

export function addShoppingItem() {
  const item = prompt('Digite o item:');
  if (!item) return;
  
  const quantity = prompt('Quantidade:');
  if (!quantity) return;
  
  const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
  shoppingList.push({ item, quantity });
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  updateShoppingList();
}

export function sendMessage() {
  const input = document.querySelector('#fun-chat .chat-input input');
  const message = input.value.trim();
  
  if (!message || !auth.currentUser) return;

  try {
    const messagesCollection = collection(db, 'chat_messages');
    addDoc(messagesCollection, {
      userId: auth.currentUser.uid,
      content: message,
      timestamp: serverTimestamp(),
      sender: auth.currentUser.uid
    }).then(() => {
      input.value = '';
      loadChatMessages();
    });
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message: ' + error.message);
  }
}

export function askAI() {
  const input = document.getElementById('question-input');
  const message = input.value.trim();
  if (!message) return;

  // Add user message
  const messagesContainer = document.getElementById('chat-messages');
  messagesContainer.innerHTML += `
    <div class="message user">${message}</div>
  `;

  // Clear input
  input.value = '';

  // Simulate AI response
  setTimeout(() => {
    messagesContainer.innerHTML += `
      <div class="message ai">Esta é uma resposta simulada para: "${message}"</div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 1000);
}

export function addFlashcard() {
  const front = prompt('Digite a pergunta do flashcard:');
  if (!front) return;
  
  const back = prompt('Digite a resposta do flashcard:');
  if (!back) return;
  
  const flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
  flashcards.push({ front, back });
  localStorage.setItem('flashcards', JSON.stringify(flashcards));
  showFlashcard(flashcards.length - 1);
}

export function reviewFlashcards() {
  const flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
  if (flashcards.length === 0) {
    alert('Adicione alguns flashcards primeiro!');
    return;
  }
  currentFlashcardIndex = 0;
  showFlashcard(currentFlashcardIndex);
}

export function nextFlashcard() {
  const flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
  if (currentFlashcardIndex < flashcards.length - 1) {
    currentFlashcardIndex++;
    showFlashcard(currentFlashcardIndex);
  }
}

export function previousFlashcard() {
  if (currentFlashcardIndex > 0) {
    currentFlashcardIndex--;
    showFlashcard(currentFlashcardIndex);
  }
}

export function addSubject() {
  const name = prompt('Digite o nome da matéria:');
  if (!name) return;
  
  const subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
  subjects.push({ name, color: getRandomColor() });
  localStorage.setItem('subjects', JSON.stringify(subjects));
  updateSubjects();
}

let currentFlashcardIndex = 0;

function showFlashcard(index) {
  const flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
  if (flashcards.length === 0) return;

  const card = flashcards[index];
  const flashcard = document.getElementById('flashcard');
  flashcard.querySelector('.flashcard-front p').textContent = card.front;
  flashcard.querySelector('.flashcard-back p').textContent = card.back;
}

function updateHealthStats() {
  const waterCount = localStorage.getItem('waterCount') || '0';
  const exerciseMinutes = localStorage.getItem('exerciseMinutes') || '0';
  const medications = JSON.parse(localStorage.getItem('medications') || '[]');

  document.querySelector('.health-card:nth-child(1) .health-stat').textContent = `${waterCount}/8`;
  document.querySelector('.health-card:nth-child(2) .health-stat').textContent = `${exerciseMinutes} min`;
  
  const medicationList = document.getElementById('medication-list');
  if (medicationList) {
    medicationList.innerHTML = medications.map(med => 
      `<div class="medication-item">${med.name} - ${med.time}</div>`
    ).join('');
  }
}

function updateShoppingList() {
  const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
  const listElement = document.getElementById('shopping-list');
  
  if (listElement) {
    listElement.innerHTML = `
      <h3>Lista de Compras</h3>
      ${shoppingList.map(item => `
        <div class="shopping-item">
          <span>${item.item}</span>
          <span>${item.quantity}</span>
        </div>
      `).join('')}
    `;
  }
}

function updateSubjects() {
  const subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
  const container = document.querySelector('.subjects');
  if (!container) return;
  
  container.innerHTML = subjects.map(subject => `
    <div class="subject-slot" 
         draggable="true" 
         style="background-color: ${subject.color}"
         ondragstart="handleDragStart(event)">
      ${subject.name}
    </div>
  `).join('');
}

async function loadTasks() {
  if (!auth.currentUser) return;

  try {
    const tasksCollection = collection(db, 'tasks');
    const userTasks = query(tasksCollection, where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(userTasks);
    
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    tasksList.innerHTML = '';
    snapshot.forEach(doc => {
      const task = doc.data();
      tasksList.innerHTML += `
        <div class="task-item">
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <span class="deadline">Prazo: ${task.deadline}</span>
          <div class="task-status">
            <span class="status-badge ${task.status}">${task.status}</span>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

async function loadChatMessages() {
  if (!auth.currentUser) return;

  try {
    const messagesCollection = collection(db, 'chat_messages');
    const userMessages = query(messagesCollection, where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(userMessages);
    
    const chatArea = document.querySelector('.chat-area');
    if (!chatArea) return;
    
    chatArea.innerHTML = '';
    snapshot.forEach(doc => {
      const message = doc.data();
      chatArea.innerHTML += `
        <div class="message ${message.sender === auth.currentUser.uid ? 'user' : 'other'}">
          ${message.content}
        </div>
      `;
    });
    
    chatArea.scrollTop = chatArea.scrollHeight;
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

function getRandomColor() {
  const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];
  return colors[Math.floor(Math.random() * colors.length)];
}

window.handleDragStart = (event) => {
  event.dataTransfer.setData('text/plain', event.target.textContent);
};

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-timer')?.addEventListener('click', () => {
    const pomodoro = new PomodoroTimer();
    pomodoro.start();
  });
  document.getElementById('reset-timer')?.addEventListener('click', () => {
    const pomodoro = new PomodoroTimer();
    pomodoro.reset();
  });
  document.getElementById('flashcard')?.addEventListener('click', (e) => {
    const flashcards = new Flashcards();
    flashcards.flipCard(e.currentTarget);
  });
  document.getElementById('question-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      askAI();
    }
  });

  // Request notification permission
  Notification.requestPermission();

  // Initialize 
  const flashcards = new Flashcards();
  flashcards.loadCards();

  // Add drag and drop handlers to time slots
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

  // Load saved subjects
  updateSubjects();
});

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

  addCard() {
    const front = prompt('Digite a pergunta do flashcard:');
    if (!front) return;
    
    const back = prompt('Digite a resposta do flashcard:');
    if (!back) return;
    
    this.cards.push({ front, back });
    this.saveCards();
    this.showCard(this.cards.length - 1);
  }

  flipCard(element) {
    element.classList.toggle('flipped');
  }

  reviewFlashcards() {
    if (this.cards.length === 0) {
      alert('Adicione alguns flashcards primeiro!');
      return;
    }
    
    this.currentCard = 0;
    this.showCard(this.currentCard);
  }

  nextCard() {
    if (this.currentCard < this.cards.length - 1) {
      this.currentCard++;
      this.showCard(this.currentCard);
    }
  }

  previousCard() {
    if (this.currentCard > 0) {
      this.currentCard--;
      this.showCard(this.currentCard);
    }
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