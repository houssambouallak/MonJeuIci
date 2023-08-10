// Définition des constantes pour les types de cellules sur la grille
const EMPTY = 0;     // Case vide
const PLAYER = 1;    // Le joueur
const MONSTER = 2;   // Monstre
const TREASURE = 3;  // Trésor
const WALL = 4;      // Mur

// Dimensions de la grille
const GRID_WIDTH = 25;   // Largeur de la grille
const GRID_HEIGHT = 15;  // Hauteur de la grille

// Variables de jeu
let grid = [];                 // Grille du jeu (tableau à 2 dimensions)
let playerX;                   // Position X du joueur sur la grille
let playerY;                   // Position Y du joueur sur la grille
let playerScore = document.getElementById('score');  // Élément HTML pour afficher le score du joueur
let treasuresCollected = 0;    // Nombre de trésors collectés par le joueur
let gameRunning = true;        // Variable pour indiquer si le jeu est en cours

// Fonction pour initialiser la grille du jeu
function initializeGrid() {
  // Initialisation de la grille avec des cellules vides
  grid = Array.from({ length: GRID_HEIGHT }, function() {
    return Array(GRID_WIDTH).fill(EMPTY);
  });  
  // Placer le joueur au centre de la grille
  playerX = Math.floor(GRID_WIDTH / 2);
  playerY = Math.floor(GRID_HEIGHT / 2);
  grid[playerY][playerX] = PLAYER;

  // Placer des monstres aléatoirement sur la grille
  for (let i = 0; i < 8; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (grid[y][x] !== EMPTY);
    grid[y][x] = MONSTER;
  }

  // Placer des trésors aléatoirement sur la grille
  for (let i = 0; i < 5; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (grid[y][x] !== EMPTY);
    grid[y][x] = TREASURE;
  }

  // Placer des murs aléatoirement sur la grille
  for (let i = 0; i < 70; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (grid[y][x] !== EMPTY);
    grid[y][x] = WALL;
  }
  
}

// Fonction pour afficher la grille sur la page HTML
function renderGrid() {
  const table = document.getElementById('game-grid');
  table.innerHTML = '';

  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row = document.createElement('tr');
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = document.createElement('td');
      switch (grid[y][x]) {
        case EMPTY:
          cell.setAttribute('type-element', 'empty');

          break;
        case PLAYER:
          
          cell.setAttribute('type-element', 'player');
          break;
        case MONSTER:
          cell.setAttribute('type-element', 'monster');
          break;
        case TREASURE:
          cell.setAttribute('type-element', 'treasure');
          break;
        case WALL:
          cell.setAttribute('type-element', 'wall');
          break;
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// Fonction pour déplacer les monstres sur la grille
function moveMonsters() {
  if (!gameRunning) return;

  // Tableau des directions possibles pour les monstres
  const directions = [
    { dx: -1, dy: 0 }, // gauche
    { dx: 1, dy: 0 },  // droite
    { dx: 0, dy: -1 }, // haut
    { dx: 0, dy: 1 }   // bas
  ];

  // Parcourir toute la grille pour déplacer les monstres
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y][x] === MONSTER) {
        // Choisir une direction aléatoire
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const newX = x + direction.dx;
        const newY = y + direction.dy;

        // Vérifier si le nouveau mouvement est valide et que la case est vide
        if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT && grid[newY][newX] === EMPTY) {
          grid[y][x] = EMPTY;   // Déplacer le monstre depuis l'ancienne position
          grid[newY][newX] = MONSTER;  // Déplacer le monstre vers la nouvelle position
        }
      }
    }
  }

  // Mettre à jour l'affichage de la grille
  renderGrid();
}

// Événements pour gérer les mouvements du joueur en utilisant les boutons de direction
document.getElementById('up-button').addEventListener('click', function() {
  movePlayer('up');
});

document.getElementById('left-button').addEventListener('click', function() {
  movePlayer('left');
});

document.getElementById('right-button').addEventListener('click', function() {
  movePlayer('right');
});

