/*global mocha, chai, sinon, describe, it, expect*/

// See http://chaijs.com/api/bdd/ for syntax.
(function(global, mocha, chai) {
  'use strict';
  describe('1.0: Array', function() {

    describe('1.1: #indexOf()', function() {
      it('1.1.0: expect to be a function.', function() {
        expect([].indexOf).to.be.a('function');
      });

      it('1.1.1: should return -1 when the value is not present.', function() {
        [1, 2, 3].indexOf(5).should.equal(-1);
        [1, 2, 3].indexOf(0).should.equal(-1);
        [1, 4, 6, 15, 55].indexOf(5).should.equal(-1);
      });
    });
  });
}(this, mocha, chai));
