
var assert = require('assert');
var DRS = require('../lib/drs');
var SLP = require('../lib/slp');

describe('DRS', function () {

  it('should load a file', function (done) {

    DRS.load(__dirname + '/../assets/graphics.drs', function (err, drs) {

      assert.ifError(err);
      assert.ok(drs);

      var slp = new SLP(drs.getFile(0));

      assert.ok(slp);

      assert.equal(slp.frames.length, 1);

      assert.equal(slp.frames[0].width, 116);
      assert.equal(slp.frames[0].height, 67);

      assert.equal(slp.frames[0].anchorX, 57);
      assert.equal(slp.frames[0].anchorY, 39);

      assert.ok(slp.frames[0].canvas);

      done();
    });

  });

});
