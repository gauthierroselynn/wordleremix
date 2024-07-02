import targetWords from "./targetWords.js";
import dictionary from "./dictionary.js";

const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");
const offsetFromDate = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
let targetWord = getRandomTargetWord();
const allWords = Array.from(new Set([...targetWords, ...dictionary]));

let isGameStarted = false; // to track if the game is in progress

startInteraction();

function startInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }

  if (e.target.matches("#new-game-button")) {
    startNewGame();
    return;
  }
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
}

document.getElementById("new-game-button").addEventListener("click", function () {
  startNewGame();
});

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");

  if (!allWords.includes(guess)) {
    showAlert("Not in word list");
    shakeTiles(activeTiles);
    return;
  }

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct";
        key.classList.add("correct");
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
      } else {
        tile.dataset.state = "wrong";
        key.classList.add("wrong");
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

function shakeTiles(tiles) {
  tiles.forEach(tile => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
}

function checkWinLose(guess, tiles) {
  if (guess === targetWord) {
    showAlert("You Win", 5000);
    danceTiles(tiles);
    stopInteraction();
    showNewGameButton();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0) {
    showAlert(targetWord.toUpperCase(), null);
    stopInteraction();
    showNewGameButton();
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance");
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}

function startNewGame() {
  // Reset Guess Grid
  const tiles = guessGrid.querySelectorAll(".tile");
  tiles.forEach(tile => {
    tile.textContent = "";
    delete tile.dataset.letter;
    delete tile.dataset.state;
    tile.classList.remove("shake", "dance", "flip");
  });

  // Reset Keyboard
  const keys = keyboard.querySelectorAll(".key");
  keys.forEach(key => {
    key.classList.remove("correct", "wrong", "wrong-location");
  });

  // Hide New Game Button
  hideNewGameButton();

  // Clear any existing alerts
  clearAlerts();

  // Generate New Target Word
  targetWord = getRandomTargetWord();
  isGameStarted = true; // Set game state to started
  startInteraction();
}

function getRandomTargetWord() {
  const randomIndex = Math.floor(Math.random() * targetWords.length);
  return targetWords[randomIndex];
}

function showNewGameButton() {
  const newGameButton = document.getElementById("new-game-button");
  newGameButton.style.display = "block";
}

function hideNewGameButton() {
  const newGameButton = document.getElementById("new-game-button");
  newGameButton.style.display = "none";
}

function clearAlerts() {
  alertContainer.innerHTML = "";
}