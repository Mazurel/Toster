import { strictEqual } from 'assert';
import Program from '../program.js';

describe('Main test', function() {
  describe('Mocha works !', function() {
    it('One is one', function() {
      strictEqual(1, 1);
    });
  });
});

describe('Program class', function() {
    const p = new Program("TestName", "echo", ["{ \"test\" : true }"]);
    it('Valid program name', function() {
        strictEqual(p.getName(), "TestName");
    }); 

    it('Data event listeners', function(done) {
        p.on("data", (d) => {
            if (d.test) done();
            else done(Error());
        });

        p.run();
    });
});
