
function Map (view) {

  var width = view.getInt32();
  var height = view.getInt32();

  var terrain = new Array(width * height);

  for (var i=0; i<terrain.length; i++) {
    terrain[i] = {};
    terrain[i].type = view.getUint8();
    terrain[i].elev = view.getUint8();
    view.getUint8(); // unused = 0
  }

  this.width = width;
  this.height = height;
  this._terrain = terrain;
}

Map.prototype.getTerrain = function (x, y) {
  return this._terrain[y * this.height + x];
};

module.exports = Map;
