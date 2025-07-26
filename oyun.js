const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const bulletsElement = document.getElementById('bullets');
const soundIcon = document.getElementById('soundIcon');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const finalTimeElement = document.getElementById('finalTime');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Ses dosyaları
const backgroundMusic = new Audio('assets/arkamuzik.mp3');
const shootSound = new Audio('assets/silah.mp3');
const explosionSound = new Audio('assets/patlama.mp3');
backgroundMusic.loop = true;
let isSoundOn = true;

// Görüntü yükleme
const playerImg = new Image();
playerImg.src = 'assets/oyuncu.png';
const enemyImgs = [
    new Image(), new Image(), new Image()
];
enemyImgs[0].src = 'assets/dusman1.png';
enemyImgs[1].src = 'assets/dusman2.png';
enemyImgs[2].src = 'assets/dusman3.png';
const collectibleImgs = [
    new Image(), new Image(), new Image(), new Image()
];
collectibleImgs[0].src = 'assets/topla1.png';
collectibleImgs[1].src = 'assets/topla2.png';
collectibleImgs[2].src = 'assets/topla3.png';
collectibleImgs[3].src = 'assets/topla4.png';
const bulletImg = new Image();
bulletImg.src = 'assets/mermi.png';

// Ödül efekti
let collectEffects = [];

// Oyun değişkenleri
let player = { 
    x: canvas.width / 2 - 45, 
    y: canvas.height - 100, 
    width: 90, 
    height: 90, 
    hitboxWidth: 80, 
    hitboxHeight: 80, 
    speed: 5 
};
let bullets = [];
let enemies = [];
let collectibles = [];
let score = 0;
let bulletCount = 10;
let maxBullets = 20;
let enemySpawnRate = 50;
let frameCount = 0;
let backgroundY = 0;
let gameTime = 0;
let isGameOver = false;
let isGameStarted = false;

