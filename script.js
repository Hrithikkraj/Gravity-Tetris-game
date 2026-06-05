const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const levelEl = document.getElementById('level');
const gravityEl = document.getElementById('gravity-indicator');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');

let board, currentPiece, nextPiece, gravity, gameInterval;
let score = 0, highScore = 0, level = 1, totalLines = 0, tickSpeed = 500;
let isRunning = false;

// Initialize High Score from Local Storage on load
if (localStorage.getItem('gravityTetrisHighScore')) {
    highScore = parseInt(localStorage.getItem('gravityTetrisHighScore'));
    highScoreEl.textContent = highScore;
}

const SHAPES = [
  {color:'#00ffff', rotations:[[[0,1],[1,1],[2,1],[3,1]],[[2,0],[2,1],[2,2],[2,3]]]}, 
  {color:'#ffff00', rotations:[[[0,0],[1,0],[0,1],[1,1]]]}, 
  {color:'#00ff00', rotations:[[[1,0],[0,1],[1,1],[2,1]],[[1,0],[1,1],[2,1],[1,2]]]}, 
  {color:'#ff0055', rotations:[[[1,0],[2,0],[0,1],[1,1]],[[1,0],[1,1],[2,1],[2,2]]]}, 
  {color:'#0055ff', rotations:[[[0,0],[1,0],[1,1],[2,1]],[[2,0],[1,1],[2,1],[1,2]],[[0,1],[1,1],[2,1],[2,2]],[[1,0],[1,1],[1,2],[0,2]]]}, 
  {color:'#cc00ff', rotations:[[[0,0],[0,1],[1,1],[2,1]],[[1,0],[2,0],[1,1],[1,2]],[[0,1],[1,1],[2,1],[2,2]],[[1,0],[1,1],[1,2],[2,0]]]}, 
  {color:'#ffaa00', rotations:[[[2,0],[0,1],[1,1],[2,1]],[[1,0],[1,1],[1,2],[2,2]],[[0,1],[1,1],[2,1],[0,2]],[[1,0],[1,1],[1,2],[0,0]]]} 
];

function updateUI() { 
    scoreEl.textContent = score; 
    levelEl.textContent = level;
    highScoreEl.textContent = highScore;
}

function updateGravityUI() {
    const arrows = { 1: "⬇️ DOWN (S)", "-1": "⬆️ UP (W)" };
    const sides = { 1: "➡️ RIGHT (D)", "-1": "⬅️ LEFT (A)" };
    gravityEl.textContent = gravity.y !== 0 ? arrows[gravity.y] : sides[gravity.x];
}

function drawCell(context, x, y, color, isGhost = false) {
    const px = x * BLOCK, py = y * BLOCK;

    if (isGhost) {
        context.fillStyle = color + '22';
        context.fillRect(px, py, BLOCK, BLOCK);
        context.strokeStyle = color + '88';
        context.lineWidth = 2;
        context.strokeRect(px + 1, py + 1, BLOCK - 2, BLOCK - 2);
        return;
    }

    context.fillStyle = color;
    context.fillRect(px, py, BLOCK, BLOCK);

    context.fillStyle = 'rgba(255, 255, 255, 0.4)';
    context.beginPath(); context.moveTo(px, py); context.lineTo(px + BLOCK, py); context.lineTo(px + BLOCK - 4, py + 4); context.lineTo(px + 4, py + 4); context.fill();

    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.beginPath(); context.moveTo(px, py + BLOCK); context.lineTo(px + BLOCK, py + BLOCK); context.lineTo(px + BLOCK - 4, py + BLOCK - 4); context.lineTo(px + 4, py + BLOCK - 4); context.fill();

    context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    context.beginPath(); context.moveTo(px, py); context.lineTo(px, py + BLOCK); context.lineTo(px + 4, py + BLOCK - 4); context.lineTo(px + 4, py + 4); context.fill();

    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.beginPath(); context.moveTo(px + BLOCK, py); context.lineTo(px + BLOCK, py + BLOCK); context.lineTo(px + BLOCK - 4, py + BLOCK - 4); context.lineTo(px + BLOCK - 4, py + 4); context.fill();
    
    context.fillStyle = 'rgba(0,0,0,0.1)';
    context.fillRect(px + 4, py + 4, BLOCK - 8, BLOCK - 8);
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const cells = SHAPES[nextPiece.shape].rotations[nextPiece.rot];
    cells.forEach(([dx, dy]) => drawCell(nextCtx, dx + 0.5, dy + 1, nextPiece.color)); 
}

function getGhostPosition() {
    let ghost = { ...currentPiece };
    while (!collision(ghost.x + gravity.x, ghost.y + gravity.y, ghost.rot)) {
        ghost.x += gravity.x; ghost.y += gravity.y;
    }
    return ghost;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for(let i=0; i<=COLS; i++) { ctx.beginPath(); ctx.moveTo(i*BLOCK, 0); ctx.lineTo(i*BLOCK, canvas.height); ctx.stroke(); }
    for(let i=0; i<=ROWS; i++) { ctx.beginPath(); ctx.moveTo(0, i*BLOCK); ctx.lineTo(canvas.width, i*BLOCK); ctx.stroke(); }

    board.forEach((row, y) => row.forEach((cell, x) => { if (cell) drawCell(ctx, x, y, cell); }));

    if (currentPiece) {
        const ghost = getGhostPosition();
        SHAPES[ghost.shape].rotations[ghost.rot].forEach(([dx, dy]) => drawCell(ctx, ghost.x + dx, ghost.y + dy, currentPiece.color, true));
        SHAPES[currentPiece.shape].rotations[currentPiece.rot].forEach(([dx, dy]) => drawCell(ctx, currentPiece.x + dx, currentPiece.y + dy, currentPiece.color));
    }
}

