const centralData = {
  boardTilesArray: [],
  lostPieces: [],
  selectedTile: "",
  availableTiles: [],
  boardSaveStates: [],

  blackCiv: "",
  whiteCiv: "",

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
    console.log(boardArray);
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
    castling: "QK     RRRRRRRRR",

    //pawnPromotion: "        PPPP    ",

    standard: "RNBQKBNRPPPPPPPP", // Classic chess setup

    french: " NQBBQN   P  P  ", // Bishop-heavy strategy
    ww1: "PPPPPPPPPPPPPPPP", // Trench warfare, symmetrical

    mongols: "NNNKKNNNPNPNPNPN", // Nomadic cavalry dominance
    romans: "RNRKKRNRPPPBBPPP", // Legion-based symmetry
    aztecs: " PQKQQP   PPPP  ", // Ritualistic battle lines

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
    pirates: "    QK   RRRPPP ", // Ship formations, chaotic
    redcoats: " RNKQKNR PPPPPP  ", // British line infantry
    mongol_horde: "NNKKNNNN PPPPPP ", // Pure mounted archery dominance
    spartacus: "   KQQQ   PPPPPP ", // Slave uprising, sudden power
    attila: " NNQKQNN PPPPPPPP ", // Unpredictable barbarian charge
    carthage: "  R QKQ R PPPPP  ", // Elephants & naval strategy
    normans: " RNKQBNR PPPPPPPP ", // Knight-based feudal power
    holy_roman: "B KQK  B  PPPP  ", // Church & state influence
    cossacks: "NN KQ NN  PPPP  ", // Highly mobile raiders
    ragnarok: "QQ K  QQ  PPPP  ", // Norse myth, end-of-days chaos
    other1: "R B  B RN N  N N",
    other2: "B N  N BN B  B N",
    other3: " KKKPPP  KKKPPP ",
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
    console.log(clickedTileObj);
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

    if (selectedTile && clickedTileObj.available) {
      this.endTurn(clickedTileObj);
    } else if (
      // if there is no piece selected yet, this is the start of a move
      (!selectedTile && clickedTileObj.content) ||
      //also re-initiate the turn if this some other piece of the current playerTurn's
      clickedTileObj?.content?.player == this.playerTurn
    ) {
      this.startTurn(clickedTileObj);
    } else {
      this.deselectTile();
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
    } else if (
      //or attack the tile
      newTile.available == "attack"
    ) {
      this.doAttack(oldTile, newTile);
      this.placePiece(oldTile, newTile);
    }
    pieces.update(oldTile, newTile);
    this.addMoveToHistory(oldTile, newTile);
    centralData.selectedTile = "";
    board.removeHighlights();
    this.switchTurn();

    //save the move in history of moves
    //   history.moves.push("aa");
  },

  placePiece: function (oldTile, newTile) {
    //important to make a new object, or else the hasMoved property is copied to other pieces (somehow)
    let skipPlacement = this.additions.checkSpecialPlacementEvent(
      oldTile,
      newTile
    );

    console.log(skipPlacement);
    if (!skipPlacement) {
      newTile.content = {
        ...oldTile.content,
      };

      oldTile.content = "";
    }
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

      let skipPlacement =
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

      return skipPlacement;
    },

    checkSpecialAttackEvent: function (oldTile, newTile) {
      let previousMove = centralData.previousMoveData;
      let aboveYTile = centralData.getTileObjXY(newTile.x, newTile.y - 1);
      let belowYTile = centralData.getTileObjXY(newTile.x, newTile.y + 1);

      movementLogic.special.enPassantAttack(
        newTile,
        aboveYTile,
        belowYTile,
        previousMove
      );
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
        console.log(newTile);
        popup.remove();
        popupOverlay.remove();
        board.update();
      }
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
        console.log("noCastle");
        //no castling
        return;
      } else {
        console.log("castling");
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
          Boolean(leftCornerTile.content) &&
          leftCornerTile.content.player == gamePlay.playerTurns
        ) {
          //if piece in left corner has NOT moved

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
              //and a piece in the left corner that has not moved              console.log(currentTile);

              let king = currentTile.content;
              //if that king has not moved yet
              if (!Boolean(king.hasMoved)) {
                let castleTile = centralData.getTileObjXY(
                  currentTile.x - 2,
                  currentTile.y
                );
                //get the adjacent corner tile, when the king is next to the corner piece
                if (!castleTile) {
                  castleTile = centralData.getTileObjXY(
                    currentTile.x - 1,
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
              console.log(currentTile);
              console.log("notEmpty");
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
      let skipPlacement = false;
      if (piece.name != "king") {
        return skipPlacement;
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
        skipPlacement = true;
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
        skipPlacement = true;
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

      return skipPlacement;
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

      console.log(y);
      console.log(newTile.y);
      if (newTile.y == y) {
        if (active) {
          oldTile.content = centralData.getPieceFromSymbolAndColor(
            "Q",
            gamePlay.playerTurn
          );
        } else {
          gamePlay.additions.pawnPromotionPopup(newTile);
        }
      }
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
      let civs = Object.keys(pieces.placement);
      blackCiv = civs[Math.floor(Math.random() * civs.length)];
      console.log(blackCiv);
    }
    if (!whiteCiv) {
      let civs = Object.keys(pieces.placement);
      whiteCiv = civs[Math.floor(Math.random() * civs.length)];
      console.log(whiteCiv);
    }

    this.setupBoard(pieces.placement[blackCiv], pieces.placement[whiteCiv]);

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

const interface = {
  undoMove: document.getElementById("undoMove"),

  addUIEventListeners: function () {
    undoMove.addEventListener("click", () => this.undoLastMove());
  },

  undoLastMove: function () {
    console.log(centralData.boardSaveStates);
  },
};

// Call initializeGame to start
let startGame = (function () {
  preparation.initializeGame();
  // doTimeout();
})();

let i = 0;
let active = false;
let speed = 80;
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