document.getElementById('down-button').addEventListener('click', function() {
  movePlayer('down');
});

// Fonction pour déplacer le joueur dans une direction donnée
function movePlayer(direction) {
    if (!gameRunning) return;

    let newX = playerX;
    let newY = playerY;

    switch (direction) {
        case 'left':
            newX--;
            break;
        case 'right':
            newX++;
            break;
        case 'up':
            newY--;
            break;
        case 'down':
            newY++;
            break;
    }

    // Vérifier si le nouveau mouvement est valide et que la case n'est pas un mur
    if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT) {
        if (grid[newY][newX] === MONSTER) {
            // Le joueur a été capturé par un monstre, le jeu se termine en défaite
            gameRunning = false;
            endGame(false);
        } else if (grid[newY][newX] === TREASURE) {
            // Le joueur a trouvé un trésor, le trésor disparaît de la grille
            grid[newY][newX] = PLAYER;
            grid[playerY][playerX] = EMPTY;
            playerX = newX;
            playerY = newY;
            tresor_sound();
            
            

            // Mise à jour de l'affichage de la grille après la collecte du trésor
            renderGrid();

            // Vérifier si tous les trésors ont été collectés
            treasuresCollected++;
            playerScore.textContent=treasuresCollected; //Affichage du score
            if (treasuresCollected === 5) {
                // Si tous les trésors ont été collectés, le jeu se termine en victoire
                gameRunning = false;
                endGame(true);
            }
        } else if (grid[newY][newX] !== WALL) {
            // Déplacer le joueur depuis l'ancienne position
            grid[playerY][playerX] = EMPTY;
            playerX = newX;
            playerY = newY;
            grid[playerY][playerX] = PLAYER;
            jump_sound();

            // Déplacer les monstres après le déplacement du joueur
            moveMonsters();
            
        }
    }
}


// Fonction pour terminer le jeu et afficher un message de fin (victoire ou défaite)
function endGame(isWin) {
    if (isWin) {
        // Redirect to gagne.html when the player wins
        window.location.href = "MonJeuIci/Gagne.html";
    } else {
      window.location.href = "MonJeuIci/perdu.html";
    }
}

// Fonction pour recommencer le jeu à zéro
function restartGame() {
    gameRunning = true;
    treasuresCollected = 0;
    initializeGrid();
    renderGrid();
    playerScore.textContent = treasuresCollected; // Update the score display to 0
  }

// Événement pour gérer les mouvements du joueur à l'aide des touches fléchées du clavier
document.addEventListener('keydown', function(event) {
  if (!gameRunning) return;

  switch (event.key) {
    case 'ArrowLeft':
      movePlayer('left');
      break;
    case 'ArrowRight':
      movePlayer('right');
      break;
    case 'ArrowUp':
      movePlayer('up');
      break;
    case 'ArrowDown':
      movePlayer('down');
      break;
  }
});

// Événement pour gérer le bouton de redémarrage du jeu
document.getElementById('restart-button').addEventListener('click', function() {
  restartGame();
});

// Fonction pour démarrer le jeu en initialisant la grille et en l'affichant
function startGame() {
  initializeGrid();
  renderGrid();
}



/* Audio background */
document.addEventListener('DOMContentLoaded', function() {
    const backgroundAudio = document.getElementById('backgroundAudio');
    backgroundAudio.volume=0.3;
    backgroundAudio.play();
  });
  

// Audio jump

  function jump_sound(jumpAudio) {
    const audioElement = document.getElementById('jumpAudio');
    audioElement.play()
      .catch(error => console.error('Erreur lors de la lecture audio:', error));
  }
// Audio Tresor

  function tresor_sound(tresorAudio) {
    const audioElement = document.getElementById('tresorAudio');
    audioElement.play()
      .catch(error => console.error('Erreur lors de la lecture audio:', error));
  }

  // Audio Gagne

  function winner_sound(winnerAudio) {
    const audioElement = document.getElementById('winnerAudio');
    audioElement.play()
  }




startGame();

