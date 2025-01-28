const centralData = {
  boardTiles: [],

  getTileXY: function (x, y) {
    return this.boardTiles.find(tile.x === x && tile.y === y);
  },

  checkFunction: function () {
    console.log("this function has been called");
  },
};

const board = Object.create(centralData);

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
        color = "saddlebrown";
      }
      let tileData = this.tileFactory(x, y, color);
      this.createTileNode(tileData);
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

const gamePlay = {
  checkTileAction: function (tileObj) {
    console.log("checkTileAction", tileObj);
  },
};

let preparation = (function () {
  //  declareDOMelements();
  board.createTiles();
})();
