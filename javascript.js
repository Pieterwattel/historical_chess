const centralData = {
  boardTilesObj: [],
  boardNodeList: [],
  selectedTile: "",
  availableTiles: {
    move: [],
    attack: [],
  },

  getTileObjXY: function (x, y) {
    this.boardTilesObj.forEach((element) => {
      if (element.x == x && element.y == y) {
        console.log(element);
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

  checkFunction: function () {
    console.log("this function has been called");
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
        color = "beige";
      } else {
        color = "rgb(58, 35, 35)";
      }
      // create the tile object through tile factory
      let tileData = this.tileFactory(x, y, color);
      //create the tile node
      let tileNode = this.createTileNode(tileData);
      //append the tile to the board
      this.boardEdgeNode.appendChild(tileNode);
      //save the tile data
      this.boardTilesObj.push(tileData);
      if (x < 7) {
        x++;
      } else if (y < 7) {
        x = 0;
        y++;
      } else {
        break;
      }
    } while (true);
    //save the tile node
    this.boardNodeList = this.boardEdgeNode.querySelectorAll("div");
  },

  createTileNode: function (tileObj) {
    let tileNode = document.createElement("div");
    tileNode.style.backgroundColor = tileObj.color;
    tileNode.addEventListener("click", () => gamePlay.checkTileAction(tileObj));
    return tileNode;
  },
  /*
  run: function () {
    this.checkFunction();
  },
  */
  update: function () {
    let i = 0;
    this.boardNodeList.forEach((node) => {
      //run through each tile node
      tileData = this.boardTilesObj[i];
      //edit tile node depending on the corresponding object data
      if (tileData.content) {
        // check if there is anything standing on the tile
        node.innerHTML = `<img src="${tileData.content.image}" alt="image">`;
      }
      this.boardEdgeNode.appendChild(node);
      i++;
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
        moves: [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
        stepAmount: "continuous",
        jump: false,
        attack: "moves",
        firstMove: false,
      },
    },
    /*
      {
        name: "",
        image: (src = ""),
        player: "",
        movement: "",
        moves: [[]],
        stepAmount: "",
        jump: false,
        attack: "moves",
        firstMove: false,
      },
    ]
      */
    {
      name: "",
      image: (src = ""),
      player: "",
      movement: "",
      moves: [[]],
      stepAmount: "",
      jump: false,
      attack: "moves",
      firstMove: false,
    },
  ],

  placement: [
    // 8a
    "rook",
    // 8b
    "",
    // 8c
    "",
    // 8d
    "",
    // 8e
    "",
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
    "",
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
    "",
    // 2b
    "",
    // 2c
    "",
    // 2d
    "",
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
    "",
    // 1h
    "",
  ],
});

Object.assign(gamePlay, {
  checkTileAction: function (clickedTile) {
    let selectedTile = this.selectedTile;
    //see if there was already a piece selected
    if (!selectedTile && clickedTile.content.player == this.playerTurn) {
      this.startMove(clickedTile);
    } else if (selectedTile /*&& clickedTile is available*/) {
      this.endMove(clickedTile);
    }
  },

  startMove: function (clickedTile) {
    this.selectPiece(clickedTile);
    movementLogic.updateAvailableTiles(clickedTile);
    board.update();
  },

  endMove: function (clickedTile) {
    console.log("endMove initiated");
    //if clickedTile is in available tiles
    //placePiece()

    //else if clickedTile is in attackTiles
    //doAttack()

    //else if clickedTile.content.player is the same as playerTurn, then do a startMove again.

    //else deselect the piece

    board.update();
  },

  selectPiece: function (clickedTile) {
    centralData.selectedTile = clickedTile;
    //updateAvailableTiles()
  },

  deselectPiece: function () {
    centralData.selectedTile = "";
    //updateAvailableTiles();
  },

  placePiece: function () {
    console.log("placing piece");
    let piece = tile.content;
    piece.hasMoved = true;
  },

  doAttack: function (tile) {
    console.log("doing attack");
    let piece = tile.content;
    piece.hasMoved = true;
  },

  playerTurn: "black",
});

Object.assign(movementLogic, {
  updateAvailableTiles: function () {
    let tile = centralData.selectedTile;
    let piece = tile.content;
    console.log(piece);
    movementData = this.getMovementData(piece);
    attackData = this.getAttackData(piece);
    let stepAmount = this.getStepAmount(piece);
    this.availableTiles.move = this.calcMovement(
      movementData,
      tile,
      stepAmount
    );
    this.availableTiles.attack = this.calcAttack(attackData, tile, stepAmount);
  },

  getMovementData: function (piece) {
    if (Array.isArray(piece.movement.firstMove) && !piece.movement.hasMoved) {
      console.log("getmovementdata() firstmove initiated");
      return piece.movement.firstMove;
    } else {
      return piece.movement.moves;
    }
  },

  getAttackData: function (piece) {
    if (Array.isArray(piece.movement.attack)) {
      return piece.movement.attack;
    } else {
      return piece.movement.moves;
    }
  },

  getStepAmount(piece) {
    if (Number(piece.movement.stepAmount)) {
      return piece.movement.stepAmount;
    } else {
      return true;
    }
  },

  calcMovement: function (movementData, tile, stepAmount) {
    console.log("calculating movement");
    let currentTile = tile;
    let newTile;
    let i = stepAmount;
    movementData.forEach((move) => {
      console.log("yes");
    });
  },

  calcAttack: function (movementData, tile, stepAmount) {
    console.log("calculating attack");
  },
});

Object.assign(preparation, {
  // Method to initialize the game
  initializeGame: function () {
    board.createTiles(); // Create the board tiles
    this.setupBoard(); // Call setupBoard on the preparation object
    board.update(); // Update/render the board
  },

  // Method to set up the board and pieces
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

    //change index to the start of the white pieces placement
    i = 48;
    //place black pieces
    do {
      if (pieces.placement[i]) {
        let currentPiece = this.getPieceFromNameAndColor(
          pieces.placement[i],
          "white"
        );
        let currentTile = this.boardTilesObj[i];
        currentTile.content = currentPiece;
        console.log(`placing ${currentPiece.player} ${currentPiece.name}`);
      }
      i++;
    } while (i <= 62);
  },
});

// Call initializeGame to start
let startGame = (function () {
  preparation.initializeGame(); // Ensure correct `this` context
})();
