let board;
let discsLeft;
let currentPlayer;
let gameState;
let numberToPlace;
let selectedDisc;
let turnSkippedMessage = "";
let winner = null;
const playerColors = ['red', 'blue', 'green', 'yellow'];
const winningLines = [];

// Initialize winning lines for rows, columns, and diagonals
for (let i = 0; i < 4; i++) {
  winningLines.push([[i, 0], [i, 1], [i, 2]]);
  winningLines.push([[i, 1], [i, 2], [i, 3]]);
  winningLines.push([[0, i], [1, i], [2, i]]);
  winningLines.push([[1, i], [2, i], [3, i]]);
}
winningLines.push([[0, 0], [1, 1], [2, 2]]);
winningLines.push([[1, 1], [2, 2], [3, 3]]);
winningLines.push([[0, 1], [1, 2], [2, 3]]);
winningLines.push([[1, 0], [2, 1], [3, 2]]);
winningLines.push([[0, 3], [1, 2], [2, 1]]);
winningLines.push([[1, 2], [2, 1], [3, 0]]);
winningLines.push([[0, 2], [1, 1], [2, 0]]);
winningLines.push([[1, 3], [2, 2], [3, 1]]);

function setup() {
  createCanvas(720, 420); // Expanded width by 100px to 720
  resetGame();
}

function resetGame() {
  board = Array(4).fill().map(() => Array(4).fill().map(() => []));
  discsLeft = [5, 5, 5, 5];
  currentPlayer = 0;
  gameState = "choosing_action";
  turnSkippedMessage = "";
  winner = null;
  checkAndHandleNoValidMoves();
}

function draw() {
  background(220);
  drawGrid();
  drawDiscs();
  drawControls();
}

function drawGrid() {
  stroke(0);
  for (let i = 0; i <= 4; i++) {
    line(10 + i * 100, 10, 10 + i * 100, 410); // Shifted by 10px for left/top border
    line(10, 10 + i * 100, 410, 10 + i * 100); // Bottom border at 410
  }
}

function drawDiscs() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let stack = board[i][j];
      for (let k = 0; k < stack.length; k++) {
        fill(playerColors[stack[k]]);
        ellipse(10 + i * 100 + 50, 10 + j * 100 + 80 - k * 30, 40, 40);
      }
    }
  }
}

function drawControls() {
  textSize(20);
  if (winner !== null) {
    fill(playerColors[winner]);
    text(`Congratulations, Player ${winner + 1} wins!`, 430, 30);
    fill(200);
    rect(430, 70, 140, 30);
    fill(0);
    text("Restart Game", 440, 90);
  } else {
    fill(playerColors[currentPlayer]);
    text(`Player ${currentPlayer + 1}'s turn`, 430, 30);
    if (turnSkippedMessage) {
      fill(255, 0, 0);
      text(turnSkippedMessage, 430, 150);
    } else if (gameState === "choosing_action") {
      fill(discsLeft[currentPlayer] > 0 ? 200 : 150);
      rect(430, 50, 140, 30);
      fill(0);
      text("Place Discs", 440, 70);
      fill(hasValidMoveDisc() ? 200 : 150);
      rect(430, 90, 140, 30);
      fill(0);
      text("Move Disc", 440, 110);
    } else if (gameState === "selecting_number_to_place") {
      let maxPlace = Math.min(3, discsLeft[currentPlayer]);
      for (let n = 1; n <= maxPlace; n++) {
        fill(200);
        rect(430, 50 + (n - 1) * 40, 50, 30);
        fill(0);
        text(n, 450, 70 + (n - 1) * 40);
      }
    } else if (gameState === "selecting_disc_to_move") {
      fill(0);
      text("Please select which stack", 430, 90);
      text("you want to move from", 430, 110);
    } else if (gameState === "selecting_move_destination") {
      fill(0);
      text("Please select where you", 430, 90);
      text("want to move the disc to", 430, 110);
    }
  }
}

function hasValidMoveDisc() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j].length > 0 && board[i][j][board[i][j].length - 1] === currentPlayer) {
        if (i > 0 && board[i - 1][j].length < 3 ||
            i < 3 && board[i + 1][j].length < 3 ||
            j > 0 && board[i][j - 1].length < 3 ||
            j < 3 && board[i][j + 1].length < 3) {
          return true;
        }
      }
    }
  }
  return false;
}

