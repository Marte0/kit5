// Rilevamento dispositivo
function isMobileDevice() {
  // Controlla touch support e dimensioni schermo
  const hasTouchScreen = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isSmallScreen = window.innerWidth <= 768;
  
  return hasTouchScreen && isSmallScreen;
}

// Applica classe desktop al body se necessario
if (!isMobileDevice()) {
  document.body.classList.add('is-desktop');
}

// Elementi DOM
const screenIntro = document.getElementById("screen-intro");
const screenTutorial = document.getElementById("screen-tutorial");
const screenGame = document.getElementById("screen-game");
const btnIntroNext = document.getElementById("btn-intro-next");
const btnTutorialPlay = document.getElementById("btn-tutorial-play");

const timerText = document.getElementById("timer-text");
const energyIndicator = document.getElementById("energy-indicator");
const btnSocket = document.getElementById("btn-socket");
const btnEnergy = document.getElementById("btn-energy");
const countdownOverlay = document.getElementById("countdown-overlay");
const countdownText = document.getElementById("countdown-text");
const particlesContainer = document.getElementById("particles-container");
const gameoverOverlay = document.getElementById("gameover-overlay");
const endgameOverlay = document.getElementById("endgame-overlay");
const endgameTitle = document.getElementById("endgame-title");
const endgameMessage = document.getElementById("endgame-message");
const endgameIcon = document.getElementById("endgame-icon");
const btnEndgameReplay = document.getElementById("btn-endgame-replay");

// Stati del gioco
const STATES = {
  INTRO: 'intro',
  TUTORIAL: 'tutorial',
  GAME: 'game',
  RESULT: 'result'
};

let currentState = STATES.INTRO;
let energyValue = 1.0;
let timeRemainingMs = 15000;
let lastTickTime = performance.now();
let gameStarted = false;

// Gestione cambio stato
function changeState(newState) {
  currentState = newState;
  
  // Nascondi tutte le schermate
  screenIntro.style.display = 'none';
  screenTutorial.style.display = 'none';
  screenGame.style.display = 'none';
  
  // Mostra la schermata corrente
  switch(newState) {
    case STATES.INTRO:
      screenIntro.style.display = 'flex';
      break;
    case STATES.TUTORIAL:
      screenTutorial.style.display = 'flex';
      break;
    case STATES.GAME:
      screenGame.style.display = 'flex';
      countdownOverlay.style.display = 'flex';
      startCountdown();
      break;
  }
}

// Event listeners navigazione (solo se non è desktop)
if (isMobileDevice()) {
  btnIntroNext.addEventListener('click', () => {
    changeState(STATES.TUTORIAL);
  });

  btnTutorialPlay.addEventListener('click', () => {
    changeState(STATES.GAME);
  });
}

function updateTimerUI() {
  const seconds = Math.floor(timeRemainingMs / 1000);
  const tenths = Math.floor((timeRemainingMs % 1000) / 100);
  timerText.textContent = `${seconds}:${tenths}`;
}

function updateEnergyUI() {
  // Il cerchio giallo parte da 350px (scale 1.0) e può crescere/diminuire senza limiti
  energyIndicator.style.transform = `translate(-50%, -50%) scale(${energyValue})`;
}

function checkGameOver() {
  // Dimensioni cerchi: outer = 500px, middle = 150px, energy base = 350px
  const energyDiameter = energyValue * 350;
  const outerDiameter = 500;
  const middleDiameter = 150;
  
  // Condizioni di fine gioco
  if (energyDiameter > outerDiameter) {
    gameOver('consumo-overload'); // Troppa energia/produzione
    return true;
  }
  
  if (energyDiameter < middleDiameter) {
    gameOver('consumo-shortage'); // Troppi consumi
    return true;
  }
  
  if (timeRemainingMs <= 0) {
    gameOver('energia'); // Fin 2: Energia vince (timer finito)
    return true;
  }
  
  return false;
}

function gameOver(winner) {
  gameStarted = false;
  
  // Reset completo overlay STOP
  gameoverOverlay.classList.remove('show');
  gameoverOverlay.style.display = 'none';
  
  // Mostra overlay STOP dopo un breve delay
  requestAnimationFrame(() => {
    gameoverOverlay.style.display = 'flex';
    requestAnimationFrame(() => {
      gameoverOverlay.classList.add('show');
    });
  });
  
  // Dopo 1.5s mostra schermata finale
  setTimeout(() => {
    showEndgameScreen(winner);
  }, 1500);
}

