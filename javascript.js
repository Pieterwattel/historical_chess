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
    let color = "white";
    let x = 0;
    let y = 0;
    let i = 8;
    do {
      //CREATE tile object through tileFactory
      let tileData = this.tileFactory(x, y, color);
      this.createTileNode(tileData);
      x++;
      i--;
    } while (i > 0);
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
