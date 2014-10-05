
var jDataView = require('jdataview');
var Canvas = require('canvas-browserify');

var Palette = require('./palette');
var loadBinaryFile = require('./load-binary-file');

var DEF_PALETTE = new Palette();

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
  var i;

  this.canvas = new Canvas(this.width, this.height);

  var ctx = this.canvas.getContext('2d');
  var leftEdges = new Array(this.height);
  var rightEdges = new Array(this.height);

  view.seek(this.outlineTableOffset);

  for (i=0; i<this.height; i++) {
    leftEdges[i] = view.getInt16();
    rightEdges[i] = view.getInt16();
  }

  view.seek(this.cmdTableOffset);
  var commandOffsets = new Array(this.height);

  for (i=0; i<this.height; i++) {
    commandOffsets[i] = view.getUint32();
  }

  commandOffsets.forEach(function (offset, y) {
    var amt, x;

    view.seek(offset);
    x = leftEdges[y];

    if (x === 0x8000) {
      // Skip this line
      return ;
    }

    var opcode = 0;
    while (opcode !== 0x0F) {

      opcode = view.getUint8();
      var command = opcode & 0xF;

      function copyLine (amt) {
        ctx.fillStyle = DEF_PALETTE[view.getUint8()];
        ctx.fillRect(x, y, amt, 1);
        x += amt;
      }

      function copyPixels (amt) {
        for (var i=0; i<amt; i++) { copyLine(1); }
      }

      switch (command) {
        case 0xF:
          // end
          break;
        case 0x0:
        case 0x4:
        case 0x8:
        case 0xC:
          copyPixels(opcode >> 2);
          break;
        case 0x1:
        case 0x5:
        case 0x9:
        case 0xD:
          x += ((opcode >> 2) || view.getUint8());
          break;
        case 0x2:
          copyPixels(((opcode & 0xF0) << 4) + view.getUint8());
          break;
        case 0x3:
          x += ((opcode & 0xF0) << 4) + view.getUint8();
          break;
        case 0x6:
          // TODO: player color
          copyPixels((opcode >> 4) || view.getUint8());
          break;
        case 0x7:
          copyLine((opcode >> 4) || view.getUint8());
          break;
        case 0xA:
          // TODO: player color
          copyLine((opcode >> 4) || view.getUint8());
          break;
        case 0xB:
          x += ((opcode >> 4) || view.getUint8());
          break;
        case 0xE:

          var ext = (opcode >> 4);

          switch (ext) {
            case 0:
            case 1:
            case 2:
            case 3:
              // FIXME
              break;
            case 4:
            case 6:
              // FIXME
              x += 1;
              break;
            case 5:
            case 7:
              // FIXME
              x += view.getUint8();
              break;
            default:
              throw new Error('Unknown extended opcode: ' + ext);
          }

          break;
      }


    }




  });


};

function SLP (raw) {

  var view = new jDataView(raw, undefined, undefined, true);

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

  this.frames = frames;

}

SLP.load = function (path, cb) {
  loadBinaryFile(path, function (err, buffer) {
    if (err) { return cb(err); }

    cb(null, new SLP(buffer));
  });
};

module.exports = SLP;
