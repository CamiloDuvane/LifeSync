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
  limit,
  doc,
  updateDoc,
  deleteDoc
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

  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const deadline = document.getElementById('task-deadline').value;

  if (!title || !description || !deadline) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  try {
    await addDoc(collection(db, 'tasks'), {
      userId: auth.currentUser.uid,
      title,
      description,
      deadline,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    // Clear form
    document.getElementById('task-form').reset();
    
    // Reload tasks list
    await loadTasks();
    alert('Tarefa adicionada com sucesso!');
  } catch (error) {
    console.error('Error adding task:', error);
    alert('Erro ao adicionar tarefa: ' + error.message);
  }
}

export async function addMeeting() {
  if (!checkAuth()) return;

  const title = document.getElementById('meeting-title').value;
  const date = document.getElementById('meeting-date').value;
  const time = document.getElementById('meeting-time').value;
  const participants = document.getElementById('meeting-participants').value;

  if (!title || !date || !time || !participants) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  try {
    await addDoc(collection(db, 'meetings'), {
      userId: auth.currentUser.uid,
      title,
      date,
      time,
      participants: participants.split(',').map(p => p.trim()),
      createdAt: serverTimestamp()
    });
    
    // Clear form
    document.getElementById('meeting-form').reset();
    
    // Reload meetings
    await loadMeetings();
    alert('Reunião agendada com sucesso!');
  } catch (error) {
    console.error('Error adding meeting:', error);
    alert('Erro ao agendar reunião: ' + error.message);
  }
}

export async function addColleague() {
  if (!checkAuth()) return;

  const name = document.getElementById('colleague-name').value;
  const position = document.getElementById('colleague-position').value;
  const contact = document.getElementById('colleague-contact').value;

  if (!name || !position || !contact) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  try {
    await addDoc(collection(db, 'colleagues'), {
      userId: auth.currentUser.uid,
      name,
      position,
      contact,
      createdAt: serverTimestamp()
    });
    
    // Clear form
    document.getElementById('colleague-form').reset();
    
    // Reload colleagues
    await loadColleagues();
    alert('Colega adicionado com sucesso!');
  } catch (error) {
    console.error('Error adding colleague:', error);
    alert('Erro ao adicionar colega: ' + error.message);
  }
}

export async function saveNotes() {
  if (!checkAuth()) return;

  const notes = document.getElementById('work-notes').value;

  if (!notes.trim()) {
    alert('Por favor, escreva alguma anotação');
    return;
  }

  try {
    const notesRef = collection(db, 'work_notes');
    const q = query(notesRef, where('userId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(notesRef, {
        userId: auth.currentUser.uid,
        content: notes,
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(snapshot.docs[0].ref, {
        content: notes,
        updatedAt: serverTimestamp()
      });
    }
    alert('Anotações salvas com sucesso!');
  } catch (error) {
    console.error('Error saving notes:', error);
    alert('Erro ao salvar anotações: ' + error.message);
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
      await updateDoc(doc.ref, {
        cups: doc.data().cups + 1,
        updatedAt: serverTimestamp()
      });
    }
    
    await loadHealthData();
    alert('Copo de água registrado com sucesso!');
  } catch (error) {
    console.error('Error tracking water:', error);
    alert('Erro ao registrar água: ' + error.message);
  }
}

export async function trackExercise() {
  if (!checkAuth()) return;
  
  const minutes = prompt('Quantos minutos de exercício?');
  if (!minutes || isNaN(minutes)) {
    alert('Por favor, insira um número válido de minutos');
    return;
  }
  
  try {
    await addDoc(collection(db, 'exercise_tracking'), {
      userId: auth.currentUser.uid,
      minutes: parseInt(minutes),
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    });
    
    await loadHealthData();
    alert('Exercício registrado com sucesso!');
  } catch (error) {
    console.error('Error tracking exercise:', error);
    alert('Erro ao registrar exercício: ' + error.message);
  }
}

export async function addMedication() {
  if (!checkAuth()) return;

  const name = document.getElementById('med-name').value;
  const time1 = document.getElementById('med-time1').value;
  const time2 = document.getElementById('med-time2').value;
  const time3 = document.getElementById('med-time3').value;

  if (!name || (!time1 && !time2 && !time3)) {
    alert('Por favor, preencha o nome e pelo menos um horário');
    return;
  }

  const times = [time1, time2, time3].filter(Boolean);

  try {
    await addDoc(collection(db, 'medications'), {
      userId: auth.currentUser.uid,
      name,
      times,
      createdAt: serverTimestamp()
    });
    
    // Clear form
    document.getElementById('medication-form').reset();
    
    // Reload health data
    await loadHealthData();
    alert('Medicamento adicionado com sucesso!');
  } catch (error) {
    console.error('Error adding medication:', error);
    alert('Erro ao adicionar medicamento: ' + error.message);
  }
}

// Home Functions
export async function addShoppingItem() {
  if (!checkAuth()) return;

  const name = document.getElementById('item-name').value;
  const description = document.getElementById('item-description').value;
  const price = document.getElementById('item-price').value;

  if (!name || !description || !price) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  try {
    await addDoc(collection(db, 'shopping_items'), {
      userId: auth.currentUser.uid,
      name,
      description,
      price: parseFloat(price),
      createdAt: serverTimestamp()
    });
    
    // Clear form
    document.getElementById('shopping-form').reset();
    
    // Reload home data
    await loadHomeData();
    alert('Item adicionado com sucesso!');
  } catch (error) {
    console.error('Error adding shopping item:', error);
    alert('Erro ao adicionar item: ' + error.message);
  }
}

// Add load functions for each section
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

async function loadMeetings() {
  if (!checkAuth()) return;

  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'meetings'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      )
    );
    
    const meetingsList = document.getElementById('meetings-list');
    if (meetingsList) {
      meetingsList.innerHTML = '';
      snapshot.forEach(doc => {
        const meeting = doc.data();
        meetingsList.innerHTML += `
          <div class="meeting-item">
            <h3>${meeting.title}</h3>
            <p>Data: ${meeting.date}</p>
            <p>Hora: ${meeting.time}</p>
            <p>Participantes: ${meeting.participants.join(', ')}</p>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading meetings:', error);
  }
}

async function loadColleagues() {
  if (!checkAuth()) return;

  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'colleagues'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      )
    );
    
    const colleaguesList = document.getElementById('colleagues-list');
    if (colleaguesList) {
      colleaguesList.innerHTML = '';
      snapshot.forEach(doc => {
        const colleague = doc.data();
        colleaguesList.innerHTML += `
          <div class="colleague-item">
            <h3>${colleague.name}</h3>
            <p>Cargo: ${colleague.position}</p>
            <p>Contato: ${colleague.contact}</p>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading colleagues:', error);
  }
}

// Health Functions
async function loadHealthData() {
  if (!checkAuth()) return;
  
  try {
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
          <div class="medication-item">${med.name} - ${med.times.join(', ')}</div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading health data:', error);
  }
}

// Home Functions
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
            <span>${item.name}</span>
            <span>${item.description}</span>
            <span>R$ ${item.price}</span>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading home data:', error);
  }
}