// Kronometre
function updateTimer() {
    if (isGameStarted && !isGameOver) {
        gameTime++;
        let hours = Math.floor(gameTime / 3600);
        let minutes = Math.floor((gameTime % 3600) / 60);
        let seconds = gameTime % 60;
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}
setInterval(updateTimer, 1000);

// Klavye kontrolleri
let keys = {};
window.addEventListener('keydown', (e) => {
    if (isGameStarted && !isGameOver) {
        keys[e.code] = true;
        if (e.code === 'Space') {
            shootBullet();
        }
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Ses kontrolü
function toggleSound() {
    isSoundOn = !isSoundOn;
    soundIcon.src = isSoundOn ? 'assets/sesli.png' : 'assets/sessiz.png';
    if (isSoundOn) {
        backgroundMusic.play().catch((e) => console.log('Ses başlatılamadı:', e));
    } else {
        backgroundMusic.pause();
    }
}

// Mermi atışı
function shootBullet() {
    if (bulletCount > 0) {
        if (isSoundOn) {
            shootSound.currentTime = 0;
            shootSound.play().catch((e) => console.log('Mermi sesi çalınamadı:', e));
        }
        bullets.push({
            x: player.x + player.width / 2 - 12.5,
            y: player.y,
            width: 25,
            height: 50,
            hitboxWidth: 25,
            hitboxHeight: 50,
            speed: 7
        });
        bulletCount--;
        bulletsElement.textContent = bulletCount;
        console.log('Mermi atıldı, kalan:', bulletCount, 'konum:', bullets[bullets.length - 1]);
    }
}

// Düşman oluşturma
function spawnEnemy() {
    const enemyImg = enemyImgs[Math.floor(Math.random() * enemyImgs.length)];
    enemies.push({
        x: Math.random() * (canvas.width - 60),
        y: -60,
        width: 60,
        height: 60,
        hitboxWidth: 60,
        hitboxHeight: 60,
        speed: 2 + (score / 1500) + (gameTime / 1500),
        img: enemyImg
    });
    console.log('Düşman spawn edildi, toplam:', enemies.length);
}

// Ödül oluşturma
function spawnCollectible() {
    const collectibleImg = collectibleImgs[Math.floor(Math.random() * collectibleImgs.length)];
    collectibles.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        hitboxWidth: 40,
        hitboxHeight: 40,
        img: collectibleImg
    });
    console.log('Ödül spawn edildi, toplam:', collectibles.length);
}

// Çarpışma kontrolü
function checkCollision(rect1, rect2) {
    const r1x = rect1.x;
    const r1y = rect1.y;
    const r2x = rect2.x;
    const r2y = rect2.y;

    const collision = r1x < r2x + rect2.hitboxWidth &&
                     r1x + rect1.hitboxWidth > r2x &&
                     r1y < r2y + rect2.hitboxHeight &&
                     r1y + rect1.hitboxHeight > r2y;
    if (collision) console.log('Çarpışma algılandı:', rect1, rect2);
    return collision;
}

// Ödül efekti
function drawCollectEffects() {
    collectEffects.forEach((effect, index) => {
        effect.timer--;
        effect.y -= 1.5;
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = effect.timer > 30 ? 'yellow' : 'rgba(255, 255, 0, ' + (effect.timer / 30) + ')';
        ctx.fillText('+2', effect.x, effect.y);
        if (effect.timer <= 0) {
            collectEffects.splice(index, 1);
        }
    });
}

// Oyun sonu
function endGame() {
    isGameOver = true;
    backgroundMusic.pause();
    if (isSoundOn) {
        explosionSound.currentTime = 0;
        explosionSound.play().catch((e) => console.log('Patlama sesi çalınamadı:', e));
    }
    finalScoreElement.textContent = score;
    finalTimeElement.textContent = timerElement.textContent;
    gameOverScreen.classList.remove('hidden');
    console.log('Oyun bitti, skor:', score, 'süre:', timerElement.textContent);
}

// Oyunu yeniden başlat
function restartGame() {
    window.location.reload();
}

// Zorluk artışı (her 10 saniye)
function increaseDifficulty() {
    if (isGameStarted && !isGameOver) {
        if (gameTime % 600 === 0 && gameTime > 0) {
            enemySpawnRate = Math.max(20, enemySpawnRate - 5);
            console.log('Zorluk arttı, spawn oranı:', enemySpawnRate);
        }
    }
}

// Oyun döngüsü
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameStarted) {
        backgroundY += 2;
        if (backgroundY >= canvas.height) backgroundY = 0;
        const bgImg = new Image();
        bgImg.src = 'assets/arka.png';
        ctx.drawImage(bgImg, 0, backgroundY - canvas.height, canvas.width, canvas.height * 2);
        console.log('Başlangıç ekranı çizildi');
        requestAnimationFrame(gameLoop);
        return;
    }

    if (isGameOver) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Zorluk artışı
    increaseDifficulty();

    // Arka plan hareketi
    backgroundY += 2;
    if (backgroundY >= canvas.height) backgroundY = 0;
    const bgImg = new Image();
    bgImg.src = 'assets/arka.png';
    ctx.drawImage(bgImg, 0, backgroundY - canvas.height, canvas.width, canvas.height * 2);
    
    // Oyuncu hareketi
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    console.log('Oyuncu çizildi:', player.x, player.y);

    // Mermiler
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
        console.log('Mermi çizildi:', bullet.x, bullet.y);
        if (bullet.y < 0) {
            bullets.splice(i, 1);
            console.log('Mermi ekran dışına çıktı:', bullets.length);
            continue;
        }
    }

    // Düşmanlar
    if (frameCount % enemySpawnRate === 0) {
        spawnEnemy();
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
        console.log('Düşman çizildi:', enemy.x, enemy.y, 'hız:', enemy.speed);
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            console.log('Düşman ekran dışına çıktı:', enemies.length);
            continue;
        }

        // Mermi çarpışması
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[j], enemy)) {
                if (isSoundOn) {
                    explosionSound.currentTime = 0;
                    explosionSound.play().catch((e) => console.log('Patlama sesi çalınamadı:', e));
                }
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                console.log('Düşman vuruldu, skor:', score);
                break;
            }
        }

        // Oyuncu çarpışması
        if (checkCollision(player, enemy)) {
            console.log('Oyuncu-düşman çarpışması, oyun bitiyor...');
            endGame();
            break;
        }
    }

    // Ödüller
    if (frameCount % 150 === 0) {
        spawnCollectible();
    }
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        collectible.y += 2;
        ctx.drawImage(collectible.img, collectible.x, collectible.y, collectible.width, collectible.height);
        console.log('Ödül çizildi:', collectible.x, collectible.y);
        if (collectible.y > canvas.height) {
            collectibles.splice(i, 1);
            console.log('Ödül ekran dışına çıktı:', collectibles.length);
            continue;
        }
        if (checkCollision(player, collectible)) {
            collectibles.splice(i, 1);
            score += 10;
            if (bulletCount < maxBullets) {
                bulletCount = Math.min(maxBullets, bulletCount + 2);
                bulletsElement.textContent = bulletCount;
                collectEffects.push({
                    x: collectible.x,
                    y: collectible.y,
                    timer: 60
                });
                console.log('Ödül toplandı, mermi:', bulletCount, 'skor:', score);
            }
        }
    }

    // Ödül efektlerini çiz
    drawCollectEffects();

    // Skor ve mermi güncelleme
    scoreElement.textContent = score;
    bulletsElement.textContent = bulletCount;

    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Oyun başlatma
startButton.addEventListener('click', () => {
    console.log('Oyun başlatılıyor...');
    isGameStarted = true;
    startScreen.classList.add('hidden');
    if (isSoundOn) {
        backgroundMusic.play().catch((e) => console.log('Ses başlatılamadı:', e));
    }
});

// Ses başlatma için kullanıcı etkileşimi
canvas.addEventListener('click', () => {
    if (isSoundOn && backgroundMusic.paused && isGameStarted) {
        backgroundMusic.play().catch((e) => console.log('Ses başlatılamadı:', e));
    }
});

// Görüntü yükleme kontrolü
playerImg.onload = () => console.log('Oyuncu resmi yüklendi');
enemyImgs.forEach((img, i) => img.onload = () => console.log(`Düşman resmi ${i} yüklendi`));
collectibleImgs.forEach((img, i) => img.onload = () => console.log(`Ödül resmi ${i} yüklendi`));
bulletImg.onload = () => console.log('Mermi resmi yüklendi');
bulletImg.onerror = () => console.error('Mermi resmi yüklenemedi: assets/mermi.png');

// Oyun döngüsünü başlat
gameLoop();