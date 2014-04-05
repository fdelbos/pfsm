describe("Basic synchronous tests ->", function () {

    var pfsm = require('../pfsm').make();

    var setup = {
        "on": {
            "turnOff": function () {
                pfsm.goTo("off");
            }
        },
        "off": {
            "turnOn": function() {
                pfsm.goTo("on");
            }
        }
    };

    it("start fsm", function () {
        pfsm.fsm(setup);
        pfsm.start("off");
        expect(pfsm.state()).toEqual("off");
    });

    it("change state", function () {
        pfsm.call("turnOn");
        expect(pfsm.state()).toEqual("on");
    });

    it("disallow functions not in current state", function () {
        expect(function () {
            pfsm.call("turnOn");
        }).toThrow();
    });

    it("change state again", function () {
        pfsm.call("turnOff");
        expect(pfsm.state()).toEqual("off");
    });

    it("again disallow functions not in current state", function () {
        expect(function () {
            pfsm.call("turnOff");
        }).toThrow();
    });

});

