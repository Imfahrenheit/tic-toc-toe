function getTilesDOM() {
  return Array.from(document.querySelectorAll("td"));
}

const DOM = {
  tiles: getTilesDOM(),
  // x: "blue", // Image here
  // o: "green", // Image here
  alert: document.querySelector(".alert"),
  boardSizeInput: document.querySelector("#board-size-input"),
  submitBtn: document.querySelector("#submit-button"),
  board: document.querySelector("tbody"),

  continueBtn: document.querySelector("#continue-btn"),
  drawBtn: document.querySelector("#draw-btn"),
  resetBtn: document.querySelector("#reset-btn"),

  player: {
    x: {
      name: document.querySelector("#player-x-avatar"),
      score: document.querySelector("#player-x-score"),
      avatar: document.querySelector("#player-x-avatar"),
      avatarColorBtn: document.querySelector("#player-x-avatar-color-button")
      // avatarImgBtn: document.querySelector("#player-x-avatar-image-button"),
    },
    o: {
      name: document.querySelector("#player-o-avatar"),
      score: document.querySelector("#player-o-score"),
      avatar: document.querySelector("#player-o-avatar"),
      avatarColorBtn: document.querySelector("#player-o-avatar-color-button")
      // avatarImgBtn: document.querySelector("#player-o-avatar-image-button"),
    }
  }
};

function colorDiv(color) {
  return `<span
  style="
    background-color: ${color};
    height: 14px;
    width: 14px;
    display: inline-block;
  "
></span>`;
}

let state = {
  currentPlayer: "x",
  winner: false,
  player: {
    x: [],
    o: []
  },
  color: {
    x: "red",
    o: "yellow"
  },
  playerName: {
    x: colorDiv("red"), // colorDiv(this.color.x),
    o: colorDiv("yellow") // colorDiv(this.color.o),
  },
  point: {
    x: 0,
    o: 0
  },
  boardSize: 5,
  toWin: 5
};

function reverseCoordinate(token) {
  if (token === "x") {
    return "y";
  } else {
    return "x";
  }
}

function tileEmpty(tile) {
  if (
    // Photo case: !tile.innerHTML
    tile.style.backgroundColor === "" // Background color case
  ) {
    return true;
  } else {
    return false;
  }
}

function tileNotEmptyWarning() {
  DOM.alert.innerText = "This tile is not available";
}

function clearWarning() {
  DOM.alert.innerText = "";
}

function switchPlayer(prevPlayer) {
  state.currentPlayer = prevPlayer === "x" ? "o" : "x";
}

// Converts HTML ID to JavaScript Object for Tile Position
function tileJSPosition(tile) {
  const splitTile = tile.split(" ");
  return {
    x: Number(
      splitTile[0].split("").slice(1, splitTile[0].split("").length).join("")
    ),
    y: Number(
      splitTile[1].split("").slice(1, splitTile[1].split("").length).join("")
    )
  };
}

function addPointsToToken(tileObj) {
  winThroughXorY(tileObj, "x");
  winThroughXorY(tileObj, "y");
  winThroughDiagonalTopLeft(tileObj);
  winThroughDiagonalTopRight(tileObj);
}

function mutatePoints(aTile, tileObj, position) {
  aTile.point[position] += tileObj.point[position];
  tileObj.point[position] = aTile.point[position];
}

function winThroughXorY(tileObj, coordinate) {
  state.player[state.currentPlayer].forEach((aTile) => {
    if (
      aTile.position[reverseCoordinate(coordinate)] ===
        tileObj.position[reverseCoordinate(coordinate)] &&
      (aTile.position[coordinate] === tileObj.position[coordinate] + 1 ||
        aTile.position[coordinate] === tileObj.position[coordinate] - 1)
    ) {
      mutatePoints(aTile, tileObj, coordinate);
      if (checkWinner(tileObj.point[coordinate])) declareWinner();
    }
  });
}

function winThroughDiagonalTopLeft(tileObj) {
  state.player[state.currentPlayer].forEach((aTile) => {
    if (
      // Positive Case
      (tileObj.position["x"] === aTile.position["x"] + 1 &&
        tileObj.position["y"] === aTile.position["y"] + 1) ||
      // Negative Case
      (tileObj.position["x"] === aTile.position["x"] - 1 &&
        tileObj.position["y"] === aTile.position["y"] - 1)
    ) {
      mutatePoints(aTile, tileObj, "topLeft");
      if (checkWinner(tileObj.point["topLeft"])) declareWinner();
    }
  });
}

