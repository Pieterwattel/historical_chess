const centralData = {
  boardTiles: [],

  getTileObjXY: function (x, y) {
    this.boardTiles.forEach((element) => {
      if (element.x == x && element.y == y) {
        console.log(element);
      }
    });
  },

  getPieceFromName: function (nameString, player) {
    pieces.list.forEach((piece) => {
      if (piece.name == nameString && piece.player == player) {
        return piece;
      }
    });
  },

  checkFunction: function () {
    console.log("this function has been called");
  },
};

const board = Object.create(centralData);
const pieces = Object.create(centralData);
const gamePlay = Object.create(centralData);

Object.assign(board, {
  boardEdgeNode: document.getElementById("boardEdge"),

  tileFactory: function (x, y, color) {
    console.log("tilefactory");
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
      if ((x == 0 && y == 0) || (x + y) % 2 == 0) {
        color = "beige";
      } else {
        color = "rgb(58, 35, 35)";
      }
      let tileData = this.tileFactory(x, y, color);
      this.createTileNode(tileData);
      this.boardTiles.push(tileData);
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
    tileNode.style.backgroundColor = tileObj.color;
    tileNode.addEventListener("click", () => gamePlay.checkTileAction(tileObj));
    this.boardEdgeNode.appendChild(tileNode);
  },
  /*
  run: function () {
    this.checkFunction();
  },
  */
});

Object.assign(gamePlay, {
  checkTileAction: function (tileObj) {
    console.log("checkTileAction", tileObj);
  },
});

Object.assign(pieces, {
  constructor: function (name, image, player, movement) {
    let hasMoved = false;
    return { name, image, player, movement, hasMoved };
  },

  list: {
    black: [
      {
        name: "rook",
        image: (src = "./files/rookBlack"),
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
    ],
    white: [
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
  },
});

let preparation = (function () {
  //  declareDOMelements();
  board.createTiles();
})();
