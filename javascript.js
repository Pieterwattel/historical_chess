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

  list: [
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
    ["rook", "black"],
    // 8b
    ["", "black"],
    // 8c
    ["", "black"],
    // 8d
    ["", "black"],
    // 8e
    ["", "black"],
    // 8f
    ["", "black"],
    // 8g
    ["", "black"],
    // 8h
    ["", "black"],
    // 7a
    ["", "black"],
    // 7b
    ["", "black"],
    // 7c
    ["", "black"],
    // 7d
    ["", "black"],
    // 7e
    ["", "black"],
    // 7f
    ["", "black"],
    // 7g
    ["", "black"],
    // 7h
    ["", "black"],

    // 2a
    ["", "white"],
    // 2b
    ["", "white"],
    // 2c
    ["", "white"],
    // 2d
    ["", "white"],
    // 2e
    ["", "white"],
    // 2f
    ["", "white"],
    // 2g
    ["", "white"],
    // 2h
    ["", "white"],
    // 1a
    ["", "white"],
    // 1b
    ["", "white"],
    // 1c
    ["", "white"],
    // 1d
    ["", "white"],
    // 1e
    ["", "white"],
    // 1f
    ["", "white"],
    // 1g
    ["", "white"],
    // 1h
    ["", "white"],
  ],
});

let preparation = (function () {
  //  declareDOMelements();
  board.createTiles();
})();