function hasValidMoves() {
  if (discsLeft[currentPlayer] > 0) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j].length < 3) {
          return true;
        }
      }
    }
  }
  return hasValidMoveDisc();
}

function checkAndHandleNoValidMoves() {
  if (!hasValidMoves()) {
    turnSkippedMessage = `Player ${currentPlayer + 1}'s turn skipped: no valid moves`;
    setTimeout(() => {
      currentPlayer = (currentPlayer + 1) % 4;
      let winnerCheck = checkWinner();
      if (winnerCheck !== null) {
        winner = winnerCheck;
      } else {
        turnSkippedMessage = "";
        checkAndHandleNoValidMoves();
      }
    }, 2000);
  } else {
    turnSkippedMessage = "";
  }
}

function mouseClicked() {
  if (winner !== null) {
    if (mouseX > 430 && mouseX < 570 && mouseY > 70 && mouseY < 100) {
      resetGame();
    }
  } else if (gameState === "choosing_action" && !turnSkippedMessage) {
    if (mouseX > 430 && mouseX < 570 && mouseY > 50 && mouseY < 80 && discsLeft[currentPlayer] > 0) {
      gameState = "selecting_number_to_place";
    } else if (mouseX > 430 && mouseX < 570 && mouseY > 90 && mouseY < 120 && hasValidMoveDisc()) {
      gameState = "selecting_disc_to_move";
    }
  } else if (gameState === "selecting_number_to_place") {
    let maxPlace = Math.min(3, discsLeft[currentPlayer]);
    for (let n = 1; n <= maxPlace; n++) {
      if (mouseX > 430 && mouseX < 480 && mouseY > 50 + (n - 1) * 40 && mouseY < 80 + (n - 1) * 40) {
        numberToPlace = n;
        gameState = "placing_discs";
      }
    }
  } else if (gameState === "placing_discs") {
    let i = floor((mouseX - 10) / 100);
    let j = floor((mouseY - 10) / 100);
    if (i >= 0 && i < 4 && j >= 0 && j < 4 && board[i][j].length + numberToPlace <= 3) {
      for (let k = 0; k < numberToPlace; k++) {
        board[i][j].push(currentPlayer);
      }
      discsLeft[currentPlayer] -= numberToPlace;
      handleTurnEnd();
    }
  } else if (gameState === "selecting_disc_to_move") {
    let i = floor((mouseX - 10) / 100);
    let j = floor((mouseY - 10) / 100);
    if (i >= 0 && i < 4 && j >= 0 && j < 4 && board[i][j].length > 0 && board[i][j][board[i][j].length - 1] === currentPlayer) {
      selectedDisc = [i, j];
      gameState = "selecting_move_destination";
    }
  } else if (gameState === "selecting_move_destination") {
    let i = floor((mouseX - 10) / 100);
    let j = floor((mouseY - 10) / 100);
    if (i >= 0 && i < 4 && j >= 0 && j < 4 && isAdjacent(selectedDisc[0], selectedDisc[1], i, j) && board[i][j].length < 3) {
      let disc = board[selectedDisc[0]][selectedDisc[1]].pop();
      board[i][j].push(disc);
      handleTurnEnd();
    }
  }
}

function isAdjacent(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;
}

function getTopDisc(x, y) {
  let stack = board[x][y];
  return stack.length > 0 ? stack[stack.length - 1] : null;
}

function checkWinner() {
  for (let player = 0; player < 4; player++) {
    for (let line of winningLines) {
      let [p1, p2, p3] = line;
      let top1 = getTopDisc(p1[0], p1[1]);
      let top2 = getTopDisc(p2[0], p2[1]);
      let top3 = getTopDisc(p3[0], p3[1]);
      if (top1 === player && top2 === player && top3 === player) {
        return player;
      }
    }
  }
  return null;
}

function handleTurnEnd() {
  let winnerCheck = checkWinner();
  if (winnerCheck !== null) {
    winner = winnerCheck;
  } else {
    currentPlayer = (currentPlayer + 1) % 4;
    gameState = "choosing_action";
    checkAndHandleNoValidMoves();
  }
} 