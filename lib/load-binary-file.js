
var IS_BROWSER = (typeof window !== 'undefined');

if (IS_BROWSER) {

  module.exports = function loadBinaryFile (path, cb) {

    var req = new XMLHttpRequest();

    req.onerror = function () {
      cb(new Error('Failed to load file: ' + path))
    };

    req.onload = function () {
      cb(null, this.response);
    };

    req.open('GET', path, true);
    req.responseType = 'arraybuffer';
    req.send();

  };

} else {

  var fs = require('fs');

  module.exports = function loadBinaryFile (path, cb) {
    fs.readFile(path, cb);
  };

}
