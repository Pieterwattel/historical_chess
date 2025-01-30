const centralData = {
  boardTilesObj: [],
  boardNodeList: [],
  lostPieces: [],
  selectedTile: "",
  availableTiles: {
    move: [],
    attack: [],
  },

  getTileObjXY: function (x, y) {
    let array = this.boardTilesObj;
    for (i = array.length; i > 0; i--) {
      if (array[i - 1].x == x && array[i - 1].y == y) {
        return array[i - 1];
        break;
      }
    }
  },

  getNodeXY: function (x, y) {
    this.boardTilesObj.forEach((element) => {
      if (element.x == x && element.y == y) {
        return element.node;
      }
    });
  },

  getPieceFromSymbolAndColor: function (nameString, player) {
    return (
      pieces.list.find(
        (piece) => piece.symbol === nameString && piece.player === player
      ) || null
    );
  },
};

const board = Object.create(centralData);
const pieces = Object.create(centralData);
const gamePlay = Object.create(centralData);
const movementLogic = Object.create(gamePlay);
const preparation = Object.create(centralData);

Object.assign(board, {
  boardEdgeNode: document.getElementById("boardEdge"),

  tileFactory: function (x, y, color) {
    let content = false;
    let available = false;
    return { x, y, color, content, available };
  },

  createTiles: function () {
    let x = 0;
    let y = 0;
    let i = 8;
    let color;
    do {
      //CREATE tile object through tileFactory
      // decide on the color of the tile
      if ((x == 0 && y == 0) || (x + y) % 2 == 0) {
        color = "lightTile";
      } else {
        color = "darkTile";
      }

      // create the tile object through tile factory
      let tileData = structuredClone(this.tileFactory(x, y, color));

      //create the tile node
      let tileNode = this.createTileNode(tileData);

      //save the tile object
      this.boardTilesObj.push(tileData);
      //create the value for the next tile object
      if (x < 7) {
        x++;
      } else if (y < 7) {
        x = 0;
        y++;
      } else {
        break;
      }
    } while (true);
  },

  createTileNode: function (tileObj) {
    let tileNode = document.createElement("div");
    tileNode.addEventListener("click", () => gamePlay.checkTileAction(tileObj));
    tileNode.classList.add(tileObj.color);
    tileObj.node = tileNode;
    return tileNode;
  },

  update: function () {
    //run through each tile object
    this.boardTilesObj.forEach((tileObj) => {
      //if the tile has content, place in tile node
      if (tileObj.content) {
        // check if there is anything standing on the tile
        tileObj.node.innerHTML = `<img src="${tileObj.content.image}" alt="image">`;
      }
      //if not, empty the tile
      else {
        tileObj.node.innerHTML = "";
      }
    });
  },

  appendTiles: function () {
    this.boardTilesObj.forEach((tileObj) => {
      this.boardEdgeNode.appendChild(tileObj.node);
    });
  },

  addHighlights: function () {
    let array = this.boardTilesObj;
    array.forEach((tile) => {
      if (tile.available == "move") {
        tile.node.classList.add("highlightMove");
      } else if (tile.available == "attack") {
        tile.node.classList.add("highlightAttack");
      }
    });
  },

  removeHighlights: function () {
    let array = this.boardTilesObj;
    array.forEach((tile) => {
      if (tile.available == "move") {
        tile.available = "";
        tile.node.classList.remove("highlightMove");
      } else if (tile.available == "attack") {
        tile.available = "";
        tile.node.classList.remove("highlightAttack");
      }
    });
  },
});

