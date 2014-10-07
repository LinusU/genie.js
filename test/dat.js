
var assert = require('assert');
var DAT = require('../lib/dat');

describe('DAT', function () {

  it('should load a file', function (done) {

    DAT.load(__dirname + '/../assets/Empires.dat', function (err, dat) {

      assert.ifError(err);
      assert.ok(dat);

      done();
    });

  });

});
