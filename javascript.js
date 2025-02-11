const centralData = {
  boardTilesArray: [],
  lostPieces: [],
  selectedTile: "",
  availableTiles: [],
  boardSaveStates: [],
  blackCiv: "",
  whiteCiv: "",
  blackCivSetup: "",
  whiteCivSetup: "",
  civsTop: document.getElementById("civsTop"),
  civsBottom: document.getElementById("civsBottom"),
  blackCivDisplay: document.getElementById("blackCivDisplay"),
  whiteCivDisplay: document.getElementById("whiteCivDisplay"),

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
    let index = this.history.moves.length - 1;
    return index >= 0 ? this.getMoveData(index) : null;
  },

  saveBoardState: function (boardArray) {
    this.boardSaveStates.push(JSON.parse(JSON.stringify(boardArray)));
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
    tileNode.addEventListener("drag", () => gamePlay.checkTileAction(tileObj));
    tileNode.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    tileNode.addEventListener("drop", (e) => {
      e.preventDefault();
      gamePlay.checkTileAction(tileObj);
    });
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
        let img = document.createElement("img");
        img.src = tileObj.content.image;
        img.alt = `${tileObj.content.player} ${tileObj.content.name}`;
        img.setAttribute("draggable", "true");
        tileObj.node.innerHTML = "";
        tileObj.node.appendChild(img);
      }
      //if not, empty the tile
      else {
        tileObj.node.innerHTML = "";
      }
      //if the tileObj does not say "move" or "attack", remove those classes
      if (tileObj.node.classList.contains("highlightMove")) {
        tileObj.node.classList.remove("highlightMove");
      } else if (tileObj.node.classList.contains("highlightAttack")) {
        tileObj.node.classList.remove("highlightAttack");
      }
    });
    this.addHighlights();
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
        stepAmount: 10,
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
        stepAmount: 10,
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
        stepAmount: 10,
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
        stepAmount: 1,
        jump: false,
        attack: {
          directions: [
            [1, 1],
            [-1, 1],
          ],
          stepAmount: 1,
        },
        firstMove: {
          directions: [[0, 1]],
          stepAmount: 2,
          jump: false,
        },
      },
    },
    //zebra
    {
      name: "zebra",
      symbol: "z",
      image: "./files/zebraBlack.svg",
      player: "black",
      movement: {
        directions: [
          [1, -3],
          [3, -1],
          [3, 1],
          [1, 3],
          [-1, 3],
          [-3, 1],
          [-3, -1],
          [-1, -3],
        ],
        stepAmount: 1,
        jump: true,
        attack: "same as directions",
        firstMove: false,
        attack: "same as directions",
      },
    },
    //elephant
    {
      name: "elephant",
      symbol: "e",
      image: "./files/elephantBlack.svg",
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
        attack: {
          directions: 0,
        },
        firstMove: false,
      },
    },
    //bomb
    {
      name: "bomb",
      symbol: "b",
      image: "./files/bombBlack.svg",
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
    //cannon
    {
      name: "cannon",
      symbol: "c",
      image: "./files/cannonBlack.svg",
      player: "black",
      movement: {
        directions: [
          [-1, 0],
          [1, 0],
        ],
        stepAmount: 1,
        jump: false,
        attack: {
          directions: [[0, 1]],
          stepAmount: 10,
        },
        firstMove: false,
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
        stepAmount: 10,
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
        stepAmount: 1,
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
        stepAmount: 10,
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
        stepAmount: 10,
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
        stepAmount: 1,
        jump: false,
        attack: {
          directions: [
            [1, -1],
            [-1, -1],
          ],
          stepAmount: 1,
        },
        firstMove: {
          directions: [[0, -1]],
          stepAmount: 2,
          jump: false,
        },
      },
    },

    //zebra
    {
      name: "zebra",
      symbol: "z",
      image: "./files/zebraWhite.svg",
      player: "white",
      movement: {
        directions: [
          [1, -3],
          [3, -1],
          [3, 1],
          [1, 3],
          [-1, 3],
          [-3, 1],
          [-3, -1],
          [-1, -3],
        ],
        stepAmount: 1,
        jump: true,
        attack: "same as directions",
        firstMove: false,
        attack: "same as directions",
      },
    },
    //elephant
    {
      name: "elephant",
      symbol: "e",
      image: "./files/elephantWhite.svg",
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
        attack: {
          directions: 0,
        },
        firstMove: false,
      },
    },
    //bomb
    {
      name: "bomb",
      symbol: "b",
      image: "./files/bombWhite.svg",
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
    //cannon
    {
      name: "cannon",
      symbol: "c",
      image: "./files/cannonWhite.svg",
      player: "white",
      movement: {
        directions: [
          [-1, 0],
          [1, 0],
        ],
        stepAmount: 1,
        jump: false,
        attack: {
          directions: [[0, -1]],
          stepAmount: 9,
        },
        firstMove: false,
      },
    },
  ],

  placement: {
    standard: "RNBQKBNRPPPPPPPP", // Classic chess setup
    america: "RNBbKBNRPPPPPPPP",

    france: " NQBBQN   P  P  ", // Bishop-heavy strategy
    india1: "PNBQKBNPPePPPPeP",
    india2: "PPPPbPPPePePPePe", // Trench warfare, symmetrical

    mongols: "zNNNKNNzNN PP NN", // Nomadic cavalry dominance
    romans: "RRPKKPRReePPPPee", // Legion-based symmetry
    aztecs: " PQKQQP   PPPP  ", // Ritualistic battle lines
    ottomans: "PBP  PBcRPPPPPPR",
    rome: "BccBKbBBPPPPPPPP",
    persia: "PzePRNPKPzePBNPe",
    china: "PBbKcbcP PPPPPP ",

    spreadOut1: "R B  B RN N  N N",
    spreadOut2: "B N  N BN B  B N",
    crusade: " KKKKKK PPPPPPPP",
    defensiveLine: "KPPPPPPKPPPPPPPP",
    animalKingdom: " NzzzzN  NeeeeN ",
    other1: " NcbzcN   NeeN ",
    other2: "cRQRc   PPPPP   ",
    other3: "R  bQ  R ePPPPe ",
  },

  update: function (oldTile, newTile) {
    if (!newTile.content.name) {
      newTile.content = "";
      return;
    }
    //update amount of moves
    if (!newTile.content.hasMoved) {
      newTile.content.hasMoved = 1;
    } else {
      newTile.content.hasMoved += 1;
    }
  },

  movementSoundArray: [
    "./files/sounds/1m.wav",
    "./files/sounds/2m.wav",
    "./files/sounds/3m.wav",
    "./files/sounds/4m.wav",
    "./files/sounds/5m.wav",
    "./files/sounds/6m.wav",
    "./files/sounds/7m.wav",
  ],

  attackSoundArray: [
    "./files/sounds/1a.wav",
    "./files/sounds/2a.wav",
    "./files/sounds/3a.wav",
    "./files/sounds/4a.wav",
    "./files/sounds/5a.wav",
  ],

  undoSoundArray: [
    "./files/sounds/1u.wav",
    "./files/sounds/2u.wav",
    "./files/sounds/3u.wav",
    "./files/sounds/4u.wav",
  ],

  previousAudio: "",
  prePreviousAudio: "",

  playMovementSound: function () {
    let audio = true;
    const audioIndex = Math.floor(
      Math.random() * this.movementSoundArray.length
    );

    audio = new Audio(this.movementSoundArray[audioIndex]);

    audio.play();
    this.prePreviousAudio = this.previousAudio;
    this.previousAudio = audio;
  },

  playAttackSound: function () {
    let audio = true;
    const audioIndex = Math.floor(Math.random() * this.attackSoundArray.length);

    audio = new Audio(this.attackSoundArray[audioIndex]);

    audio.play();
  },

  playUndoSound: function () {
    let audio = true;
    const audioIndex = Math.floor(Math.random() * this.undoSoundArray.length);

    audio = new Audio(this.undoSoundArray[audioIndex]);

    audio.play();
  },
});

