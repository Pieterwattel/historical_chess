const centralData = {
  boardTilesArray: [],
  lostPieces: [],
  selectedTile: "",
  availableTiles: {
    move: [],
    attack: [],
  },

  blackCiv: "standard",
  whiteCiv: "standard",

  getTileObjXY: function (x, y) {
    let array = this.boardTilesArray;
    for (i = array.length; i > 0; i--) {
      if (array[i - 1].x == x && array[i - 1].y == y) {
        return array[i - 1] ? array[i - 1] : undefined;
      }
    }
  },

  getPieceFromSymbolAndColor: function (nameString, player) {
    return (
      pieces.list.find(
        (piece) => piece.symbol === nameString && piece.player === player
      ) || null
    );
  },

  history: {
    startPlacement: {},
    moves: [],
  },

  getMoveData: function (index) {
    let move = this.history.moves[index];
    let moveNum = index + 1;
    let player = moveNum % 2 == 0 ? "black" : "white";
    let startTile = this.getTileObjXY(move[1][0], move[1][1]);
    let endTile = this.getTileObjXY(move[2][0], move[2][1]);
    let piece = this.getPieceFromSymbolAndColor(move[0], player);
    return { moveNum, player, startTile, endTile, piece };
  },

  addMoveToHistory: function (oldTile, newTile) {
    let newMove = [];
    let symbol = newTile.content.symbol;
    let oldCoor = [oldTile.x, oldTile.y];
    let newCoor = [newTile.x, newTile.y];
    this.history.moves.push([symbol, oldCoor, newCoor]);
  },

  get previousMoveData() {
    return this.history.moves[this.history.moves.length - 1];
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
      this.boardTilesArray.push(tileData);
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
    this.boardTilesArray.forEach((tileObj) => {
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
    this.boardTilesArray.forEach((tileObj) => {
      this.boardEdgeNode.appendChild(tileObj.node);
    });
  },

  addHighlights: function () {
    let array = this.boardTilesArray;
    array.forEach((tile) => {
      if (tile.available == "move") {
        tile.node.classList.add("highlightMove");
      } else if (tile.available == "attack") {
        tile.node.classList.add("highlightAttack");
      }
    });
  },

  removeHighlights: function () {
    let array = this.boardTilesArray;
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
    //black pieces
    //rook
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
    //knight
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
    //bishop
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
    //king
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
    //queen
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
    //pawn
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

    // white pieces
    //rook
    {
      name: "rook",
      symbol: "R",
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
    //knight
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
    //bishop
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
    //king
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
    //queen
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
    //pawn
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

  placement: {
    standard: "RNBQKBNRPPPPPPPP", // Classic chess setup
    /*
    mongols: "NNNKKNNNPNPNPNPN", // Nomadic cavalry dominance
    romans: "RNRKKRNRPPPBBPPP", // Legion-based symmetry
    aztecs: " PQQQQP   PPPP  ", // Ritualistic battle lines
    french: " NQBBQN   P  P  ", // Bishop-heavy strategy
    sparta: " BQQKQB  PPPPPP", // Strong phalanx formation

    vikings: "RBBKBBRPPPPPPPP", // Shield wall, heavy frontline
    samurai: " NNQKQNNPPPPPPPP", // Honor-based cavalry
    egyptians: "QQBBKBBQQPPPPPP ", // Pharaoh & divine influence
    persians: "RNQKQNR PPPPPPPP", // Strategic, cavalry-driven
    byzantines: "BNRKQRNBPPPPPPPP", // Eastern-Western hybrid
    zulu: " NNKKNN PPPPPPPP", // Agile, fast-moving warriors
    ottomans: "RNBKQBNRPPPPPPPP", // Elite Janissary focus
    celts: "NQBBQNNPPPPPPPP", // Guerrilla tactics, druidic power
    chinese: "BBQKQBBPPPPPPPP", // Strategic elephants, rigid lines

    napoleon: " R B K Q B R PPPP ", // Artillery + disciplined army
    huns: "NNNNNNNN PPPPPP ", // Pure cavalry, fast attacks
    mayans: " P K P  QQQQQQ ", // Ritualistic center control
    crusaders: "R KQK  R  PPPP  ", // Heavy knight-based force
    templars: "  K Q K R RPPP  ", // Religious and militaristic
    ww1: "PPPPPPPPPPPPPPPP", // Trench warfare, symmetrical
    pirates: "    QK   RRRPPP ", // Ship formations, chaotic
    redcoats: " RNKQKNR PPPPPP  ", // British line infantry
    mongol_horde: "NNKKNNNN PPPPPP ", // Pure mounted archery dominance
    spartacus: "   KQQQ   PPPPPP ", // Slave uprising, sudden power
    attila: " NNQKQNN PPPPPPPP ", // Unpredictable barbarian charge
    carthage: "  R QKQ R PPPPP  ", // Elephants & naval strategy
    normans: " RNKQBNR PPPPPPPP ", // Knight-based feudal power
    holy_roman: "B KQK  B  PPPP  ", // Church & state influence
    cossacks: "NN KQ NN  PPPP  ", // Highly mobile raiders
    ragnarok: "QQ K  QQ  PPPP  ", // Norse myth, end-of-days chaos*/
  },

  update: function (oldTile, newTile) {
    //update amount of moves
    if (!newTile.content.hasMoved) {
      newTile.content.hasMoved = 1;
    } else {
      newTile.content.hasMoved += 1;
    }
  },
});

Object.assign(gamePlay, {
  checkTileAction: function (clickedTileObj) {
    //console.log(clickedTileObj);
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
      // if there is no piece selected yet, this is the start of a move
      (!selectedTile && clickedTileObj.content) ||
      //also re-initiate the turn if this some other piece of the current playerTurn's
      clickedTileObj?.content?.player == this.playerTurn
    ) {
      this.startTurn(clickedTileObj);
    } else if (selectedTile && clickedTileObj.available) {
      this.endTurn(clickedTileObj);
    } else {
      this.deselectTile();
    }

    board.update();
  },

  //1st part of a turn, what happens when a piece gets selected
  startTurn: function (clickedTile) {
    this.selectedTile = clickedTile;
    board.removeHighlights();
    movementLogic.updateAvailableTiles(clickedTile);
    board.addHighlights();
    this.additions.checkSpecialStartEvent(clickedTile);
  },

  //2d part of turn, everything that happens when a piece is selected, and being placed
  endTurn: function (clickedTile) {
    let oldTile = this.selectedTile;
    let newTile = clickedTile;
    //either move to the tile
    if (newTile.available == "move") {
      this.placePiece(oldTile, newTile);
    } else if (
      //or attack the tile
      newTile.available == "attack"
    ) {
      this.doAttack(oldTile, newTile);
      this.placePiece(oldTile, newTile);
    }
    pieces.update(oldTile, newTile);
    this.addMoveToHistory(oldTile, newTile);
    oldTile.content = "";
    centralData.selectedTile = "";
    board.removeHighlights();

    //save the move in history of moves
    //   history.moves.push("aa");
  },

  placePiece: function (oldTile, newTile) {
    //important to make a new object, or else the hasMoved property is copied to other pieces (somehow)
    this.additions.checkSpecialPlacementEvent(oldTile, newTile);
    newTile.content = {
      ...oldTile.content,
    };
    this.switchTurn();
  },

  doAttack: function (oldTile, newTile) {
    this.additions.checkSpecialAttackEvent(oldTile, newTile);
    this.lostPieces.push(newTile.content);
    newTile.content = "";
  },

  deselectTile: function (tile) {
    this.selectedTile = "";
    board.removeHighlights();
  },

  switchTurn: function () {
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

  additions: {
    checkSpecialStartEvent: function (clickedTile) {
      //check if there is an en passant available
      let tileX = clickedTile.x;
      let tileY = clickedTile.y;
      let leftXTile = centralData.getTileObjXY(tileX - 1, tileY);
      let rightXTile = centralData.getTileObjXY(tileX + 1, tileY);
      console.log(centralData.previousMoveData);
    },

    checkSpecialPlacementEvent: function (oldTile, newTile) {
      console.log("checkSpecialPlacementEvent");
    },

    checkSpecialAttackEvent: function (oldTile, newTile) {
      console.log("checkSpeciaAttackEvent");
    },
  },

  playerTurn: "white",
  otherPlayer: "black",
});

Object.assign(movementLogic, {
  updateAvailableTiles: function (tileObj) {
    let piece = tileObj.content;
    let stepAmountMv = this.getStepAmountMv(piece);
    let stepAmountAtk = this.getStepAmountAtk(piece);
    let movementData = this.getMovementData(piece);
    let attackData = this.getAttackData(piece);
    this.calcMovement(movementData, tileObj, stepAmountMv);
    this.calcAttack(attackData, tileObj, stepAmountAtk);
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

  getStepAmountMv: function (piece) {
    if (Boolean(piece.movement.firstMove) && !piece.hasMoved) {
      return piece.movement.firstMove.stepAmount;
    } else if (Number(piece.movement.stepAmount)) {
      return piece.movement.stepAmount;
    } else {
      return true;
    }
  },

  getStepAmountAtk: function (piece) {
    return !piece.hasMoved && piece.movement.firstMove?.attack?.stepAmount
      ? piece.movement.firstMove.attack.stepAmount
      : Number(piece.movement.stepAmount) || true;
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
    board.createTiles();
    board.appendTiles();
    /*
    let blackCiv = centralData.blackCiv;
    let whiteCiv = centralData.whiteCiv;
    this.setupBoard(pieces.placement[blackCiv], pieces.placement[whiteCiv]);
    */
    let civs = Object.keys(pieces.placement);
    let randCiv1 = civs[Math.floor(Math.random() * civs.length)];
    let randCiv2 = civs[Math.floor(Math.random() * civs.length)];
    console.log(randCiv1);
    console.log(randCiv2);

    this.setupBoard(pieces.placement[randCiv1], pieces.placement[randCiv2]);

    // Call setupBoard on the preparation object
    board.update(); // Update the board

    this.history.startPlacement = {
      black: pieces.placement[this.blackCiv],
      white: pieces.placement[this.whiteCiv],
    };
  },

  // Method to set up the board and pieces
  // iterates at equal pace through the tiles on the board, and
  // the order of pieces.placement, and connects the 2
  setupBoard: function (blackSetup, whiteSetup) {
    //setup black pieces
    let i = 0;
    let t = 0;
    while (i < 16) {
      let symbol = blackSetup.at(i);
      if (symbol != " ") {
        let currentPiece = this.getPieceFromSymbolAndColor(symbol, "black");
        let currentTile = this.boardTilesArray[t];
        currentTile.content = currentPiece;
      }
      i++;
      t++;
    }

    //setup white pieces
    i = 0;
    t = 63;
    while (i < 16) {
      let symbol = whiteSetup.at(i);
      if (symbol != " ") {
        let currentPiece = this.getPieceFromSymbolAndColor(symbol, "white");
        let currentTile = this.boardTilesArray[t];
        currentTile.content = currentPiece;
      }
      i++;
      t--;
    }
  },
});

// Call initializeGame to start
let startGame = (function () {
  preparation.initializeGame(); // Ensure correct `this` context
  // doTimeout();
})();

let i = 0;
let active = false;
let speed = 40;
const toggleAutoMove = document.getElementById("stopGame");
toggleAutoMove.addEventListener("click", () => {
  if (!active) {
    active = true;
    console.log("yes2");
    callTimeout();
  } else {
    active = false;
    console.log("yes1");
  }
});

function callTimeout() {
  if (active) {
    doTimeout();
  }
}

function doTimeout() {
  setTimeout(() => {
    console.log(i++);
    callTimeout();
    makeMove(gamePlay.playerTurn);
  }, speed);
}

function makeMove(player) {
  let boardArray = centralData.boardTilesArray;
  let availableArray = [];
  let foundPiece = false;
  for (; Boolean(foundPiece) == false; ) {
    let randIndex = Math.floor(Math.random() * 64);
    if (boardArray[randIndex].content.player == player) {
      foundPiece = boardArray[randIndex];
      gamePlay.checkTileAction(foundPiece);
      centralData.boardTilesArray.forEach((element) => {
        if (Boolean(element.available)) {
          availableArray.push(element);
        }
      });
      let randomTileIndex;
      if (availableArray.length != 0) {
        randomTileIndex = Math.floor(Math.random() * availableArray.length);
      } else {
        makeMove(player);
      }
      gamePlay.checkTileAction(availableArray[randomTileIndex]);
    }
  }
}
