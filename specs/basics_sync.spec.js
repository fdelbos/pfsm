
describe("Basic synchronous test tests ->", function () {


    var pfsm = require('../pfsm').make();

    var setup = {
        "on": {
            "turnOff": function () {
                pfsm.goto("off", null);
            }
        },
        "off": {
            "turnOn": function() {
                pfsm.goto("on", null);
            }
        }
    };

    it("should create a fsm start it and use it", function (done) {
        pfsm.fsm(setup);
        pfsm.start("off", null);
        expect(pfsm.state()).toEqual("off");
        pfsm.call("turnOn");
        expect(pfsm.state()).toEqual("on");
        done();
    });


});