// Study Functions
async function loadStudyData() {
  if (!checkAuth()) return;
  
  try {
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
  window.open('https://camiloduvane.github.io/LifeSync/', '_blank');
}

// Quiz state and data
export let currentQuizQuestion = 0;
export let quizScore = 0;
export let selectedSubject = null;

export const subjects = [
  {
    id: 'matematica',
    name: 'Matemática',
    questions: [
   {
      question: "Qual é a área de um triângulo com base de 8 cm e altura de 5 cm?",
      options: ["20 cm²", "30 cm²", "40 cm²", "25 cm²"],
      ccorrectAnswer: 3,
      explanation: "A fórmula de Bhaskara é usada para resolver equações quadráticas."
    }, {
      question: "Qual é a fórmula de Bhaskara?",
      options: ["x = (-b ± √(b² - 4ac)) / 2a", "E = mc²", "a² + b² = c²", "F = ma"],
      correctAnswer: 0,
      explanation: "A fórmula de Bhaskara é usada para resolver equações quadráticas."
    }, {
      question: "Qual é a área de um triângulo com base de 8 cm e altura de 5 cm?",
      options: ["20 cm²", "30 cm²", "40 cm²", "25 cm²"],
      ccorrectAnswer: 3,
      explanation: "A fórmula de Bhaskara é usada para resolver equações quadráticas."
    }, {
      question: "Resolva: 3x + 2 = 11. Qual é o valor de x?",
      options: ["2", "3", "4", "5"],
      correctAnswer: 1,
      explanation: "A fórmula de Bhaskara é usada para resolver equações quadráticas."
    }, {
      question: "Qual é o valor de 7²?",
      options: ["14", "49", "21", "42"],
      correctAnswer: 1,
      explanation: "A fórmula de Bhaskara é usada para resolver equações quadráticas."
    }, {
      question: "Qual é o perímetro de um quadrado com lado de 6 cm?",
      options: ["24 cm", "36 cm", "12 cm", "18 cm"],
      ccorrectAnswer: 0,
      explanation: "A fórmula de Bhaskara é usada para resolver equações quadráticas."
    }
    ],
    materials: [
      {
        title: "Álgebra Básica",
        author: "Prof. Maria Silva",
        content: `
          <div class="content-section">
            <h3>Fundamentos da Álgebra</h3>
            <p>A álgebra é um ramo fundamental da matemática que lida com símbolos e regras para manipulá-los.</p>
            
            <h3>Conceitos Principais</h3>
            <ul>
              <li>Expressões Algébricas</li>
              <li>Equações de 1º e 2º grau</li>
              <li>Funções Matemáticas</li>
            </ul>
            
            <div class="example-box">
              <h4>Exemplo: Equação do 2º Grau</h4>
              <p>x² + 5x + 6 = 0</p>
              <p>Usando a fórmula de Bhaskara:</p>
              <p>x = -5 ± √(25-24) / 2</p>
              <p>x = -2 ou x = -3</p>
            </div>
          </div>
        `
      }
    ]
  },
  {
    id: 'portugues',
    name: 'Português',
    questions: [
      {
        question: "O que são figuras de linguagem?",
        options: [
          "Recursos estilísticos que enriquecem a expressão",
          "Regras gramaticais",
          "Sinais de pontuação",
          "Tipos de verbos"
        ],
        correctAnswer: 0
      }
    ],
    materials: [
      {
        title: "Literatura e Linguagem",
        author: "Prof. Ana Pereira",
        content: `
          <div class="content-section">
            <h3>Figuras de Linguagem</h3>
            <p>As figuras de linguagem são recursos estilísticos que tornam o texto mais expressivo e criativo.</p>
            
            <h3>Principais Figuras</h3>
            <ul>
              <li>Metáfora: Comparação implícita</li>
              <li>Metonímia: Substituição por relação lógica</li>
              <li>Hipérbole: Exagero intencional</li>
            </ul>
            
            <div class="example-box">
              <h4>Exemplos Práticos</h4>
              <p>Metáfora: "Seus olhos são diamantes"</p>
              <p>Metonímia: "Ler Machado de Assis" (obra do autor)</p>
              <p>Hipérbole: "Morri de rir"</p>
            </div>
          </div>
        `
      }
    ]
  },
  {
    id: 'biologia',
    name: 'Biologia',
    questions: [
      {
        question: "O que é fotossíntese?",
        options: [
          "Processo de produção de energia usando luz solar",
          "Processo de digestão celular",
          "Divisão celular",
          "Reprodução bacteriana"
        ],
        correctAnswer: 0
      }
    ],
    materials: [
      {
        title: "Biologia Celular",
        author: "Prof. Carlos Santos",
        content: `
          <div class="content-section">
            <h3>A Célula</h3>
            <p>A célula é a unidade básica da vida, capaz de realizar todas as funções vitais.</p>
            
            <h3>Estruturas Celulares</h3>
            <ul>
              <li>Membrana Plasmática: Controle de entrada e saída</li>
              <li>Citoplasma: Meio interno celular</li>
              <li>Núcleo: Centro de controle</li>
            </ul>
            
            <div class="example-box">
              <h4>Processos Celulares</h4>
              <p>Fotossíntese: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</p>
              <p>Respiração Celular: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP</p>
            </div>
          </div>
        `
      }
    ]
  },
  {
    id: 'quimica',
    name: 'Química',
    questions: [
      {
        question: "O que é a tabela periódica?",
        options: [
          "Organização sistemática dos elementos químicos",
          "Lista de reações químicas",
          "Tabela de volumes",
          "Registro de experiências"
        ],
        correctAnswer: 0
      }
    ],
    materials: [
      {
        title: "Química Geral",
        author: "Prof. Roberto Alves",
        content: `
          <div class="content-section">
            <h3>Tabela Periódica</h3>
            <p>A tabela periódica organiza os elementos químicos de acordo com suas propriedades.</p>
            
            <h3>Estrutura da Tabela</h3>
            <ul>
              <li>Períodos: Linhas horizontais</li>
              <li>Grupos: Colunas verticais</li>
              <li>Propriedades periódicas</li>
            </ul>
            
            <div class="example-box">
              <h4>Elementos Importantes</h4>
              <p>Hidrogênio (H): Átomo mais simples</p>
              <p>Carbono (C): Base da química orgânica</p>
              <p>Oxigênio (O): Essencial para a vida</p>
            </div>
          </div>
        `
      }
    ]
  }
];

export function startCWDQuiz() {
  if (!checkAuth()) return;
  
  const quizHTML = `
    <div class="quiz-container">
      <h3>CWD Smart Quiz</h3>
      <div class="subjects-grid">
        ${subjects.map(subject => `
          <div class="subject-card" onclick="selectSubject('${subject.id}')">
            <h4>${subject.name}</h4>
            <p>${subject.questions ? subject.questions.length : 0} questões</p>
          </div>
        `).join('')}
      </div>
      <div class="quiz-controls">
        <button onclick="viewMaterials()">Material de Estudo</button>
        <button onclick="viewReport()">Ver Relatório</button>
        <button onclick="downloadReport()">Baixar Relatório</button>
      </div>
    </div>
  `;
  
  document.querySelector('.study-container').innerHTML = quizHTML;
}

export function selectSubject(subjectId) {
  selectedSubject = subjects.find(s => s.id === subjectId);
  currentQuizQuestion = 0;
  quizScore = 0;
  
  const quizHTML = `
    <div class="quiz-container">
      <div class="quiz-content">
        ${renderQuizQuestion()}
      </div>
      <button class="back-button" onclick="startCWDQuiz()">Voltar para Disciplinas</button>
    </div>
  `;
  
  document.querySelector('.study-container').innerHTML = quizHTML;
}

export function viewMaterials() {
  const materialsHTML = `
    <div class="materials-container">
      <h3>Material de Estudo</h3>
      <div class="materials-grid">
        ${subjects.map(subject => subject.materials ? `
          <div class="material-card">
            <h4>${subject.name}</h4>
            ${subject.materials.map(material => `
              <div class="material-item">
                <h5>${material.title}</h5>
                <p class="material-author">${material.author}</p>
                <button class="view-material-btn" onclick="viewMaterialContent('${subject.id}', '${material.title}')">
                  Ver Material
                </button>
              </div>
            `).join('')}
          </div>
        ` : '').join('')}
      </div>
      <button class="back-button" onclick="startCWDQuiz()">Voltar</button>
    </div>
  `;
  
  document.querySelector('.study-container').innerHTML = materialsHTML;
}

export function viewMaterialContent(subjectId, materialTitle) {
  const subject = subjects.find(s => s.id === subjectId);
  const material = subject.materials.find(m => m.title === materialTitle);
  
  if (!material) return;

  const contentHTML = `
    <div class="material-content-container">
      <h2>${material.title}</h2>
      <p class="material-author">por ${material.author}</p>
      <div class="material-full-content">
        ${material.content}
      </div>
      <button class="back-button" onclick="viewMaterials()">Voltar para Materiais</button>
    </div>
  `;

  document.querySelector('.study-container').innerHTML = contentHTML;
}

export function viewReport() {
  const report = generateReport();
  document.querySelector('.study-container').innerHTML = `
    <div class="report-container">
      <h3>Relatório de Desempenho</h3>
      <div class="report-content">
        ${report}
      </div>
      <button class="back-button" onclick="startCWDQuiz()">Voltar</button>
    </div>
  `;
}

export function downloadReport() {
  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    .then(() => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const user = auth.currentUser;
      
      // Header
      doc.setFontSize(20);
      doc.text('Relatório de Desempenho', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Aluno: ${user?.displayName || user?.email || 'Usuário'}`, 20, 35);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 45);
      
      let yPos = 60;

      // Overall Performance
      doc.setFontSize(16);
      doc.text('Desempenho Geral', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.text(`Pontuação Total: ${quizScore} pontos`, 20, yPos);
      yPos += 10;
      doc.text(`Taxa de Acerto: ${((quizScore / currentQuizQuestion) * 100).toFixed(1)}%`, 20, yPos);
      yPos += 20;

      // Subject Details
      subjects.forEach((subject, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text(subject.name, 20, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.text(`Total de Questões: ${subject.questions.length}`, 30, yPos);
        yPos += 10;
        doc.text(`Material de Estudo: ${subject.materials.length} recursos`, 30, yPos);
        yPos += 20;
      });

      doc.save('relatorio-desempenho.pdf');
    });
}

export function downloadSubjectReport(subjectId) {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject || !completedQuizzes[subjectId]) return;

  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    .then(() => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const user = auth.currentUser;

      // Header
      doc.setFontSize(20);
      doc.text(`Relatório - ${subject.name}`, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Aluno: ${user?.displayName || user?.email || 'Usuário'}`, 20, 35);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 45);
      
      let yPos = 60;
      
      const subjectData = completedQuizzes[subject.id];
      const correctAnswers = subjectData.answers.filter(answer => answer.isCorrect).length;
      const percentage = ((correctAnswers / subjectData.answers.length) * 100).toFixed(1);

      // Summary
      doc.setFontSize(16);
      doc.text('Resumo do Desempenho', 20, yPos);
      yPos += 15;

      doc.setFontSize(12);
      doc.text(`Total de Questões: ${subjectData.answers.length}`, 20, yPos);
      yPos += 10;
      doc.text(`Total de Acertos: ${correctAnswers}`, 20, yPos);
      yPos += 10;
      doc.text(`Percentual de Acerto: ${percentage}%`, 20, yPos);
      yPos += 20;

      // Questions and Answers
      doc.setFontSize(16);
      doc.text('Detalhamento das Questões', 20, yPos);
      yPos += 15;

      subjectData.answers.forEach((answer, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.text(`Questão ${index + 1}: ${answer.question}`, 20, yPos);
        yPos += 10;
        doc.text(`Sua resposta: ${answer.selectedAnswer}`, 30, yPos);
        yPos += 7;
        doc.text(`Resposta correta: ${answer.correctAnswer}`, 30, yPos);
        yPos += 7;
        doc.text(`Resultado: ${answer.isCorrect ? 'Correto' : 'Incorreto'}`, 30, yPos);
        yPos += 15;
      });

      doc.save(`relatorio-${subject.id}.pdf`);
    });
}