function showEndgameScreen(winner) {
  // Nascondi overlay STOP
  gameoverOverlay.style.display = 'none';
  gameoverOverlay.classList.remove('show');
  
  // Configura schermata in base al vincitore
  if (winner === 'consumo-overload') {
    // FIN 1: BLACK OUT - Troppa energia
    endgameOverlay.className = 'endgame-overlay consumo';
    endgameTitle.textContent = 'BLACK OUT';
    endgameMessage.innerHTML = 'Troppa energia: la produzione ha superato il consumo e il sistema è crollato!<br><br>Nella rete elettrica produzione e consumo devono reestare sempre in equilibrio';
    endgameIcon.src = 'assets/plug-small.svg';
  } else if (winner === 'consumo-shortage') {
    // FIN 1: BLACK OUT - Troppi consumi
    endgameOverlay.className = 'endgame-overlay consumo';
    endgameTitle.textContent = 'BLACK OUT';
    endgameMessage.innerHTML = 'Troppi consumi: il consumo ha superato la produzione e il sistema è crollato!<br><br>Nella rete elettrica produzione e consumo devono reestare sempre in equilibrio';
    endgameIcon.src = 'assets/plug-small.svg';
  } else {
    // FIN 2: TUTTO BENE
    endgameOverlay.className = 'endgame-overlay energia';
    endgameTitle.textContent = 'TUTTO BENE';
    endgameMessage.innerHTML = 'Sei riuscito a gestire il fabbisogno energetico<br><br>Nella rete elettrica produzione e consumo devono reestare sempre in equilibrio';
    endgameIcon.src = 'assets/lightning-small.svg';
  }
  
  // Mostra overlay finale con animazione
  endgameOverlay.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      endgameOverlay.classList.add('show');
    });
  });
}

// Event listener bottone rigioca
btnEndgameReplay.addEventListener('click', () => {
  // Reset stato gioco
  energyValue = 1.0;
  timeRemainingMs = 15000;
  gameStarted = false;
  updateTimerUI();
  updateEnergyUI();
  
  // Nascondi overlay finale
  endgameOverlay.style.display = 'none';
  endgameOverlay.classList.remove('show');
  
  // Reset countdown overlay
  countdownOverlay.style.display = 'none';
  countdownOverlay.classList.remove('hidden');
  countdownText.className = "countdown-text";
  countdownText.style.opacity = "";
  countdownText.style.transform = "";
  
  // Torna al tutorial
  changeState(STATES.TUTORIAL);
});

function tick(now) {
  if (!gameStarted) return;
  
  const delta = now - lastTickTime;
  lastTickTime = now;
  timeRemainingMs = Math.max(0, timeRemainingMs - delta);
  updateTimerUI();

  if (!checkGameOver()) {
    requestAnimationFrame(tick);
  }
}

function createParticleToButton(targetButton) {
  // Posizione di partenza: centro dello schermo (dove sono le linee)
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;
  
  // Sceglie una delle 3 linee a caso (offset -12px, 0, +12px dal centro)
  const lineOffsets = [-12, 0, 12];
  const randomOffset = lineOffsets[Math.floor(Math.random() * lineOffsets.length)];
  
  // Posizione del bottone target
  const buttonRect = targetButton.getBoundingClientRect();
  const endX = buttonRect.left + buttonRect.width / 2;
  const endY = buttonRect.top + buttonRect.height / 2;
  
  // Crea particella
  const particle = document.createElement("div");
  particle.className = "particle";
  particle.style.left = startX + randomOffset + "px";
  particle.style.top = startY + "px";
  particlesContainer.appendChild(particle);
  
  // Anima dopo un frame
  requestAnimationFrame(() => {
    particle.classList.add("moving-out");
    particle.style.left = endX + "px";
    particle.style.top = endY + "px";
  });
  
  // Effetto glow quando arriva e rimuovi particella
  setTimeout(() => {
    targetButton.classList.add("glow");
    setTimeout(() => {
      targetButton.classList.remove("glow");
    }, 100);
    particle.remove();
  }, 500);
}

