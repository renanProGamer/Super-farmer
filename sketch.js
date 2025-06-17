// Variáveis de áudio
let gameMusic;
let jumpSound;
let collectSound;
let gameOverSound;
let musicStarted = false; // Para controlar o início da música

let x = 30; // Posição X do personagem
let y = 340; // Posição Y do personagem
let groundY = 350; // Altura do chão
let gameStarted = false; // Variável para controlar o estado do jogo
let jumpSpeed = 0; // Velocidade do pulo
let gravity = 0.5; // Gravidade
let obstacles = []; // Array para armazenar múltiplos obstáculos
let foods = []; // Array para armazenar alimentos coletáveis
let obstacleSpeed = 5; // Velocidade do obstáculo
let gameOver = false; // Variável para controlar o estado de Game Over
let score = 0; // Pontuação do jogador
let highScore = 0; // Recorde de pontuação
let clouds = []; // Array para nuvens de fundo
let gameSpeed = 1; // Velocidade geral do jogo
let spawnRate = 2000; // Taxa de spawn de obstáculos (ms)
let foodSpawnRate = 3000; // Taxa de spawn de alimentos (ms)
let collectedFoods = 0; // Contador de alimentos coletados
let minObstacleGap = 300; // Espaçamento mínimo entre obstáculos
let lastObstacleTime = 0; // Tempo do último obstáculo criado

function preload() {
  gameMusic = loadSound(
    "Cartoon, Daniel Levi, Jéja - On & On (feat. Daniel Levi) [NCS Release].mp3"
  );
  jumpSound = loadSound("pixel-jump-319167.mp3");
  collectSound = loadSound("collect-points-190037.mp3");
  gameOverSound = loadSound("game-over-classic-206486.mp3");
}

class Obstacle {
  constructor() {
    this.x = width;
    this.y = groundY;
    this.type = random(["🌳", "🐄", "🚜"]); // Diferentes tipos de obstáculos
    this.width = 30;
    this.height = 30;
    this.passed = false; // Se o jogador já passou por este obstáculo
  }

  update() {
    this.x -= obstacleSpeed * gameSpeed;
  }

  display() {
    textSize(30);
    text(this.type, this.x, this.y);
  }

  hits(player) {
    return (
      this.x < player.x + 20 &&
      this.x + this.width > player.x &&
      player.y + 20 > this.y
    );
  }
}

class Food {
  constructor() {
    this.x = width;
    this.y = random(groundY - 100, groundY - 20); // Aparece acima do chão
    this.type = random(["🍎", "🌽", "🥕", "🍓"]); // Diferentes tipos de alimentos
    this.width = 25;
    this.height = 25;
    this.collected = false;
  }

  update() {
    this.x -= obstacleSpeed * gameSpeed * 0.8;
  }

  display() {
    textSize(25);
    text(this.type, this.x, this.y);
  }

  collects(player) {
    return (
      this.x < player.x + 20 &&
      this.x + this.width > player.x &&
      player.y < this.y + this.height &&
      player.y + 20 > this.y
    );
  }
}

class Cloud {
  constructor() {
    this.x = random(width, width + 100);
    this.y = random(50, 150);
    this.speed = random(0.5, 1.5);
    this.size = random(40, 80);
  }

  update() {
    this.x -= this.speed * gameSpeed;
    if (this.x < -this.size) {
      this.x = width + random(100);
      this.y = random(50, 150);
    }
  }

  display() {
    fill(255, 255, 255, 200);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size / 1.5);
    ellipse(
      this.x + this.size / 3,
      this.y - this.size / 6,
      this.size / 1.5,
      this.size / 2
    );
    ellipse(this.x - this.size / 3, this.y, this.size / 1.5, this.size / 2);
  }
}

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);

  // Configurações de áudio
  gameMusic.setVolume(0.3); // Volume mais baixo para música de fundo
  jumpSound.setVolume(0.5);
  collectSound.setVolume(0.7);
  gameOverSound.setVolume(0.5);

  // Cria nuvens iniciais
  for (let i = 0; i < 5; i++) {
    clouds.push(new Cloud());
    clouds[i].x = random(width);
  }
}

function draw() {
  background(135, 206, 235); // Céu azul

  // Desenha o sol
  fill("yellow");
  noStroke();
  ellipse(550, 50, 80, 80);

  // Desenha e atualiza nuvens
  for (let cloud of clouds) {
    cloud.update();
    cloud.display();
  }

  // Desenha o chão verde
  fill("green");
  noStroke();
  rect(0, groundY, width, height - groundY);

  if (!gameStarted) {
    drawStartScreen();
  } else if (gameOver) {
    drawGameOverScreen();
  } else {
    playGame();
  }
}

function drawStartScreen() {
  // Desenha o título
  fill("black");
  textFont("Pixel");
  textSize(48);
  text("Super Farmer", width / 2, height / 2 - 50);

  // Desenha o botão
  fill("yellow");
  textFont("Pixel");
  rect(width / 2 - 100, height / 2, 200, 60, 10);

  fill("black");
  textSize(24);
  text("Iniciar Jogo", width / 2, height / 2 + 30);

  // Instruções
  fill("black");
  textFont("Pixel");
  textSize(16);
  text("Pressione ESPAÇO para pular", width / 2, height - 80);
  text("Colete alimentos para ganhar pontos extras!", width / 2, height - 60);
}

