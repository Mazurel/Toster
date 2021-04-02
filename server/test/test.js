import { strictEqual } from 'assert';
import Program from '../program.js';

// TODO: Add tests for Programs class

describe('Main test', function() {
  describe('Mocha works !', function() {
    it('One is one', function() {
      strictEqual(1, 1);
    });
  });
});

describe('Program class', function() {
    describe("Test stdout on start", function() {
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

    describe("Test output after some time", function() {
        const p = new Program("Test Name", "sh", ["./test/delayEcho.sh"]);
        it('Valid program name', function() {
            strictEqual(p.getName(), "Test Name");
        }); 

        it('Data event listeners', function(done) {
            p.on("data", (d) => {
                if (d.hello === "World !") done();
                else done(Error());
            });

            p.run();
        });
    });

    describe("Test restarting program",function() {
        const p = new Program("Test Name", "sh", ["./test/delayEcho.sh"], { autoRestart: true });
        it('Valid program name', function() {
            strictEqual(p.getName(), "Test Name");
        }); 

        it('Data event listeners', function(done) {
            p.once("data", (d) => {
                if (d.hello === "World !") {
                    p.once("data", (d) => {
                        p.close();
                        if (d.hello == "World !") done();
                        else done(Error());
                    });
                }
                else done(Error());
            });

            p.run();
        });
    });

});