function createParticleFromButton(sourceButton) {
  // Posizione di partenza: centro del bottone
  const buttonRect = sourceButton.getBoundingClientRect();
  const startX = buttonRect.left + buttonRect.width / 2;
  const startY = buttonRect.top + buttonRect.height / 2;
  
  // Sceglie una delle 3 linee a caso (offset -12px, 0, +12px dal centro)
  const lineOffsets = [-12, 0, 12];
  const randomOffset = lineOffsets[Math.floor(Math.random() * lineOffsets.length)];
  
  // Posizione di arrivo: centro dello schermo (dove sono le linee)
  const endX = window.innerWidth / 2 + randomOffset;
  const endY = window.innerHeight / 2;
  
  // Prima fa il glow sul bottone
  sourceButton.classList.add("glow");
  setTimeout(() => {
    sourceButton.classList.remove("glow");
  }, 100);
  
  // Crea particella dopo un breve delay
  setTimeout(() => {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = startX + "px";
    particle.style.top = startY + "px";
    particlesContainer.appendChild(particle);
    
    // Anima dopo un frame
    requestAnimationFrame(() => {
      particle.classList.add("moving-in");
      particle.style.left = endX + "px";
      particle.style.top = endY + "px";
    });
    
    // Rimuovi particella quando arriva
    setTimeout(() => {
      particle.remove();
    }, 500);
  }, 50);
}

function pressButton(button, delta) {
  if (!gameStarted) return;
  
  button.classList.add("is-pressed");
  energyValue += delta;
  updateEnergyUI();
  
  // Controlla condizioni di game over
  checkGameOver();
  
  // Crea particella per il bottone socket (superiore): dal centro al bottone
  if (button === btnSocket) {
    createParticleToButton(button.parentElement);
  }
  
  // Crea particella per il bottone energy (inferiore): dal bottone al centro
  if (button === btnEnergy) {
    createParticleFromButton(button.parentElement);
  }
}

function releaseButton(button) {
  button.classList.remove("is-pressed");
}

function attachPressHandlers(button, delta) {
  button.addEventListener("pointerdown", (evt) => {
    evt.preventDefault();
    pressButton(button, delta);
  });

  button.addEventListener("pointerup", (evt) => {
    evt.preventDefault();
    releaseButton(button);
  });

  button.addEventListener("pointerleave", (evt) => {
    evt.preventDefault();
    releaseButton(button);
  });

  button.addEventListener("pointercancel", (evt) => {
    evt.preventDefault();
    releaseButton(button);
  });
}

// Socket diminuisce, Energy aumenta (step 0.05 per scala più fine)
attachPressHandlers(btnSocket, -0.05);
attachPressHandlers(btnEnergy, 0.05);

// Funzione countdown
function startCountdown() {
  const sequence = [
    { text: "3", duration: 900, animation: "animate-number" },
    { text: "2", duration: 900, animation: "animate-number" },
    { text: "1", duration: 900, animation: "animate-number" },
    { text: "GO", duration: 900, animation: "animate-go" },
  ];

  let currentIndex = 0;

  function showNext() {
    if (currentIndex >= sequence.length) {
      // Countdown finito - nascondi overlay e avvia gioco
      countdownOverlay.classList.add("hidden");
      setTimeout(() => {
        countdownOverlay.style.display = "none";
        startGame();
      }, 300);
      return;
    }

    const current = sequence[currentIndex];

    // Reset posizione e rimuovi animazione precedente
    countdownText.className = "countdown-text";
    countdownText.style.opacity = "0";
    countdownText.style.transform = "translateY(-30px)";

    // Cambio testo e avvio animazione dopo un breve delay
    setTimeout(() => {
      countdownText.textContent = current.text;
      countdownText.style.opacity = "";
      countdownText.style.transform = "";
      countdownText.className = "countdown-text " + current.animation;
    }, 50);

    currentIndex++;
    setTimeout(showNext, current.duration);
  }

  showNext();
}

function startGame() {
  gameStarted = true;
  lastTickTime = performance.now();
  requestAnimationFrame(tick);
}

updateTimerUI();
updateEnergyUI();

// Inizia dalla schermata intro
changeState(STATES.INTRO);
