describe("State change onExit / onEnter synchronous tests ->", function () {

    var pfsm = require('../pfsm').make();

    var onEnter = false,
        onExit = false,
        offEnter = false,
        offExit = false;

    var setup = {
        "on": {
            "_enter": function () {
                onEnter = true;
            },

            "turnOff": function () {
                pfsm.goTo("off");
            },

            "_exit": function () {
                onExit = true;
            }
        },
        "off": {
            "_enter": function () {
                offEnter = true;
            },

            "turnOn": function() {
                pfsm.goTo("on");
            },

            "_exit": function() {
                offExit = true;
            }
        }
    };

    it("start fsm", function () {
        pfsm.fsm(setup);
        pfsm.start("off");
        expect(pfsm.state()).toEqual("off");
        expect(offEnter).toEqual(true);
        expect(offExit).toEqual(false);
        expect(onEnter).toEqual(false);
        expect(onExit).toEqual(false);
    });

    it("change state", function () {
        pfsm.call("turnOn");
        expect(pfsm.state()).toEqual("on");
        expect(offExit).toEqual(true);
        expect(onEnter).toEqual(true);
        expect(onExit).toEqual(false);
    });

    it("disallow functions not in current state", function () {
        expect(function () {
            pfsm.call("turnOn");
        }).toThrow();
    });

    it("change state again", function () {
        pfsm.call("turnOff");
        expect(pfsm.state()).toEqual("off");
        expect(onExit).toEqual(true);
    });

    it("again disallow functions not in current state", function () {
        expect(function () {
            pfsm.call("turnOff");
        }).toThrow();
    });

});