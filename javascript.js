const centralData = {
  boardTilesObj: [],
  boardNodeList: [],
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

  getPieceFromNameAndColor: function (nameString, player) {
    return (
      pieces.list.find(
        (piece) => piece.name === nameString && piece.player === player
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
      let tileData = this.tileFactory(x, y, color);

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
    let hasMoved = false;
    return { name, image, player, movement, hasMoved };
  },

  list: [
    {
      name: "rook",
      image: "./files/rookBlack.svg",
      player: "black",
      movement: {
        directions: [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        stepAmount: 15,
        jump: false,
        attack: "same as directions",
        firstMove: false,
      },
    },
    {
      name: "pawn",
      image: "./files/pawnBlack.svg",
      player: "black",
      movement: {
        directions: [[0, 1]],
        stepAmount: "1",
        jump: false,
        attack: [
          [1, 1],
          [-1, 1],
        ],
        firstMove: {
          directions: [[0, 1]],
          stepAmount: "2",
          jump: false,
          attack: [
            [1, 1],
            [-1, 1],
          ],
        },
      },
    },
    /*
        {
        name: "",
        image: "./files/.svg",
        player: "",
        movement: {
          directions: [[],
          ],
          stepAmount: "continuous",
          jump: false,
          attack: "same as directions",
          firstMove: false,
          },
        },*/
    {
      name: "knight",
      image: (src = "./files/knightWhite.svg"),
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
  ],

  placement: [
    // 8a
    "",
    // 8b
    "",
    // 8c
    "",
    // 8d
    "",
    // 8e
    "pawn",
    // 8f
    "",
    // 8g
    "",
    // 8h
    "",
    // 7a
    "",
    // 7b
    "",
    // 7c
    "rook",
    // 7d
    "",
    // 7e
    "",
    // 7f
    "",
    // 7g
    "",
    // 7h
    "",

    // 2a
    "knight",
    // 2b
    "",
    // 2c
    "",
    // 2d
    "knight",
    // 2e
    "",
    // 2f
    "",
    // 2g
    "",
    // 2h
    "",
    // 1a
    "",
    // 1b
    "",
    // 1c
    "",
    // 1d
    "",
    // 1e
    "",
    // 1f
    "",
    // 1g
    "knight",
    // 1h
    "knight",
  ],
});

Object.assign(gamePlay, {
  checkTileAction: function (clickedTileObj) {
    console.log(`${clickedTileObj}`);
    let selectedTile = this.selectedTile;
    if (clickedTileObj == selectedTile) {
      console.log("if1");
      this.deselectTile();
      return;
    }
    if (
      // if there is not piece selected yet, this is the start of a move
      !selectedTile &&
      clickedTileObj.content &&
      //also re-initiate the turn if this some other piece of the current playerTurn's
      clickedTileObj.content.player == this.playerTurn
    ) {
      console.log("startturn");
      this.startTurn(clickedTileObj);
    } else if (selectedTile && clickedTileObj.available) {
      console.log("endTurn");
      this.endTurn(clickedTileObj);
    } else {
      console.log("lastif");
      this.deselectTile();
    }

    board.update();
  },

  startTurn: function (clickedTile) {
    this.selectedTile = clickedTile;
    console.log(this.selectedTile);
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
      this.attackTile(this.selectedTile, clickedTile);
    }
    centralData.selectedTile = "";
    board.removeHighlights();
  },
  /*
   */
  selectPiece: function (clickedTile) {
    //updateAvailableTiles()
  },

  deselectTile: function (tile) {
    this.selectedTile = "";
    board.removeHighlights();
  },

  placePiece: function (oldTile, newTile) {
    console.log("placePiece");
    newTile.content = oldTile.content;
    oldTile.content = "";
    newTile.content.hasMoved = true;
    this.selectedTile = "";
    this.closeTurn();
  },

  doAttack: function (tile) {
    /*
    let piece = tile.content;
    piece.hasMoved = true;
    */
  },

  closeTurn: function () {
    console.log(`${this.playerTurn}'s turn has ended`);
    switch (this.playerTurn) {
      case "white":
        this.playerTurn = "black";
        break;

      case "black":
        this.playerTurn = "white";
    }
  },

  playerTurn: "black",
});

Object.assign(movementLogic, {
  updateAvailableTiles: function (tileObj) {
    let node = tileObj.node;
    let piece = tileObj.content;
    movementData = this.getMovementData(piece);
    attackData = this.getAttackData(piece);
    let stepAmount = this.getStepAmount(piece);
    this.calcMovement(movementData, stepAmount, tileObj);
    //    this.availableTiles.attack = this.calcAttack(attackData, tile, stepAmount);
  },

  getMovementData: function (piece) {
    if (Boolean(piece.movement.firstMove) && !piece.hasMoved) {
      return piece.movement.firstMove;
    } else {
      return piece.movement;
    }
  },

  getAttackData: function (piece) {
    if (Array.isArray(piece.movement.attack)) {
      return piece.movement.attack;
    } else {
      return piece.movement.dirctions;
    }
  },

  getStepAmount(piece) {
    if (Number(piece.movement.stepAmount)) {
      return piece.movement.stepAmount;
    } else {
      return true;
    }
  },

  calcMovement: function (movementData, stepAmount, tileObj) {
    movementData.directions.forEach((direction) => {
      // make the currentTile equal tileObj, without linking the two
      currentTile = Object.assign({}, tileObj);
      // iterate through every direction that piece can move
      let directionX = direction[0];
      let directionY = direction[1];
      let i = movementData.stepAmount;
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
          console.log("if1");
          availableTileObj.available = "move";
        } else if (!tileObj.content.movement.jump) {
          console.log("if2");
          // or else if there is a piece, and the moving piece can't jump, end direction
          break;
        }

        //now initaite the checking of the new tile
        currentTile.x = newX;
        currentTile.y = newY;

        if (Number(i)) {
          i--;
        }
      }
    });
  },

  calcAttack: function (movementData, tile, stepAmount) {},
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
        let currentPiece = this.getPieceFromNameAndColor(
          pieces.placement[i],
          "black"
        );
        let currentTile = this.boardTilesObj[i];
        currentTile.content = currentPiece;
        console.log(`placing ${currentPiece.player} ${currentPiece.name}`);
      }
      i++;
    } while (i <= 15);

    //change board index to the start of the white pieces placement
    j = 48;
    //place white pieces
    do {
      if (pieces.placement[i]) {
        let currentPiece = this.getPieceFromNameAndColor(
          pieces.placement[i],
          "white"
        );
        let currentTile = this.boardTilesObj[j];
        currentTile.content = currentPiece;
        console.log(`placing ${currentPiece.player} ${currentPiece.name}`);
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
