
var assert = require('assert');
var SLP = require('../lib/slp');

describe('SLP', function () {

  it('should load a file', function (done) {

    SLP.load(__dirname + '/../assets/gra00000.slp', function (err, slp) {

      assert.ifError(err);
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