let completedQuizzes = {};

export function handleQuizAnswer(selectedIndex) {
  if (!selectedSubject) return;
  
  const container = document.querySelector('.quiz-content');
  if (!container) return;
  
  const question = selectedSubject.questions[currentQuizQuestion];
  const options = document.querySelectorAll('.quiz-option');
  
  options.forEach(option => option.style.pointerEvents = 'none');
  
  // Track the answer
  if (!completedQuizzes[selectedSubject.id]) {
    completedQuizzes[selectedSubject.id] = {
      name: selectedSubject.name,
      answers: [],
      score: 0,
      totalQuestions: selectedSubject.questions.length
    };
  }
  
  completedQuizzes[selectedSubject.id].answers.push({
    question: question.question,
    selectedAnswer: options[selectedIndex].textContent,
    correctAnswer: options[question.correctAnswer].textContent,
    isCorrect: selectedIndex === question.correctAnswer
  });
  
  if (selectedIndex === question.correctAnswer) {
    options[selectedIndex].classList.add('correct');
    quizScore++;
    completedQuizzes[selectedSubject.id].score++;
    showFeedback(true);
  } else {
    options[selectedIndex].classList.add('incorrect');
    options[question.correctAnswer].classList.add('correct');
    showFeedback(false);
  }
  
  setTimeout(() => {
    currentQuizQuestion++;
    if (currentQuizQuestion < selectedSubject.questions.length) {
      container.innerHTML = renderQuizQuestion();
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
  const content = document.querySelector('.study-container');
  if (!content) return;
  
  const percentageScore = (quizScore / selectedSubject.questions.length) * 100;
  content.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-content">
        <div class="quiz-results">
          <h3>Resultado Final</h3>
          <p>Você acertou ${quizScore} de ${selectedSubject.questions.length} questões</p>
          <p>Porcentagem: ${percentageScore}%</p>
        </div>
      </div>
      <button class="back-button" onclick="window.resetQuiz()">Tentar Novamente</button>
      <button class="back-button" onclick="startCWDQuiz()">Voltar para Disciplinas</button>
    </div>
  `;
}

export function resetQuiz() {
  currentQuizQuestion = 0;
  quizScore = 0;
  
  const container = document.querySelector('.study-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="quiz-container">
      <div class="quiz-content">
        ${renderQuizQuestion()}
      </div>
      <button class="back-button" onclick="startCWDQuiz()">Voltar para Disciplinas</button>
    </div>
  `;
}

function generateReport() {
  const completedSubjects = Object.entries(completedQuizzes)
    .filter(([_, quiz]) => quiz.answers && quiz.answers.length > 0)
    .map(([id, quiz]) => ({id, ...quiz}));

  if (completedSubjects.length === 0) {
    return `
      <div class="report-section">
        <h3>Nenhum quiz completado ainda</h3>
        <p>Complete alguns quizzes para gerar seu relatório de desempenho.</p>
      </div>
    `;
  }

  let reportHTML = `
    <div class="report-section">
      <h3>Desempenho Geral</h3>
      <div class="performance-stats">
  `;

  let totalQuestions = 0;
  let totalCorrect = 0;

  completedSubjects.forEach(subject => {
    const correctAnswers = subject.answers.filter(answer => answer.isCorrect).length;
    totalQuestions += subject.answers.length;
    totalCorrect += correctAnswers;
  });

  const overallPercentage = ((totalCorrect / totalQuestions) * 100).toFixed(1);

  reportHTML += `
        <p>Total de Questões Respondidas: ${totalQuestions}</p>
        <p>Total de Acertos: ${totalCorrect}</p>
        <p>Percentual de Acerto: ${overallPercentage}%</p>
      </div>
    </div>

    <div class="report-section">
      <h3>Desempenho por Disciplina</h3>
  `;

  completedSubjects.forEach(subject => {
    const correctAnswers = subject.answers.filter(answer => answer.isCorrect).length;
    const percentage = ((correctAnswers / subject.answers.length) * 100).toFixed(1);

    reportHTML += `
      <div class="subject-report">
        <h4>${subject.name}</h4>
        <p>Questões Respondidas: ${subject.answers.length}</p>
        <p>Acertos: ${correctAnswers}</p>
        <p>Percentual: ${percentage}%</p>
        <button onclick="viewSubjectDetails('${subject.id}')" class="view-details-btn">
          Ver Detalhes
        </button>
        <button onclick="downloadSubjectReport('${subject.id}')" class="download-btn">
          Baixar Relatório
        </button>
      </div>
    `;
  });

  reportHTML += `
    </div>
  `;

  return reportHTML;
}

export function viewSubjectDetails(subjectId) {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject || !completedQuizzes[subjectId]) return;

  const detailsHTML = generateDetailedReport(subject);
  document.querySelector('.study-container').innerHTML = `
    <div class="subject-details-container">
      ${detailsHTML}
      <button class="back-button" onclick="startCWDQuiz()">Voltar</button>
    </div>
  `;
}

function generateDetailedReport(subject) {
  const subjectData = completedQuizzes[subject.id];
  
  if (!subjectData || !subjectData.answers || subjectData.answers.length === 0) {
    return `
      <div class="subject-report-detail">
        <h3>${subject.name}</h3>
        <p>Nenhuma questão respondida ainda nesta disciplina.</p>
      </div>
    `;
  }

  const correctAnswers = subjectData.answers.filter(answer => answer.isCorrect).length;
  const percentage = ((correctAnswers / subjectData.answers.length) * 100).toFixed(1);

  let detailHTML = `
    <div class="subject-report-detail">
      <h3>${subject.name}</h3>
      
      <div class="performance-stats">
        <p>Total de Questões: ${subjectData.answers.length}</p>
        <p>Acertos: ${correctAnswers}</p>
        <p>Percentual: ${percentage}%</p>
      </div>

      <div class="questions-review">
        <h4>Revisão das Questões</h4>
  `;

  subjectData.answers.forEach((answer, index) => {
    detailHTML += `
      <div class="question-review">
        <p class="question-text">Questão ${index + 1}: ${answer.question}</p>
        <div class="options-review">
          <p class="option ${answer.selectedAnswer === answer.correctAnswer ? 'correct' : ''}">
            Sua resposta: ${answer.selectedAnswer}
          </p>
          <p class="option correct">
            Resposta correta: ${answer.correctAnswer}
          </p>
        </div>
      </div>
    `;
  });

  detailHTML += `
      </div>
    </div>
  `;

  return detailHTML;
}

// Add these to window object
window.viewSubjectDetails = viewSubjectDetails;
window.downloadSubjectReport = downloadSubjectReport;

export function renderQuizQuestion() {
  if (!selectedSubject) return '';
  
  const question = selectedSubject.questions[currentQuizQuestion];
  return `
    <div class="quiz-question">${question.question}</div>
    <div class="quiz-options">
      ${question.options.map((option, index) => `
        <div class="quiz-option" onclick="window.handleQuizAnswer(${index})">
          ${option}
        </div>
      `).join('')}
    </div>
    <div class="quiz-progress">
      Questão ${currentQuizQuestion + 1} de ${selectedSubject.questions.length}
    </div>
  `;
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

window.viewMaterialContent = viewMaterialContent;
window.viewMaterials = viewMaterials;
window.viewSubjectDetails = viewSubjectDetails;
window.downloadSubjectReport = downloadSubjectReport;

export async function loadAdminMessage() {
  try {
    const messageRef = collection(db, 'admin_messages');
    const q = query(messageRef, where('userId', '==', 'camilowilliam0@gmail.com'), orderBy('createdAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    const messageBoard = document.querySelector('.message-board');
    if (!snapshot.empty) {
      const message = snapshot.docs[0].data();
      messageBoard.innerHTML = `
        <div class="admin-message">
          <h4>Mensagem do Administrador:</h4>
          <p>${message.content}</p>
          <small>Enviado em: ${message.createdAt.toDate().toLocaleString()}</small>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading admin message:', error);
  }
}

// Add functions to window object
window.saveNotes = saveNotes;
window.addTask = addTask;
window.addMeeting = addMeeting;
window.addColleague = addColleague;
window.trackWater = trackWater;
window.trackExercise = trackExercise;
window.addMedication = addMedication;
window.addShoppingItem = addShoppingItem;
window.sendMessage = sendMessage;
