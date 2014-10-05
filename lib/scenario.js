
var pako = require('pako');
var jDataView = require('jdataview');

var Map = require('./map');
var Unit = require('./unit');
var loadBinaryFile = require('./load-binary-file');

function readSeparator (view) {
  if (view.getUint32() !== 0xFFFFFF9D) {
    throw new Error('Wrong separator');
  }
}

function Scenario (raw) {
  var i, j;

  var view = new jDataView(raw, undefined, undefined, true);

  var version = view.getString(4);

  if (version !== '1.11') {
    throw new Error('Unknown version: ' + version);
  }

  var headerLength = view.getInt32();
  var checksum = view.getInt32();
  var timestamp = view.getInt32();

  var instructionsLength = view.getInt32();
  var instructions = view.getString(instructionsLength);

  view.getInt32(); // unknown
  view.getInt32(); // player count

  var compressedLength = view.byteLength - (headerLength + 8);
  var compressed = view.getBytes(compressedLength);

  var inflated = pako.inflateRaw(compressed);
  var view2 = new jDataView(inflated, undefined, undefined, true);

  var nextUid = view2.getInt32();
  var version2 = view2.getFloat32();

  var players = [];

  for (i=0; i<16; i++) {
    players.push({});
  }

  for (i=0; i<16; i++) {
    players[i].name = view2.getString(256).replace(/\0+$/, '');
  }

  // ONLY IF version >= 1.18
  // for (i=0; i<16; i++) {
  //   view2.getInt32(); // string table
  // }

  for (i=0; i<16; i++) {
    players[i].enabled = view2.getInt32();
    players[i].human = view2.getInt32();
    players[i].civ = view2.getInt32();
    view2.getInt32(); // unknown
  }

  view2.getInt32(); // unknown
  view2.getUint8(); // unknown
  view2.getFloat32(); // unknown

  var origNameLength = view2.getUint16();
  var origName = view2.getString(origNameLength);

  // ONLY IF version >= 1.18, last one only on >= 1.22
  // var mstrings = new Array(6);
  // for (i=0; i<6; i++) {
  //   mstrings[i] = view2.getInt32();
  // }

  // 6 if version >= 1.18
  var messages = new Array(5);
  for (i=0; i<5; i++) {
    messages[i] = view2.getString(view2.getUint16());
  }

  var cinem = new Array(4);
  for (i=0; i<4; i++) {
    cinem[i] = view2.getString(view2.getUint16());
  }

  var bitmap = view2.getUint32();

  var x = view2.getUint32();
  var y = view2.getInt32();

  if (bitmap) {
    throw new Error('Unimplemented');
  }

  view2.getInt16(); // unknown

  var unk = new Array(32);
  for (i=0; i<32; i++) {
    unk[i] = view2.getString(view2.getUint16());
  }

  var ai = new Array(16);
  for (i=0; i<16; i++) {
    ai[i] = view2.getString(view2.getUint16());
  }

// view2.getUint8();
// view2.getUint8();
// view2.getUint8();
// view2.getUint8();

  for (i=0; i<16; i++) {
    var readLength = 0;
    readLength += view2.getUint32();
    readLength += view2.getUint32();
    readLength += view2.getUint32();
    players[i].aiScript = view2.getString(readLength);
  }

  // DONT THINK IT's IN AoE 1.0c
  // for (i=0; i<16; i++) {
  //   // 0 = custom, 1 = standard, 2 = none
  //   players[i].aimode = view2.getUint8();
  //   console.log('player ' + i + ' aimode: ' + players[i].aimode);
  // }

  readSeparator(view2);

  for (i=0; i<16; i++) {
    players[i].gold = view2.getInt32();
    players[i].wood = view2.getInt32();
    players[i].food = view2.getInt32();
    players[i].stone = view2.getInt32();
    // players[i].orex = view2.getInt32();
    // console.log(view2.getInt32()); // padding, always 0
  }

  readSeparator(view2);
  view2.skip(40); // victory stuff

  for (i=0; i<16; i++) {
    players[i].diplomacy = new Array(16);
    for (j=0; j<16; j++) {
      // 0 = allied, 1 = neutral, 3 = enemy
      players[i].diplomacy[j] = view2.getInt32();
      if (players[i].diplomacy[j] > 3) { throw new Error('whidas'); }
    }
  }

  view2.skip(11520); // Unused, always 0. Yes, that's 11520 bytes.
  readSeparator(view2);
  view2.skip(4 * 16); // Allied vict, per-player. Ignored

  // FIXME
  view2.skip(20 * 16 * 4);
  // for (i=0; i<16; i++) { console.log(view2.getInt32()); }
  // for (i=0; i<16; i++) { for (j=0; j<30; j++) { console.log(view2.getInt32()); } }
  // for (i=0; i<16; i++) { view2.getInt32(); }
  // for (i=0; i<16; i++) { for (j=0; j<30; j++) { view2.getInt32(); } }
  // for (i=0; i<16; i++) { view2.getInt32(); }
  // for (i=0; i<16; i++) { for (j=0; j<20; j++) { view2.getInt32(); } }

  view2.getInt32(); // unknown
  view2.getInt32(); // unknown

  var allTech = view2.getInt32();

  for (i=0; i<16; i++) {
    // -1   None selected
    // 0    Dark Age
    // 1    Fuedal Age
    // 2    Castle Age
    // 3    Imperial Age
    // 4    Post-imperial Age
    players[i].age = view2.getInt32();
  }

  readSeparator(view2);

  // var cameraX = view2.getInt32();
  // var cameraY = view2.getInt32();

  var map = new Map(view2);

  var units = [];
  var unitSections = view2.getUint32();

  for (i=0; i<8; i++) {
    view2.getFloat32(); // Food
    view2.getFloat32(); // Wood
    view2.getFloat32(); // Gold
    view2.getFloat32(); // Stone
  }

  for (i=0; i<unitSections; i++) {
    var unitCount = view2.getUint32();
    for (j=0; j<unitCount; j++) {
      var unit = Unit.fromRaw(view2);
      unit.player = i;
      units.push(unit);
    }
  }

  this.map = map;
  this.units = units;
  this.players = players;
  this.title = origName.replace(/\.scn$/, '');

}

Scenario.load = function (path, cb) {
  loadBinaryFile(path, function (err, buffer) {
    if (err) { return cb(err); }

    cb(null, new Scenario(buffer));
  });
}

module.exports = Scenario;
