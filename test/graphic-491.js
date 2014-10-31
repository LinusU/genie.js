
var assert = require('assert');
var DRS = require('../lib/drs');
var SLP = require('../lib/slp');

describe('Graphic #491', function () {

  it('should load a file', function (done) {

    DRS.load(__dirname + '/../assets/graphics.drs', function (err, drs) {

      assert.ifError(err);
      assert.ok(drs);

      assert.equal(drs.files[491].type, 'SLP');

      var slp = new SLP(drs.getFile(491));

      assert.ok(slp);

      assert.equal(slp.frames.length, 20);

      assert.equal(slp.frames[0].width, 10);
      assert.equal(slp.frames[0].height, 7);

      assert.equal(slp.frames[0].anchorX, 6);
      assert.equal(slp.frames[0].anchorY, 0);

      assert.ok(slp.frames[0].canvas);

      done();
    });

  });

});