function collision(x, y, rot) {
    return SHAPES[currentPiece.shape].rotations[rot].some(([dx, dy]) => {
        let nx = x + dx, ny = y + dy;
        return nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || board[ny][nx];
    });
}

function merge() {
    SHAPES[currentPiece.shape].rotations[currentPiece.rot].forEach(([dx, dy]) => {
        let x = currentPiece.x + dx, y = currentPiece.y + dy;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) board[y][x] = currentPiece.color;
    });
    score += 10;
    clearLines(); 
    updateUI(); 
    spawn();
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(c => c)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++; y++; 
        }
    }
    for (let x = COLS - 1; x >= 0; x--) {
        let colFull = true;
        for (let y = 0; y < ROWS; y++) { if (!board[y][x]) colFull = false; }
        if (colFull) {
            for (let y = 0; y < ROWS; y++) {
                board[y].splice(x, 1);
                board[y].splice(gravity.x === 1 ? 0 : COLS - 1, 0, 0);
            }
            linesCleared++; x++;
        }
    }
    
    if (linesCleared > 0) {
        score += (linesCleared * 100) * linesCleared;
        totalLines += linesCleared;
        
        // Level up logic (Every 10 lines)
        let newLevel = Math.floor(totalLines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            // Decrease interval time by 40ms per level, minimum cap of 100ms
            tickSpeed = Math.max(100, 500 - ((level - 1) * 40)); 
            clearInterval(gameInterval);
            gameInterval = setInterval(tick, tickSpeed);
        }
    }
}

function randomPiece() { return { shape: Math.floor(Math.random() * SHAPES.length), rot: 0 }; }

function spawn() {
    currentPiece = nextPiece || randomPiece();
    nextPiece = randomPiece();
    currentPiece.color = SHAPES[currentPiece.shape].color;
    currentPiece.x = Math.floor(COLS / 2) - 2;
    currentPiece.y = 0;
    nextPiece.color = SHAPES[nextPiece.shape].color;
    
    drawNextPiece();
    if (collision(currentPiece.x, currentPiece.y, currentPiece.rot)) gameOver();
}

function tick() {
    let nx = currentPiece.x + gravity.x, ny = currentPiece.y + gravity.y;
    if (!collision(nx, ny, currentPiece.rot)) { currentPiece.x = nx; currentPiece.y = ny; } 
    else merge();
    draw();
}

function drop() {
    let ghost = getGhostPosition();
    currentPiece.x = ghost.x; currentPiece.y = ghost.y;
    merge(); draw();
}

function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    gravity = { x: 0, y: 1 }; 
    score = 0; 
    level = 1;
    totalLines = 0;
    tickSpeed = 500; // Reset speed

    updateUI(); updateGravityUI();
    nextPiece = null; spawn();
    
    overlay.classList.remove("show");
    restartBtn.disabled = false;
    isRunning = true;
    
    if(gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(tick, tickSpeed);
}

function gameOver() {
    clearInterval(gameInterval);
    
    // Check and save High Score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('gravityTetrisHighScore', highScore);
        updateUI(); // Update UI to show new high score immediately
    }

    overlay.classList.add("show");
    overlayTitle.innerHTML = "SYSTEM<br>FAILURE";
    overlayText.textContent = `FINAL SCORE: ${score}`;
    startBtn.textContent = "REBOOT SYSTEM";
    isRunning = false;
}

document.addEventListener("keydown", e => {
    if (!isRunning) return;
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();

    switch (e.key) {
        case "ArrowLeft": if (!collision(currentPiece.x - 1, currentPiece.y, currentPiece.rot)) currentPiece.x--; break;
        case "ArrowRight": if (!collision(currentPiece.x + 1, currentPiece.y, currentPiece.rot)) currentPiece.x++; break;
        case "ArrowDown": if (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.rot)) currentPiece.y++; break;
        case "ArrowUp":
            let r = (currentPiece.rot + 1) % SHAPES[currentPiece.shape].rotations.length;
            if (!collision(currentPiece.x, currentPiece.y, r)) currentPiece.rot = r;
            else if (!collision(currentPiece.x - 1, currentPiece.y, r)) { currentPiece.x--; currentPiece.rot = r; }
            else if (!collision(currentPiece.x + 1, currentPiece.y, r)) { currentPiece.x++; currentPiece.rot = r; }
            break;
        case " ": drop(); break;
        case "w": case "W": gravity = { x: 0, y: -1 }; break;
        case "a": case "A": gravity = { x: -1, y: 0 }; break;
        case "s": case "S": gravity = { x: 0, y: 1 }; break;
        case "d": case "D": gravity = { x: 1, y: 0 }; break;
    }
    updateGravityUI(); draw();
});

startBtn.onclick = startGame;
restartBtn.onclick = startGame;