function winThroughDiagonalTopRight(tileObj) {
  state.player[state.currentPlayer].forEach((aTile) => {
    if (
      // Positive Case
      (tileObj.position["x"] === aTile.position["x"] + 1 &&
        tileObj.position["y"] === aTile.position["y"] - 1) ||
      // Negative Case
      (tileObj.position["x"] === aTile.position["x"] - 1 &&
        tileObj.position["y"] === aTile.position["y"] + 1)
    ) {
      mutatePoints(aTile, tileObj, "topRight");
      if (checkWinner(tileObj.point["topRight"])) declareWinner();
    }
  });
}

function checkWinner(point) {
  if (point >= state.toWin) {
    return true;
  }
  return false;
}

function checkDraw() {
  if (state.player.x.length + state.player.o.length === DOM.tiles.length) {
    return true;
  } else {
    return false;
  }
}

function declareDraw() {
  // Display UI
  DOM.alert.innerHTML = `<p>This is a draw</p>`;

  gameContinueReset();
}

function gamePlayOff() {
  DOM.tiles.forEach((tile) => {
    tile.removeEventListener("click", insertToken);
  });
}

function declareWinner() {
  // Display UI
  DOM.alert.innerHTML = `<p> Player 
    <b> ${state.currentPlayer} </b>
   has won</p>`;
  alert(` Player ${state.currentPlayer} has won`);
  // Add points to user in DB
  state.point[state.currentPlayer] += 1;

  // Change winning status
  state.winner = true;

  // Add points to the UI
  DOM.player[state.currentPlayer].score.innerText =
    state.point[state.currentPlayer];

  gameContinueReset();
}

function gameContinueReset() {
  // Reset the game
  DOM.continueBtn.disabled = false;

  // Turn off Game
  gamePlayOff();

  // Continue
  DOM.continueBtn.addEventListener("click", (e) => {
    e.preventDefault();
    reset();
  });
}

function gameResetAll() {
  gamePlayOff();

  // Clear DB
  state.point.x = 0;
  state.point.o = 0;

  // Clear UI
  DOM.player.x.score.innerText = state.point.x;
  DOM.player.o.score.innerText = state.point.o;

  reset();
}

function reset() {
  // Reset winner
  state.winner = false;

  // Clear the UI
  DOM.alert.innerHTML = "";
  DOM.tiles.forEach((tile) => {
    tile.style.backgroundColor = "";
  });

  // Clear the DB
  state.player.x = [];
  state.player.o = [];

  // Rerun the game
  main();
}

function addTokenToState(tileObj) {
  state.player[state.currentPlayer].push({
    position: tileObj,
    point: {
      // X and Y
      x: 1,
      y: 1,

      // Diagonal
      topLeft: 1,
      topRight: 1
    }
  });
}

function insertToken(event) {
  clearWarning();
  const tile = event.target;

  if (tileEmpty(tile)) {
    tile.style.backgroundColor = state.color[state.currentPlayer];
    //tile.innerHTML = `<span> ${state.currentPlayer} </span>`;

    // Parsing tile from HTML id to JavaScript object
    const tileObj = tileJSPosition(tile.id);

    // Adding tile to player's move array
    addTokenToState(tileObj);

    // Adding points to tile's point tracker and check winning condition
    addPointsToToken(
      state.player[state.currentPlayer][
        state.player[state.currentPlayer].length - 1
      ]
    );

    if (checkDraw() & !state.winner) declareDraw();

    switchPlayer(state.currentPlayer);
  } else {
    tileNotEmptyWarning();
  }
}

function setting() {
  gamePlayOff();

  const boardSizeNum = Number(DOM.boardSizeInput.value) || state.boardSize;
  if (!isNaN(boardSizeNum)) {
    state.boardSize = boardSizeNum;
    DOM.board.innerHTML = "";
    console.log(boardSizeNum);

    for (let i = 0; i < boardSizeNum; i++) {
      const boardRow = document.createElement("tr");
      boardRow.classList = "x" + (i + 1);
      for (let i1 = 0; i1 < boardSizeNum; i1++) {
        const boardCell = document.createElement("td");
        boardCell.id = boardRow.classList + " y" + (i1 + 1);
        boardRow.insertAdjacentElement("beforeend", boardCell);
      }
      DOM.board.insertAdjacentElement("beforeend", boardRow);
    }
  }
  DOM.tiles = getTilesDOM();

  const toWinNum = boardSizeNum;
  if (!isNaN(toWinNum)) {
    state.toWin = toWinNum;
  }

  main();
}

function main() {
  //setting();
  DOM.tiles.forEach((tile) => {
    tile.addEventListener("click", insertToken);
  });

  DOM.continueBtn.disabled = true;
}
setting();

main();

DOM.drawBtn.addEventListener("click", (e) => {
  e.preventDefault();
  gamePlayOff();
  reset();
});

DOM.submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  setting();
});

DOM.resetBtn.addEventListener("click", (e) => {
  e.preventDefault();
  gameResetAll();
});