function drawGameOverScreen() {
  // Fundo semi-transparente
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  // Texto de Game Over
  fill("red");
  textSize(48);
  text("Game Over", width / 2, height / 2 - 50);

  // Pontuação
  fill("white");
  textSize(24);
  text(`Pontuação: ${score}`, width / 2, height / 2);
  text(`Alimentos coletados: ${collectedFoods}`, width / 2, height / 2 + 30);
  text(`Recorde: ${highScore}`, width / 2, height / 2 + 60);

  // Botão para reiniciar
  fill("yellow");
  rect(width / 2 - 100, height / 2 + 120, 200, 60, 10);
  fill("black");
  textSize(24);
  text("Jogar Novamente", width / 2, height / 2 + 150);
}

function playGame() {
  // Atualiza a posição Y do personagem
  y += jumpSpeed;
  jumpSpeed += gravity;

  // Mantém o personagem no chão
  if (y >= groundY) {
    y = groundY;
    jumpSpeed = 0;
  }

  // Desenha o fazendeiro
  textSize(30);
  text("👨🏼‍🌾", x, y);

  // Gera obstáculos
  let now = millis();
  if (
    obstacles.length === 0 ||
    (now - lastObstacleTime > spawnRate / gameSpeed &&
      obstacles[obstacles.length - 1].x < width - minObstacleGap / gameSpeed)
  ) {
    obstacles.push(new Obstacle());
    lastObstacleTime = now;

    // Aumenta a dificuldade
    if (frameCount % 500 === 0) {
      gameSpeed += 0.05;
      spawnRate = max(1000, spawnRate - 50);
      foodSpawnRate = max(1500, foodSpawnRate - 50);
      minObstacleGap = max(200, minObstacleGap - 10);
    }
  }

  // Gera alimentos
  if (frameCount % floor(foodSpawnRate / gameSpeed) === 0 || foods.length < 1) {
    foods.push(new Food());
  }

  // Atualiza e desenha obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].display();

    // Verifica colisão
    if (obstacles[i].hits({ x: x, y: y })) {
      gameOver = true;
      highScore = max(score, highScore);
      gameMusic.stop();
      gameOverSound.play();
    }

    // Adiciona pontuação quando passa por um obstáculo
    if (!obstacles[i].passed && obstacles[i].x + 30 < x) {
      obstacles[i].passed = true;
      score++;
    }

    // Remove obstáculos que saíram da tela
    if (obstacles[i].x < -30) {
      obstacles.splice(i, 1);
    }
  }

  // Atualiza e desenha alimentos
  for (let i = foods.length - 1; i >= 0; i--) {
    foods[i].update();
    foods[i].display();

    // Verifica se o jogador coletou o alimento
    if (foods[i].collects({ x: x, y: y })) {
      foods[i].collected = true;
      score += 5;
      collectedFoods++;
      collectSound.play(); // Toca som de coleta
      fill(255, 255, 0);
      textSize(20);
      text("+5", foods[i].x, foods[i].y - 20);
    }

    // Remove alimentos coletados ou que saíram da tela
    if (foods[i].collected || foods[i].x < -30) {
      foods.splice(i, 1);
    }
  }

  // Mostra a pontuação
  fill("black");
  textSize(24);
  text(`Pontuação: ${score}`, 100, 30);
  text(`Alimentos: ${collectedFoods}`, 100, 60);
  text(`Velocidade: ${gameSpeed.toFixed(1)}x`, 100, 90);
}

function mousePressed() {
  // Verifica clique no botão de iniciar
  if (
    !gameStarted &&
    mouseX > width / 2 - 100 &&
    mouseX < width / 2 + 100 &&
    mouseY > height / 2 &&
    mouseY < height / 2 + 60
  ) {
    gameStarted = true;
    lastObstacleTime = millis();
    if (!musicStarted) {
      gameMusic.loop();
      musicStarted = true;
    }
  }

  // Verifica clique no botão de jogar novamente
  if (
    gameOver &&
    mouseX > width / 2 - 100 &&
    mouseX < width / 2 + 100 &&
    mouseY > height / 2 + 120 &&
    mouseY < height / 2 + 180
  ) {
    resetGame();
  }
}

function keyPressed() {
  // Pulo com barra de espaço
  if (gameStarted && !gameOver && key === " ") {
    if (y >= groundY) {
      jumpSpeed = -12;
      jumpSound.play(); // Toca som do pulo
    }
  }

  // Reinicia o jogo com Enter quando game over
  if (gameOver && keyCode === ENTER) {
    resetGame();
  }

  // Controle de música com tecla 'M'
  if (key === "m" || key === "M") {
    if (gameMusic.isPlaying()) {
      gameMusic.pause();
    } else {
      gameMusic.play();
    }
  }
}

function resetGame() {
  obstacles = [];
  foods = [];
  y = groundY;
  jumpSpeed = 0;
  gameOver = false;
  score = 0;
  collectedFoods = 0;
  gameSpeed = 1;
  spawnRate = 2000;
  foodSpawnRate = 3000;
  minObstacleGap = 300;
  lastObstacleTime = millis();
  gameMusic.loop(); // Reinicia a música
}
