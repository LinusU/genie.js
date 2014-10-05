
var jDataView = require('jdataview');
var loadBinaryFile = require('./load-binary-file');

function DRS (raw) {
  var i, j;

  var view = jDataView(raw, undefined, undefined, true);

  // FIXME: GameVersion >= GV_SWGB -> 60
  var copyright = view.getString(40);

  var version = view.getString(4);
  var fileType = view.getString(12);

  var numTables = view.getUint32();
  var headerOffset = view.getUint32();

  var tables = new Array(numTables);

  for (i=0; i<numTables; i++) {
    tables[i] = {};
    tables[i].type = view.getString(4);
    tables[i].offset = view.getUint32();
    tables[i].numFiles = view.getUint32();
  }

  var files = {};

  for (i=0; i<numTables; i++) {
    for (j=0; j<tables[i].numFiles; j++) {

      var file = {};

      file.id = view.getUint32();
      file.offset = view.getUint32();
      file.size = view.getUint32();

      files[file.id] = file;
    }
  }

  this._view = view;
  this.files = files;

}

DRS.prototype.getFile = function (id) {

  if (this.files.hasOwnProperty(id) === false) {
    throw new Error('Unknown resource id: ' + id);
  }

  var file = this.files[id];

  return this._view.getBytes(file.size, file.offset);
};

DRS.load = function (path, cb) {
  loadBinaryFile(path, function (err, buffer) {
    if (err) { return cb(err); }

    cb(null, new DRS(buffer));
  })
};

module.exports = DRS;
