
function Frame () {}

Frame.prototype.readHeader = function (view) {

  this.cmdTableOffset = view.getUint32();
  this.outlineTableOffset = view.getUint32();
  this.palletOffset = view.getUint32();
  this.properties = view.getUint32();

  this.width = view.getInt32();
  this.height = view.getInt32();
  this.anchorX = view.getInt32();
  this.anchorY = view.getInt32();

};

Frame.prototype.readBody = function (view) {

};

function SLP (view) {

  var version = view.getString(4);
  var numFrames = view.getUint32();
  var comment = view.getString(24);

  var i;
  var frames = new Array(numFrames);

  for (i=0; i<numFrames; i++) {
    frames[i] = new Frame();
    frames[i].readHeader(view);
  }

  for (i=0; i<numFrames; i++) {
    frames[i].readBody(view);
  }

}

module.exports = SLP;