Object.assign(gamePlay, {
  checkTileAction: function (clickedTileObj) {
    let selectedTile = this.selectedTile;
    // deselect the piece if clicked twice
    if (clickedTileObj == selectedTile) {
      this.deselectTile(clickedTileObj);
      return;
    }

    // this is to make sure that only the pieces of the persons turn can be moved
    if (!selectedTile && clickedTileObj.content.player != this.playerTurn) {
      this.deselectTile(clickedTileObj);
      return;
    }

    if (selectedTile && clickedTileObj.available) {
      this.endTurn(clickedTileObj);
    } else if (
      // if there is no piece selected yet, this is the start of a move
      (!selectedTile && clickedTileObj.content) ||
      //also re-initiate the turn if this some other piece of the current playerTurn's
      clickedTileObj?.content?.player == this.playerTurn
    ) {
      if (this.selectedTile) {
        this.deselectTile(this.selectedTile);
      }
      this.startTurn(clickedTileObj);
    } else {
      this.deselectTile(clickedTileObj);
    }

    board.update();
  },

  //1st part of a turn, what happens when a piece gets selected
  startTurn: function (clickedTile) {
    this.selectedTile = clickedTile;
    board.removeHighlights();
    this.additions.checkSpecialStartEvent(clickedTile);
    movementLogic.updateAvailableTiles(clickedTile);
    board.addHighlights();
  },

  //2d part of turn, everything that happens when a piece is selected, and being placed
  endTurn: function (clickedTile) {
    this.saveBoardState(this.boardTilesArray);

    let oldTile = this.selectedTile;
    let newTile = clickedTile;
    //either move to the tile

    if (newTile.available == "move") {
      this.placePiece(oldTile, newTile);

      pieces.playMovementSound();
    } else if (
      //or attack the tile
      newTile.available == "attack"
    ) {
      this.doAttack(oldTile, newTile);
      this.placePiece(oldTile, newTile);

      pieces.playAttackSound();
    }

    pieces.update(oldTile, newTile);
    this.addMoveToHistory(oldTile, newTile);
    centralData.selectedTile = "";
    board.removeHighlights();

    this.checkWinConditions();

    this.switchTurn();

    //save the move in history of moves
    //   history.moves.push("aa");
  },

  placePiece: function (oldTile, newTile) {
    //important to make a new object, or else the hasMoved property is copied to other pieces (somehow)
    this.additions.checkSpecialPlacementEvent(oldTile, newTile);

    if (!this.skipPlacement) {
      newTile.content = {
        ...oldTile.content,
      };

      oldTile.content = "";
    }
    this.skipPlacement = false;
  },

  doAttack: function (oldTile, newTile) {
    this.additions.checkSpecialAttackEvent(oldTile, newTile);
    this.lostPieces.push(newTile.content);
    newTile.content = "";
  },

  deselectTile: function (tile) {
    this.selectedTile = "";
    board.removeHighlights();
    this.additions.checkSpecialDeselectEvent(tile);
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

  checkWinConditions: function () {
    let blackStartedWithKing = centralData.blackCivSetup.includes("K");
    let whiteStartedWithKing = centralData.whiteCivSetup.includes("K");

    if (whiteStartedWithKing || blackStartedWithKing) {
      let blackHasKing = false;
      let whiteHasKing = false;
      centralData.boardTilesArray.forEach((tile) => {
        let piece = tile.content;
        if (piece?.name == "king" && piece?.player == "black") {
          blackHasKing = true;
        }

        if (piece?.name == "king" && piece?.player == "white") {
          whiteHasKing = true;
        }
      });
      if (
        !blackHasKing &&
        blackStartedWithKing &&
        !whiteHasKing &&
        whiteStartedWithKing
      ) {
        interface.showGameConclusionPopup("draw");
      } else if (!blackHasKing && blackStartedWithKing) {
        interface.showGameConclusionPopup("white");
      } else if (!whiteHasKing && whiteStartedWithKing) {
        interface.showGameConclusionPopup("black");
      }
    }

    let whitePieceAmount = 0;
    let blackPieceAmount = 0;
    centralData.boardTilesArray.forEach((tile) => {
      let piece = tile.content;

      if (piece?.player == "black" && piece.name != "elephant") {
        blackPieceAmount++;
      }

      if (piece?.player == "white" && piece.name != "elephant") {
        whitePieceAmount++;
      }
    });
    if (whitePieceAmount == 0 && blackPieceAmount == 0) {
      interface.showGameConclusionPopup("draw");
    } else if (whitePieceAmount == 0) {
      interface.showGameConclusionPopup("black");
    } else if (blackPieceAmount == 0) {
      interface.showGameConclusionPopup("white");
    }
  },

  additions: {
    checkSpecialStartEvent: function (clickedTile) {
      let tileX = clickedTile.x;
      let tileY = clickedTile.y;
      let piece = clickedTile.content;
      let leftXTile = centralData.getTileObjXY(tileX - 1, tileY);
      let rightXTile = centralData.getTileObjXY(tileX + 1, tileY);
      let previousMove = centralData.previousMoveData;

      movementLogic.special.enPassantStart(
        clickedTile,
        tileX,
        tileY,
        piece,
        leftXTile,
        rightXTile,
        previousMove
      );

      movementLogic.special.castlingStart(
        clickedTile,
        tileX,
        tileY,
        piece,
        gamePlay.playerTurn
      );
    },

    checkSpecialPlacementEvent: function (oldTile, newTile) {
      let piece = oldTile.content;

      movementLogic.special.castlingPlacement(
        oldTile,
        newTile,
        piece,
        gamePlay.playerTurn
      ) ||
        movementLogic.special.pawnPromotion(
          oldTile,
          newTile,
          piece,
          gamePlay.playerTurn
        );

      if (piece.name == "bomb") {
        for (let tile of centralData.boardTilesArray) {
          tile.node.classList.remove("threatTile");
        }
      }
    },

    checkSpecialAttackEvent: function (oldTile, newTile) {
      let previousMove = centralData.previousMoveData;
      let aboveYTile = centralData.getTileObjXY(newTile.x, newTile.y - 1);
      let belowYTile = centralData.getTileObjXY(newTile.x, newTile.y + 1);
      let tileX = newTile.x;
      let tileY = newTile.y;
      let piece = newTile.content;
      let oldPiece = oldTile.content;

      movementLogic.special.enPassantAttack(
        newTile,
        aboveYTile,
        belowYTile,
        previousMove
      );

      if (oldTile.content.name == "bomb" || newTile.content.name == "bomb") {
        movementLogic.special.bombDetonation(oldTile, newTile);
      }

      if (oldTile.content.name == "cannon") {
        gamePlay.skipPlacement = true;
      }
    },

    pawnPromotionPopup: function (newTile) {
      //because gamePlay.placePiece() already finishes before, I am slightly forcing this to happen after the turn

      //here I create a popup to choose a piece
      let popup = document.createElement("div");
      popup.setAttribute("id", "popup");
      board.boardEdgeNode.appendChild(popup);

      let queenImg = document.createElement("img");
      let rookImg = document.createElement("img");
      let bishopImg = document.createElement("img");
      let knightImg = document.createElement("img");
      queenImg.src = "./files/queenGrey.svg";
      rookImg.src = "./files/rookGrey.svg";
      bishopImg.src = "./files/bishopGrey.svg";
      knightImg.src = "./files/knightGrey.svg";

      popup.appendChild(queenImg);
      popup.appendChild(rookImg);
      popup.appendChild(bishopImg);
      popup.appendChild(knightImg);

      queenImg.addEventListener("click", () => {
        choosePiece("Q");
      });
      rookImg.addEventListener("click", () => {
        choosePiece("R");
      });
      bishopImg.addEventListener("click", () => {
        choosePiece("B");
      });
      knightImg.addEventListener("click", () => {
        choosePiece("N");
      });

      let popupOverlay = document.createElement("div");
      popupOverlay.setAttribute("id", "popupOverlay");
      document.body.appendChild(popupOverlay);

      //and the mechanic to place the chosen piece (again, I'm not completely happy with this code)
      function choosePiece(piece) {
        let chosenPiece = centralData.getPieceFromSymbolAndColor(
          piece,
          gamePlay.otherPlayer
        );
        newTile.content = chosenPiece;
        popup.remove();
        popupOverlay.remove();
        board.update();
      }
    },

    checkSpecialDeselectEvent(tile) {
      if (tile.content.name == "bomb") {
        for (let tile of centralData.boardTilesArray) {
          tile.node.classList.remove("threatTile");
        }
      }
    },
  },

  playerTurn: "white",
  otherPlayer: "black",

  skipPlacement: false,
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
    } else {
      return piece.movement.stepAmount;
    }
  },

  getStepAmountAtk: function (piece) {
    if (!piece.hasMoved && piece.movement.firstMove?.attack?.stepAmount) {
      return piece.movement.firstMove.attack.stepAmount;
    } else if (piece.movement.attack?.stepAmount) {
      return piece.movement.attack.stepAmount;
    } else {
      return piece.movement.stepAmount;
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
    if (movementData.directions == 0) {
      return;
    }
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
        } else if (
          availableTileObj.content.player == gamePlay.otherPlayer &&
          availableTileObj.content.name != "elephant"
        ) {
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

  special: {
    enPassantStart: function (
      clickedTile,
      tileX,
      tileY,
      piece,
      leftXTile,
      rightXTile,
      previousMove
    ) {
      //don't run if this is the first move
      if (!previousMove) {
        return;
      }

      if (piece.name != "pawn") {
        return;
      }
      if (leftXTile?.content) {
        // check left hand for en passant
        if (leftXTile.content.name === "pawn") {
          //check if the left pawn was the one moved previous turn
          if (previousMove.endTile == leftXTile) {
            //check if that pawn was moved 2 places last turn
            if ((previousMove.startTile.y - previousMove.endTile.y) ** 2 == 4) {
              let passantTile;
              if (gamePlay.playerTurn == "white") {
                passantTile = centralData.getTileObjXY(tileX - 1, tileY - 1);
              } else {
                passantTile = centralData.getTileObjXY(tileX - 1, tileY + 1);
              }
              passantTile.available = "attack";
            }
          }
        }
      }
      if (rightXTile?.content) {
        //check right hand side for en passant
        if (rightXTile.content.name === "pawn") {
          //check if the right pawn was the one moved previous turn
          if (previousMove.endTile == rightXTile) {
            //check if that pawn was moved 2 places last turn
            if ((previousMove.startTile.y - previousMove.endTile.y) ** 2 == 4) {
              let passantTile;
              if (gamePlay.playerTurn == "white") {
                passantTile = centralData.getTileObjXY(tileX + 1, tileY - 1);
              } else {
                passantTile = centralData.getTileObjXY(tileX + 1, tileY + 1);
              }
              passantTile.available = "attack";
            }
          }
        }
      }
    },

    enPassantAttack: function (newTile, aboveYTile, belowYTile, previousMove) {
      //don't run if this is the first move
      if (!previousMove) {
        return;
      }
      //check if current piece is a pawn
      if (!newTile.content.name === "pawn") {
        return;
      }

      //if the previous move was not by a pawn, or moved 2 spots, stop function
      if (
        !(
          previousMove.endTile.content.name === "pawn" &&
          (previousMove.startTile.y - previousMove.endTile.y) ** 2 == 4
        )
      ) {
        return;
      }

      if (gamePlay.playerTurn == "white") {
        if (belowYTile.content == previousMove.endTile.content) {
          centralData.lostPieces.push(previousMove.endTile.content);
          belowYTile.content = "";
        }
      } else {
        if (aboveYTile.content == previousMove.endTile.content) {
          centralData.lostPieces.push(previousMove.endTile.content);
          aboveYTile.content = "";
        }
      }
    },

    castlingStart: function (clickedTile, tileX, tileY, piece, playerTurn) {
      let y = 0;
      if (piece.name != "king" || Boolean(piece.hasMoved)) {
        //no castling
        return;
      } else {
        if (playerTurn == "white") {
          y = 7;
        } else {
          y = 0;
        }
        let leftCornerTile = centralData.getTileObjXY(0, y);
        let rightCornerTile = centralData.getTileObjXY(7, y);

        //check left castling availability
        if (
          !Boolean(leftCornerTile.content.hasMoved) &&
          Boolean(leftCornerTile.content)
        ) {
          //if piece in right corner has NOT moved

          //check all tiles from the left until you find a king
          for (let x = 1; x <= 6; x++) {
            let currentTile = centralData.getTileObjXY(x, y);
            if (
              currentTile.content.name != "king" &&
              Boolean(currentTile.content)
            ) {
              break;
            }
            //prevent this from triggering to another king than the one you clicked
            else if (
              currentTile.content.name == "king" &&
              currentTile != clickedTile
            ) {
              break;
            }

            if (currentTile.content.name == "king") {
              //now we have found a king, with all empty tiles on left side,
              //and a piece in the left corner that has not moved
              let king = currentTile.content;
              //if that king has not moved yet
              if (!Boolean(king.hasMoved)) {
                let castleTile = centralData.getTileObjXY(
                  currentTile.x - 2,
                  currentTile.y
                );

                if (!castleTile) {
                  castleTile = centralData.getTileObjXY(
                    currentTile.x + 1,
                    currentTile.y
                  );
                }
                castleTile.available = "move";
              }
              break;
            }
          }
        }

        //check right castling availability
        if (
          !Boolean(rightCornerTile.content.hasMoved) &&
          Boolean(rightCornerTile.content)
        ) {
          //if piece in right corner has NOT moved

          //check all tiles from the right until you find a king
          for (let x = 6; x >= 0; x--) {
            let currentTile = centralData.getTileObjXY(x, y);
            if (
              currentTile.content.name != "king" &&
              Boolean(currentTile.content)
            ) {
              break;
            }
            //prevent this from triggering to another king than the one you clicked
            else if (
              currentTile.content.name == "king" &&
              currentTile != clickedTile
            ) {
              break;
            }

            if (currentTile.content.name == "king") {
              //now we have found a king, with all empty tiles on right side,
              //and a piece in the right corner that has not moved
              let king = currentTile.content;
              //if that king has not moved yet
              if (!Boolean(king.hasMoved)) {
                let castleTile = centralData.getTileObjXY(
                  currentTile.x + 2,
                  currentTile.y
                );

                if (!castleTile) {
                  castleTile = centralData.getTileObjXY(
                    currentTile.x + 1,
                    currentTile.y
                  );
                }
                castleTile.available = "move";
              }
              break;
            }
          }
        }
      }
    },

    castlingPlacement: function (oldTile, newTile, piece, playerTurn) {
      if (piece.name != "king") {
        return;
      }

      //select first row
      let y;
      if (playerTurn == "white") {
        y = 7;
      } else {
        y = 0;
      }

      let leftCornerTile = centralData.getTileObjXY(0, y);
      let rightCornerTile = centralData.getTileObjXY(7, y);

      //castling placement on the left
      if (oldTile.x == 1) {
        // first checking of the king is adjacent to the corner piece
        oldTile.content = newTile.content;
        newTile.content = { ...piece };
        gamePlay.skipPlacement = true;
      } else if (oldTile.x - newTile.x == 2) {
        let cornerPieceNewTile = centralData.getTileObjXY(
          oldTile.x - 1,
          oldTile.y
        );
        cornerPieceNewTile.content = {
          ...leftCornerTile.content,
        };
        leftCornerTile.content = false;
      }

      //castling placement on the right
      if (oldTile.x == 6) {
        // first checking of the king is adjacent to the corner piece
        oldTile.content = newTile.content;
        newTile.content = { ...piece };
        gamePlay.skipPlacement = true;
      } else if (oldTile.x - newTile.x == -2) {
        let cornerPieceNewTile = centralData.getTileObjXY(
          oldTile.x + 1,
          oldTile.y
        );
        cornerPieceNewTile.content = {
          ...rightCornerTile.content,
        };
        rightCornerTile.content = false;
      }
    },

    pawnPromotion: function (oldTile, newTile, piece, playerTurn) {
      if (piece.name != "pawn") {
        return;
      }
      //select last row
      let y;
      if (playerTurn == "white") {
        y = 0;
      } else {
        y = 7;
      }

      if (newTile.y == y) {
        gamePlay.additions.pawnPromotionPopup(newTile);
      }
    },

    bombDetonation: function (oldTile, newTile) {
      let tilesArray = [
        [-2, -2],
        [-1, -2],
        [0, -2],
        [1, -2],
        [2, -2],
        [-2, -1],
        [-1, -1],
        [0, -1],
        [1, -1],
        [2, -1],
        [-2, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
        [-2, 1],
        [-1, 1],
        [0, 1],
        [1, 1],
        [2, 1],
        [-2, 2],
        [-1, 2],
        [0, 2],
        [1, 2],
        [2, 2],
      ];
      if (oldTile?.content && oldTile.content.name != "cannon") {
        oldTile.content = "";
      }
      tilesArray.forEach((coor) => {
        let x = newTile.x + coor[0];
        let y = newTile.y + coor[1];

        if (!(x < 0 || x > 7 || y < 0 || y > 7)) {
          let threatTile = centralData.getTileObjXY(x, y);
          if (threatTile.content) {
            if (threatTile.content.name == "bomb") {
              this.bombDetonation("", threatTile);
            }
            threatTile.content = "";
          }
        }
        newTile.content = "";
        newTile.content.name == "bomb";
      });
    },
  },
});

Object.assign(preparation, {
  // Method to initialize the game
  initializeGame: function () {
    interface.addUIEventListeners();
    board.createTiles();
    board.appendTiles();

    let blackCiv = centralData.blackCiv;
    let whiteCiv = centralData.whiteCiv;

    if (!blackCiv) {
      let civs = Object.entries(pieces.placement);
      blackCiv = civs[Math.floor(Math.random() * civs.length)];
      centralData.blackCivDisplay.textContent = blackCiv[0];
    } else {
      //make it possible to change the setup variable directly for debugging
      blackCiv = [0, centralData.blackCiv];
    }

    if (!whiteCiv) {
      let civs = Object.entries(pieces.placement);
      whiteCiv = civs[Math.floor(Math.random() * civs.length)];
      centralData.whiteCivDisplay.textContent = whiteCiv[0];
    } else {
      //make it possible to change the setup variable directly for debugging
      whiteCiv = [0, centralData.whiteCiv];
    }

    this.setupBoard(blackCiv[1], whiteCiv[1]);

    // Call setupBoard on the preparation object
    board.update(); // Update the board

    this.history.startPlacement = {
      black: blackCiv,
      white: whiteCiv,
    };
  },

  // Method to set up the board and pieces
  // iterates at equal pace through the tiles on the board, and
  // the order of pieces.placement, and connects the 2
  setupBoard: function (blackSetup, whiteSetup) {
    centralData.blackCivSetup = blackSetup;
    centralData.whiteCivSetup = whiteSetup;
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

  makeUI: function () {
    interface.addSetupOptions();
  },
});

const interface = {
  undoMove: document.getElementById("undoMove"),
  resetBoard: document.getElementById("resetBoard"),

  addUIEventListeners: function () {
    undoMove.addEventListener("click", () => this.undoLastMove());
    resetBoard.addEventListener("click", () => this.doResetBoard());
  },

  undoLastMove: function () {
    let lastState = centralData.boardSaveStates.pop();
    lastState.forEach((tile, index) => {
      centralData.boardTilesArray[index].content = tile.content;
      centralData.boardTilesArray[index].available = "";
    });
    pieces.playUndoSound();
    board.update();
    gamePlay.switchTurn();
  },

  doResetBoard: function () {
    if (
      centralData.boardSaveStates.length != 0 &&
      !confirm("You will lose the current game, are you sure?")
    ) {
      return;
    }
    centralData.lostPieces = [];
    centralData.selectedTile = "";
    centralData.availableTiles = [];

    let blackCiv = centralData.blackCiv;
    let whiteCiv = centralData.whiteCiv;

    if (!blackCiv) {
      let civs = Object.keys(pieces.placement);
      blackCiv = civs[Math.floor(Math.random() * civs.length)];
    }
    if (!whiteCiv) {
      let civs = Object.keys(pieces.placement);
      whiteCiv = civs[Math.floor(Math.random() * civs.length)];
    }
    for (tile of centralData.boardTilesArray) {
      tile.content = "";
      tile.available = "";
    }

    preparation.setupBoard(
      pieces.placement[blackCiv],
      pieces.placement[whiteCiv]
    );

    centralData.blackCivDisplay.textContent = blackCiv;
    centralData.whiteCivDisplay.textContent = whiteCiv;

    // Call setupBoard on the preparation object
    board.update(); // Update the board

    centralData.boardSaveStates = [];

    centralData.history.startPlacement = {
      black: pieces.placement[centralData.blackCiv],
      white: pieces.placement[centralData.whiteCiv],
    };

    gamePlay.playerTurn = "white";
    gamePlay.otherPlayer = "black";
  },

  addSetupOptions: function () {
    let setups = Object.entries(pieces.placement);

    let setupSelectionBlack = document.getElementById("setupSelection1");
    let setupSelectionWhite = document.getElementById("setupSelection2");

    setupSelectionBlack.addEventListener("change", (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      if (selectedOption.text == "random") {
        centralData.blackCiv = "";
      } else {
        centralData.blackCiv = selectedOption.text;
      }
    });

    setupSelectionWhite.addEventListener("change", (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      if (selectedOption.text == "random") {
        centralData.whiteCiv = "";
      } else {
        centralData.whiteCiv = selectedOption.text;
      }
    });

    for (let i = 0; i < setups.length; i++) {
      const option2 = document.createElement("option");
      const option1 = document.createElement("option");
      setupSelectionBlack.appendChild(option1);
      setupSelectionWhite.appendChild(option2);
      option1.textContent = setups[i][0];
      option2.textContent = setups[i][0];

      option1.value = setups[i][1];
      option2.value = setups[i][1];
    }
    /*
    for (j = 0; j <= themelength; j++) {
      const option = document.createElement("option");
      themeSelection.appendChild(option);
      option.textContent = themes[j].name;
      option.value = j;
    }
    */
  },

  showGameConclusionPopup(winner) {
    let popup = document.createElement("div");
    popup.setAttribute("id", "popup");
    popup.setAttribute("class", "gameConclusion");

    if (winner == "draw") {
      popup.textContent = "DRAW";
    } else {
      popup.textContent = `${winner.toUpperCase()} WON`;
    }

    board.boardEdgeNode.appendChild(popup);

    let closeBtn = document.createElement("button");
    closeBtn.textContent = "close";
    popup.appendChild(closeBtn);

    closeBtn.addEventListener("click", () => {
      closePopup();
    });

    let popupOverlay = document.createElement("div");
    popupOverlay.setAttribute("id", "popupOverlay");
    document.body.appendChild(popupOverlay);

    //and the mechanic to place the chosen piece (again, I'm not completely happy with this code)
    function closePopup() {
      popup.remove();
      popupOverlay.remove();
      board.update();
    }
  },
};

// Call initializeGame to start
let startGame = (function () {
  preparation.initializeGame();
  preparation.makeUI();
  // doTimeout();
})();
