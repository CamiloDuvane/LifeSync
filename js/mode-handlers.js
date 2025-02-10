// Import necessary dependencies
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

// Mode Navigation Functions
export function showDashboard() {
  hideAllScreens();
  document.getElementById('dashboard').classList.add('active');
}

export function initStudyMode() {
  hideAllScreens();
  document.getElementById('study-mode').style.display = 'block';
  document.getElementById('study-mode').classList.add('active');
  initPomodoro();
}

export function initWorkMode() {
  hideAllScreens();
  document.getElementById('work-mode').style.display = 'block';
  document.getElementById('work-mode').classList.add('active');
  loadTasks();
}

export function initHealthMode() {
  hideAllScreens();
  document.getElementById('health-mode').style.display = 'block';
  document.getElementById('health-mode').classList.add('active');
  updateHealthStats();
}

export function initHomeMode() {
  hideAllScreens();
  document.getElementById('home-mode').style.display = 'block';
  document.getElementById('home-mode').classList.add('active');
  updateShoppingList();
}

export function initFunMode() {
  hideAllScreens();
  document.getElementById('fun-mode').style.display = 'block';
  document.getElementById('fun-mode').classList.add('active');
  loadChatMessages();
}

// Study Mode Functions
export function initPomodoro() {
  const pomodoro = new PomodoroTimer();
  document.getElementById('start-timer')?.addEventListener('click', () => pomodoro.start());
  document.getElementById('reset-timer')?.addEventListener('click', () => pomodoro.reset());
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

export function askAI() {
  const input = document.getElementById('question-input');
  const message = input.value.trim();
  if (!message) return;

  const messagesContainer = document.getElementById('chat-messages');
  messagesContainer.innerHTML += `
    <div class="message user">${message}</div>
  `;

  input.value = '';

  setTimeout(() => {
    messagesContainer.innerHTML += `
      <div class="message ai">Esta é uma resposta simulada para: "${message}"</div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 1000);
}

// Work Mode Functions
export async function addTask() {
  if (!auth.currentUser) return;

  const title = prompt('Digite o título da tarefa:');
  if (!title) return;

  const description = prompt('Digite a descrição da tarefa:');
  if (!description) return;

  const deadline = prompt('Digite o prazo (DD/MM/YYYY):');
  if (!deadline) return;

  try {
    const tasksCollection = collection(db, 'tasks');
    await addDoc(tasksCollection, {
      userId: auth.currentUser.uid,
      title,
      description,
      deadline,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    loadTasks();
  } catch (error) {
    console.error('Error adding task:', error);
    alert('Erro ao adicionar tarefa: ' + error.message);
  }
}

// Health Mode Functions
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

// Home Mode Functions
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

// Fun Mode Functions
export async function sendMessage() {
  const input = document.querySelector('#fun-chat .chat-input input');
  const message = input.value.trim();
  
  if (!message || !auth.currentUser) return;

  try {
    const messagesCollection = collection(db, 'chat_messages');
    await addDoc(messagesCollection, {
      userId: auth.currentUser.uid,
      content: message,
      timestamp: serverTimestamp(),
      sender: auth.currentUser.uid
    });

    input.value = '';
    loadChatMessages();
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message: ' + error.message);
  }
}

// Helper Functions
let currentFlashcardIndex = 0;

function showFlashcard(index) {
  const flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
  if (flashcards.length === 0) return;

  const card = flashcards[index];
  const flashcard = document.getElementById('flashcard');
  if (flashcard) {
    flashcard.querySelector('.flashcard-front p').textContent = card.front;
    flashcard.querySelector('.flashcard-back p').textContent = card.back;
  }
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

function updateHealthStats() {
  const waterCount = localStorage.getItem('waterCount') || '0';
  const exerciseMinutes = localStorage.getItem('exerciseMinutes') || '0';
  const medications = JSON.parse(localStorage.getItem('medications') || '[]');

  const waterStat = document.querySelector('.health-card:nth-child(1) .health-stat');
  const exerciseStat = document.querySelector('.health-card:nth-child(2) .health-stat');
  const medicationList = document.getElementById('medication-list');

  if (waterStat) waterStat.textContent = `${waterCount}/8`;
  if (exerciseStat) exerciseStat.textContent = `${exerciseMinutes} min`;
  
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

class PomodoroTimer {
  constructor() {
    this.timeLeft = 25 * 60;
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
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
      timeDisplay.textContent = display;
    }
  }

  completeSession() {
    this.pause();
    if (!this.isBreak) {
      this.sessionCount++;
      this.isBreak = true;
      this.timeLeft = this.sessionCount % 4 === 0 ? 15 * 60 : 5 * 60;
    } else {
      this.isBreak = false;
      this.timeLeft = 25 * 60;
    }
    this.updateSessionInfo();
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro', {
        body: this.isBreak ? 'Hora da pausa!' : 'Hora de voltar ao trabalho!'
      });
    }
  }

  updateSessionInfo() {
    const sessionCount = document.getElementById('session-count');
    const breakInfo = document.getElementById('break-info');
    
    if (sessionCount) {
      sessionCount.textContent = `Sessão: ${Math.ceil(this.sessionCount/2)}/4`;
    }
    if (breakInfo) {
      breakInfo.textContent = `Próximo: ${this.isBreak ? 'Sessão de Trabalho' : 'Pausa ' + 
        (this.sessionCount % 4 === 0 ? 'Longa' : 'Curta')}`;
    }
  }
}

// Make functions available globally for onclick handlers
window.addTask = addTask;
window.trackWater = trackWater;
window.trackExercise = trackExercise;
window.addMedication = addMedication;
window.addShoppingItem = addShoppingItem;
window.sendMessage = sendMessage;