Object.assign(pieces, {
  constructor: function (name, image, player, movement) {
    return { name, image, player, movement };
  },

  list: [
    {
      name: "rook",
      symbol: "R",
      image: "./files/rookBlack.svg",
      player: "black",
      movement: {
        directions: [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        stepAmount: "continuous",
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },
    {
      name: "knight",
      symbol: "N",
      image: "./files/knightBlack.svg",
      player: "black",
      movement: {
        directions: [
          [1, -2],
          [2, -1],
          [2, 1],
          [1, 2],
          [-1, 2],
          [-2, 1],
          [-2, -1],
          [-1, -2],
        ],
        stepAmount: "1",
        jump: true,
        attack: "same as directions",
        firstMove: false,
        attack: "same as directions",
      },
    },

    {
      name: "bishop",
      symbol: "B",
      image: "./files/bishopBlack.svg",
      player: "black",
      movement: {
        directions: [
          [1, 1],
          [-1, 1],
          [-1, -1],
          [1, -1],
        ],
        stepAmount: "continuous",
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },

    {
      name: "king",
      symbol: "K",
      image: "./files/kingBlack.svg",
      player: "black",
      movement: {
        directions: [
          [1, 1],
          [0, 1],
          [-1, 1],
          [-1, 0],
          [-1, -1],
          [0, -1],
          [1, -1],
          [1, 0],
        ],
        stepAmount: 1,
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },

    {
      name: "queen",
      symbol: "Q",
      image: "./files/queenBlack.svg",
      player: "black",
      movement: {
        directions: [
          [1, 1],
          [0, 1],
          [-1, 1],
          [-1, 0],
          [-1, -1],
          [0, -1],
          [1, -1],
          [1, 0],
        ],
        stepAmount: "continuous",
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },

    {
      name: "pawn",
      symbol: "P",
      image: "./files/pawnBlack.svg",
      player: "black",
      movement: {
        directions: [[0, 1]],
        stepAmount: "1",
        jump: false,
        attack: {
          directions: [
            [1, 1],
            [-1, 1],
          ],
          stepAmount: "1",
        },
        firstMove: {
          directions: [[0, 1]],
          stepAmount: "2",
          jump: false,
        },
      },
    },

    // white pieces:
    {
      name: "rook",
      symbol: "r",
      image: "./files/rookWhite.svg",
      player: "white",
      movement: {
        directions: [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        stepAmount: "continuous",
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },
    {
      name: "knight",
      symbol: "N",
      image: "./files/knightWhite.svg",
      player: "white",
      movement: {
        directions: [
          [1, -2],
          [2, -1],
          [2, 1],
          [1, 2],
          [-1, 2],
          [-2, 1],
          [-2, -1],
          [-1, -2],
        ],
        stepAmount: "1",
        jump: true,
        attack: "same as directions",
        firstMove: false,
        attack: "same as directions",
      },
    },

    {
      name: "bishop",
      symbol: "B",
      image: "./files/bishopWhite.svg",
      player: "white",
      movement: {
        directions: [
          [1, 1],
          [-1, 1],
          [-1, -1],
          [1, -1],
        ],
        stepAmount: "continuous",
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },

    {
      name: "king",
      symbol: "K",
      image: "./files/kingWhite.svg",
      player: "white",
      movement: {
        directions: [
          [1, 1],
          [0, 1],
          [-1, 1],
          [-1, 0],
          [-1, -1],
          [0, -1],
          [1, -1],
          [1, 0],
        ],
        stepAmount: 1,
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },

    {
      name: "queen",
      symbol: "Q",
      image: "./files/queenWhite.svg",
      player: "white",
      movement: {
        directions: [
          [1, 1],
          [0, 1],
          [-1, 1],
          [-1, 0],
          [-1, -1],
          [0, -1],
          [1, -1],
          [1, 0],
        ],
        stepAmount: "continuous",
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },

    {
      name: "pawn",
      symbol: "P",
      image: "./files/pawnWhite.svg",
      player: "white",
      movement: {
        directions: [[0, -1]],
        stepAmount: "1",
        jump: false,
        attack: {
          directions: [
            [1, -1],
            [-1, -1],
          ],
          stepAmount: "1",
        },
        firstMove: {
          directions: [[0, -1]],
          stepAmount: "2",
          jump: false,
        },
      },
    },
  ],

  placement: [
    // 8a
    "R",
    // 8b
    "N",
    // 8c
    "B",
    // 8d
    "Q",
    // 8e
    "K",
    // 8f
    "B",
    // 8g
    "K",
    // 8h
    "R",
    // 7a
    "P",
    // 7b
    "P",
    // 7c
    "P",
    // 7d
    "P",
    // 7e
    "P",
    // 7f
    "P",
    // 7g
    "P",
    // 7h
    "P",

    // 2a
    "P",
    // 2b
    "P",
    // 2c
    "P",
    // 2d
    "P",
    // 2e
    "P",
    // 2f
    "P",
    // 2g
    "P",
    // 2h
    "P",
    // 1a
    "R",
    // 1b
    "N",
    // 1c
    "B",
    // 1d
    "Q",
    // 1e
    "K",
    // 1f
    "B",
    // 1g
    "N",
    // 1h
    "R",
  ],
});

Object.assign(gamePlay, {
  checkTileAction: function (clickedTileObj) {
    console.log(clickedTileObj.content);
    let selectedTile = this.selectedTile;
    // deselect the piece if clicked twice
    if (clickedTileObj == selectedTile) {
      this.deselectTile();
      return;
    }

    // this is to make sure that only the pieces of the persons turn can be moved
    if (!selectedTile && clickedTileObj.content.player == this.otherPlayer) {
      this.deselectTile();
      return;
    }

    if (
      // if there is not piece selected yet, this is the start of a move
      (!selectedTile && clickedTileObj.content) ||
      //also re-initiate the turn if this some other piece of the current playerTurn's
      clickedTileObj.content.player == this.playerTurn
    ) {
      this.startTurn(clickedTileObj);
    } else if (selectedTile && clickedTileObj.available) {
      this.endTurn(clickedTileObj);
    } else {
      this.deselectTile();
    }

    board.update();
  },

  startTurn: function (clickedTile) {
    this.selectedTile = clickedTile;
    board.removeHighlights();
    movementLogic.updateAvailableTiles(clickedTile);
    board.addHighlights();
  },

  endTurn: function (clickedTile) {
    //either move to the tile
    if (clickedTile.available == "move") {
      this.placePiece(this.selectedTile, clickedTile);
    } else if (
      //or attack the tile
      clickedTile.available == "attack"
    ) {
      this.doAttack(this.selectedTile, clickedTile);
    }
    centralData.selectedTile = "";
    board.removeHighlights();
  },

  deselectTile: function (tile) {
    this.selectedTile = "";
    board.removeHighlights();
  },

  placePiece: function (oldTile, newTile) {
    console.log("placing piece..");
    //important to make a new object, or else the hasMoved property is copied to other pieces (somehow)
    newTile.content = { ...oldTile.content, hasMoved: true };
    oldTile.content = "";
    newTile.content.hasMoved = true;
    this.selectedTile = "";
    this.closeTurn();
  },

  doAttack: function (oldTile, newTile) {
    this.lostPieces.push(newTile.content);
    this.placePiece(oldTile, newTile);
  },

  closeTurn: function () {
    switch (this.playerTurn) {
      case "white":
        this.playerTurn = "black";
        this.otherPlayer = "white";
        break;

      case "black":
        this.playerTurn = "white";
        this.otherPlayer = "black";
    }
  },

  playerTurn: "white",
  otherPlayer: "black",
});

Object.assign(movementLogic, {
  updateAvailableTiles: function (tileObj) {
    let piece = tileObj.content;
    let stepAmount = this.getStepAmount(piece);
    let movementData = this.getMovementData(piece);
    let attackData = this.getAttackData(piece);
    this.calcMovement(movementData, tileObj, stepAmount);
    this.calcAttack(attackData, tileObj, stepAmount);
  },

  getMovementData: function (piece) {
    if (Boolean(piece.movement.firstMove) && !piece.hasMoved) {
      return piece.movement.firstMove;
    } else {
      return piece.movement;
    }
  },

  getAttackData: function (piece) {
    if (typeof piece.movement.attack == "object") {
      return piece.movement.attack;
    } else {
      return piece.movement;
    }
  },

  getStepAmount(piece) {
    if (Boolean(piece.movement.firstMove) && !piece.hasMoved) {
      return piece.movement.firstMove.stepAmount;
    } else if (Number(piece.movement.stepAmount)) {
      return piece.movement.stepAmount;
    } else {
      return true;
    }
  },

  calcMovement: function (movementData, tileObj, stepAmount) {
    movementData.directions.forEach((direction) => {
      // make the currentTile equal tileObj, without linking the two
      currentTile = Object.assign({}, tileObj);
      // iterate through every direction that piece can move
      let directionX = direction[0];
      let directionY = direction[1];
      let i = stepAmount;
      //for as many steps as it can do
      for (; i; ) {
        //now follow that direction until something blocks the path
        let newX = currentTile.x + directionX;
        let newY = currentTile.y + directionY;
        //check if current tile is out of bounds
        if (newX > 7 || newX < 0 || newY > 7 || newY < 0) {
          currentTile = Object.assign({}, tileObj);
          break;
        }

        //new tile is at least existing, lets check it out further
        let availableTileObj = this.getTileObjXY(newX, newY);

        //if there is no a piece blocking the tile, make it available
        if (!availableTileObj.content) {
          availableTileObj.available = "move";
        } else if (!tileObj.content.movement.jump) {
          // or else if there is a piece, and the moving piece can't jump, end direction
          break;
        }

        //now initiate the checking of the new tile
        currentTile.x = newX;
        currentTile.y = newY;

        if (i === true) {
        } else {
          i--;
        }
      }
    });
  },

  calcAttack: function (movementData, tileObj, stepAmount) {
    movementData.directions.forEach((direction) => {
      // make the currentTile equal tileObj, without linking the two
      currentTile = Object.assign({}, tileObj);
      // iterate through every direction that piece can move
      let directionX = direction[0];
      let directionY = direction[1];
      let i = stepAmount;
      //for as many steps as it can do
      for (; i; ) {
        //now follow that direction until something blocks the path
        let newX = currentTile.x + directionX;
        let newY = currentTile.y + directionY;
        //check if current tile is out of bounds
        if (newX > 7 || newX < 0 || newY > 7 || newY < 0) {
          currentTile = Object.assign({}, tileObj);
          break;
        }

        //new tile is at least existing, lets check it out further
        let availableTileObj = this.getTileObjXY(newX, newY);
        console.log(availableTileObj.content.player);
        console.log(gamePlay.otherPlayer);

        if (!availableTileObj.content) {
          // if the tile is empty, just skip it and go check the next one!
        } else if (availableTileObj.content.player == gamePlay.otherPlayer) {
          //if there is an enemy piece blocking the tile, make it available, and end that direction
          availableTileObj.available = "attack";
          break;
        } else if (!tileObj.content.movement.jump) {
          // or else if there is a piece, and the moving piece can't jump, end direction
          break;
        }

        //now initaite the checking of the new tile
        currentTile.x = newX;
        currentTile.y = newY;

        if (i === true) {
        } else {
          i--;
        }
      }
    });
  },
});

Object.assign(preparation, {
  // Method to initialize the game
  initializeGame: function () {
    board.createTiles(); // Create the board tiles
    board.appendTiles();
    this.setupBoard(); // Call setupBoard on the preparation object
    board.update(); // Update/render the board
  },

  // Method to set up the board and pieces
  // iterates at equal pace through the tiles on the board, and
  // the order of pieces.placement, and connects the 2
  setupBoard: function () {
    let i = 0;
    //place black pieces
    do {
      if (pieces.placement[i]) {
        let currentPiece = this.getPieceFromSymbolAndColor(
          pieces.placement[i],
          "black"
        );
        let currentTile = this.boardTilesObj[i];
        currentTile.content = currentPiece;
      }
      i++;
    } while (i <= 15);

    //change board index to the start of the white pieces placement
    j = 48;
    //place white pieces
    do {
      if (pieces.placement[i]) {
        let currentPiece = this.getPieceFromSymbolAndColor(
          pieces.placement[i],
          "white"
        );
        let currentTile = this.boardTilesObj[j];
        currentTile.content = currentPiece;
      }
      i++;
      j++;
    } while (i <= 31);
  },
});

// Call initializeGame to start
let startGame = (function () {
  preparation.initializeGame(); // Ensure correct `this` context
})();
