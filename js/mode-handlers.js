import { auth, db } from './firebase-config.js';
import { hideAllScreens, checkAuth } from './auth.js';
import { 
  collection, 
  addDoc, 
  getDocs,
  query, 
  where,
  serverTimestamp,
  orderBy,
  limit 
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Mode Initialization Functions
export function initStudyMode() {
  if (!checkAuth()) return;
  hideAllScreens();
  document.getElementById('study-mode').style.display = 'block';
  document.getElementById('study-mode').classList.add('active');
  loadStudyData();
}

export function initWorkMode() {
  if (!checkAuth()) return;
  hideAllScreens();
  document.getElementById('work-mode').style.display = 'block';
  document.getElementById('work-mode').classList.add('active');
  loadTasks();
}

export function initHealthMode() {
  if (!checkAuth()) return;
  hideAllScreens();
  document.getElementById('health-mode').style.display = 'block';
  document.getElementById('health-mode').classList.add('active');
  loadHealthData();
}

export function initHomeMode() {
  if (!checkAuth()) return;
  hideAllScreens();
  document.getElementById('home-mode').style.display = 'block';
  document.getElementById('home-mode').classList.add('active');
  loadHomeData();
}

export function initFunMode() {
  if (!checkAuth()) return;
  hideAllScreens();
  document.getElementById('fun-mode').style.display = 'block';
  document.getElementById('fun-mode').classList.add('active');
  loadChatMessages();
}

// Task Functions
export async function addTask() {
  if (!checkAuth()) return;

  const title = prompt('Digite o título da tarefa:');
  if (!title) return;

  const description = prompt('Digite a descrição da tarefa:');
  if (!description) return;

  const deadline = prompt('Digite o prazo (DD/MM/YYYY):');
  if (!deadline) return;

  try {
    await addDoc(collection(db, 'tasks'), {
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

// Health Functions
export async function trackWater() {
  if (!checkAuth()) return;
  
  try {
    const date = new Date().toISOString().split('T')[0];
    const waterRef = collection(db, 'water_tracking');
    const q = query(
      waterRef, 
      where('userId', '==', auth.currentUser.uid),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(waterRef, {
        userId: auth.currentUser.uid,
        date,
        cups: 1,
        updatedAt: serverTimestamp()
      });
    } else {
      const doc = snapshot.docs[0];
      await doc.ref.update({
        cups: doc.data().cups + 1,
        updatedAt: serverTimestamp()
      });
    }
    
    loadHealthData();
  } catch (error) {
    console.error('Error tracking water:', error);
  }
}

export async function trackExercise() {
  if (!checkAuth()) return;
  
  const minutes = prompt('Quantos minutos de exercício?');
  if (!minutes || isNaN(minutes)) return;
  
  try {
    await addDoc(collection(db, 'exercise_tracking'), {
      userId: auth.currentUser.uid,
      minutes: parseInt(minutes),
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });
    loadHealthData();
  } catch (error) {
    console.error('Error tracking exercise:', error);
  }
}

export async function addMedication() {
  if (!checkAuth()) return;
  
  const name = prompt('Nome do medicamento:');
  if (!name) return;
  
  const time = prompt('Horário (HH:MM):');
  if (!time) return;
  
  try {
    await addDoc(collection(db, 'medications'), {
      userId: auth.currentUser.uid,
      name,
      time,
      createdAt: serverTimestamp()
    });
    loadHealthData();
  } catch (error) {
    console.error('Error adding medication:', error);
  }
}

// Home Functions
export async function addShoppingItem() {
  if (!checkAuth()) return;
  
  const item = prompt('Digite o item:');
  if (!item) return;
  
  const quantity = prompt('Quantidade:');
  if (!quantity) return;
  
  try {
    await addDoc(collection(db, 'shopping_items'), {
      userId: auth.currentUser.uid,
      item,
      quantity,
      createdAt: serverTimestamp()
    });
    loadHomeData();
  } catch (error) {
    console.error('Error adding shopping item:', error);
  }
}

// Chat Functions
export async function sendMessage() {
  if (!checkAuth()) return;
  
  const input = document.querySelector('#fun-chat .chat-input input');
  const message = input.value.trim();
  if (!message) return;

  try {
    await addDoc(collection(db, 'chat_messages'), {
      userId: auth.currentUser.uid,
      content: message,
      timestamp: serverTimestamp(),
      sender: auth.currentUser.uid
    });
    input.value = '';
    loadChatMessages();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Study Tools Functions
export async function addFlashcard() {
  if (!checkAuth()) return;
  
  const front = prompt('Digite a pergunta do flashcard:');
  if (!front) return;
  
  const back = prompt('Digite a resposta do flashcard:');
  if (!back) return;

  try {
    await addDoc(collection(db, 'flashcards'), {
      userId: auth.currentUser.uid,
      front,
      back,
      createdAt: serverTimestamp()
    });
    loadStudyData();
  } catch (error) {
    console.error('Error adding flashcard:', error);
  }
}

export async function reviewFlashcards() {
  if (!checkAuth()) return;
  
  try {
    const q = query(
      collection(db, 'flashcards'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt')
    );
    const snapshot = await getDocs(q);
    window.flashcards = [];
    snapshot.forEach(doc => {
      window.flashcards.push(doc.data());
    });
    
    if (window.flashcards.length === 0) {
      alert('Adicione alguns flashcards primeiro!');
      return;
    }
    
    window.currentFlashcardIndex = 0;
    showCurrentFlashcard();
  } catch (error) {
    console.error('Error reviewing flashcards:', error);
  }
}

export function nextFlashcard() {
  if (!window.flashcards || !checkAuth()) return;
  
  if (window.currentFlashcardIndex < window.flashcards.length - 1) {
    window.currentFlashcardIndex++;
    showCurrentFlashcard();
  }
}

export function previousFlashcard() {
  if (!window.flashcards || !checkAuth()) return;
  
  if (window.currentFlashcardIndex > 0) {
    window.currentFlashcardIndex--;
    showCurrentFlashcard();
  }
}

export async function addSubject() {
  if (!checkAuth()) return;
  
  const name = prompt('Digite o nome da matéria:');
  if (!name) return;
  
  try {
    await addDoc(collection(db, 'subjects'), {
      userId: auth.currentUser.uid,
      name,
      color: getRandomColor(),
      createdAt: serverTimestamp()
    });
    loadStudyData();
  } catch (error) {
    console.error('Error adding subject:', error);
  }
}

export function askAI() {
  if (!checkAuth()) return;
  
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

export function openCWDQuiz() {
  window.open('https://websim.ai/@Camilo/cwd-smart-quiz/quiz', '_blank');
}

// Quiz state
let currentQuizQuestion = 0;
let quizScore = 0;
const quizQuestions = [
  {
    question: "O que significa CWD?",
    options: [
      "Certified Web Developer",
      "Complete Web Development",
      "Creative Web Design",
      "Computer Web Development"
    ],
    correctAnswer: 1
  },
  {
    question: "Qual é a linguagem principal para estruturar páginas web?",
    options: ["HTML", "CSS", "JavaScript", "Python"],
    correctAnswer: 0
  },
  {
    question: "Para que serve o CSS?",
    options: [
      "Programação backend",
      "Banco de dados",
      "Estilização de páginas",
      "Processamento de dados"
    ],
    correctAnswer: 2
  },
  // Add more questions as needed
];

export function startCWDQuiz() {
  const studyContainer = document.querySelector('.study-container');
  
  // Create and show quiz container
  const quizHTML = `
    <div class="quiz-container">
      <h3>CWD Smart Quiz</h3>
      <div class="quiz-content">
        ${renderQuizQuestion()}
      </div>
    </div>
  `;
  
  // Replace content after the quiz button
  const quizButton = document.querySelector('.quiz-link-button');
  quizButton.insertAdjacentHTML('afterend', quizHTML);
  
  // Update button text and onclick
  quizButton.textContent = 'Voltar ao Modo Estudo';
  quizButton.onclick = resetStudyMode;
}

function renderQuizQuestion() {
  const question = quizQuestions[currentQuizQuestion];
  return `
    <div class="quiz-question">${question.question}</div>
    <div class="quiz-options">
      ${question.options.map((option, index) => `
        <div class="quiz-option" onclick="handleQuizAnswer(${index})">
          ${option}
        </div>
      `).join('')}
    </div>
    <div class="quiz-progress">
      Questão ${currentQuizQuestion + 1} de ${quizQuestions.length}
    </div>
  `;
}

window.handleQuizAnswer = function(selectedIndex) {
  const question = quizQuestions[currentQuizQuestion];
  const options = document.querySelectorAll('.quiz-option');
  
  // Disable all options
  options.forEach(option => option.style.pointerEvents = 'none');
  
  // Show correct/incorrect feedback
  if (selectedIndex === question.correctAnswer) {
    options[selectedIndex].classList.add('correct');
    quizScore++;
    showFeedback(true);
  } else {
    options[selectedIndex].classList.add('incorrect');
    options[question.correctAnswer].classList.add('correct');
    showFeedback(false);
  }
  
  // Move to next question after delay
  setTimeout(() => {
    currentQuizQuestion++;
    if (currentQuizQuestion < quizQuestions.length) {
      document.querySelector('.quiz-content').innerHTML = renderQuizQuestion();
    } else {
      showQuizResults();
    }
  }, 2000);
};

function showFeedback(isCorrect) {
  const feedback = document.createElement('div');
  feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  feedback.textContent = isCorrect ? 'Correto!' : 'Incorreto!';
  document.querySelector('.quiz-content').appendChild(feedback);
}

function showQuizResults() {
  const percentageScore = (quizScore / quizQuestions.length) * 100;
  document.querySelector('.quiz-content').innerHTML = `
    <div class="quiz-results">
      <h3>Resultado Final</h3>
      <p>Você acertou ${quizScore} de ${quizQuestions.length} questões</p>
      <p>Porcentagem: ${percentageScore}%</p>
      <button onclick="resetQuiz()">Tentar Novamente</button>
    </div>
  `;
}

window.resetQuiz = function() {
  currentQuizQuestion = 0;
  quizScore = 0;
  document.querySelector('.quiz-content').innerHTML = renderQuizQuestion();
};

function resetStudyMode() {
  const quizContainer = document.querySelector('.quiz-container');
  if (quizContainer) {
    quizContainer.remove();
  }
  
  const quizButton = document.querySelector('.quiz-link-button');
  quizButton.textContent = 'Acessar CWD Smart Quiz';
  quizButton.onclick = startCWDQuiz;
}

// Helper Functions
function getRandomColor() {
  const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function showCurrentFlashcard() {
  const card = window.flashcards[window.currentFlashcardIndex];
  const flashcard = document.getElementById('flashcard');
  if (flashcard && card) {
    flashcard.querySelector('.flashcard-front p').textContent = card.front;
    flashcard.querySelector('.flashcard-back p').textContent = card.back;
  }
}

async function loadStudyData() {
  if (!checkAuth()) return;
  
  try {
    // Load subjects
    const subjectsSnapshot = await getDocs(
      query(
        collection(db, 'subjects'),
        where('userId', '==', auth.currentUser.uid)
      )
    );
    
    const subjectsContainer = document.querySelector('.subjects');
    if (subjectsContainer) {
      subjectsContainer.innerHTML = '';
      subjectsSnapshot.forEach(doc => {
        const subject = doc.data();
        subjectsContainer.innerHTML += `
          <div class="subject-slot" 
               draggable="true" 
               style="background-color: ${subject.color}"
               ondragstart="handleDragStart(event)">
            ${subject.name}
          </div>
        `;
      });
    }
    
    // Load latest flashcard
    const flashcardsSnapshot = await getDocs(
      query(
        collection(db, 'flashcards'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      )
    );
    
    if (!flashcardsSnapshot.empty) {
      const card = flashcardsSnapshot.docs[0].data();
      const flashcard = document.getElementById('flashcard');
      if (flashcard) {
        flashcard.querySelector('.flashcard-front p').textContent = card.front;
        flashcard.querySelector('.flashcard-back p').textContent = card.back;
      }
    }
  } catch (error) {
    console.error('Error loading study data:', error);
  }
}

async function loadTasks() {
  if (!checkAuth()) return;

  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'tasks'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      )
    );
    
    const tasksList = document.getElementById('tasks-list');
    if (tasksList) {
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
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

async function loadHealthData() {
  if (!checkAuth()) return;
  
  try {
    // Load water tracking
    const date = new Date().toISOString().split('T')[0];
    const waterSnapshot = await getDocs(
      query(
        collection(db, 'water_tracking'),
        where('userId', '==', auth.currentUser.uid),
        where('date', '==', date)
      )
    );
    
    const waterCount = waterSnapshot.empty ? 0 : waterSnapshot.docs[0].data().cups;
    const waterStat = document.querySelector('.health-card:nth-child(1) .health-stat');
    if (waterStat) {
      waterStat.textContent = `${waterCount}/8`;
    }
    
    // Load exercise minutes
    const exerciseSnapshot = await getDocs(
      query(
        collection(db, 'exercise_tracking'),
        where('userId', '==', auth.currentUser.uid),
        where('date', '==', date)
      )
    );
    
    let totalMinutes = 0;
    exerciseSnapshot.forEach(doc => {
      totalMinutes += doc.data().minutes;
    });
    
    const exerciseStat = document.querySelector('.health-card:nth-child(2) .health-stat');
    if (exerciseStat) {
      exerciseStat.textContent = `${totalMinutes} min`;
    }
    
    // Load medications
    const medicationsSnapshot = await getDocs(
      query(
        collection(db, 'medications'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('time')
      )
    );
    
    const medicationList = document.getElementById('medication-list');
    if (medicationList) {
      medicationList.innerHTML = '';
      medicationsSnapshot.forEach(doc => {
        const med = doc.data();
        medicationList.innerHTML += `
          <div class="medication-item">${med.name} - ${med.time}</div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading health data:', error);
  }
}

async function loadHomeData() {
  if (!checkAuth()) return;
  
  try {
    const shoppingSnapshot = await getDocs(
      query(
        collection(db, 'shopping_items'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      )
    );
    
    const shoppingList = document.getElementById('shopping-list');
    if (shoppingList) {
      shoppingList.innerHTML = '<h3>Lista de Compras</h3>';
      shoppingSnapshot.forEach(doc => {
        const item = doc.data();
        shoppingList.innerHTML += `
          <div class="shopping-item">
            <span>${item.item}</span>
            <span>${item.quantity}</span>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading home data:', error);
  }
}

async function loadChatMessages() {
  if (!checkAuth()) return;

  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'chat_messages'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      )
    );
    
    const chatArea = document.querySelector('.chat-area');
    if (chatArea) {
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
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}