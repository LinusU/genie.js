
var assert = require('assert');
var Scenario = require('../lib/scenario');

describe('Scenario', function () {

  it('should load a file', function (done) {

    Scenario.load(__dirname + '/../assets/Linus-test.scn', function (err, s) {

      assert.ifError(err);

      assert.equal(s.map.width, 72);
      assert.equal(s.map.height, 72);

      assert.equal(s.players[0].enabled, 1);
      assert.equal(s.players[0].human, 1);

      assert.equal(s.players[1].enabled, 1);
      assert.equal(s.players[1].human, 0);

      assert.equal(s.units.length, 1119 + 2);

      done();
    });

  });

});
