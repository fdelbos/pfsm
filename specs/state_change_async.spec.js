describe("State change onExit / onEnter asynchronous tests ->", function () {

    var pfsm = require('../pfsm').make();

    var onEnter = false,
        onExit = false,
        offEnter = false,
        offExit = false;

    var setup = {
        "on": {
            "_onEnter": function (cb) {
                onEnter = true;
                cb();
            },

            "turnOff": function (p, cb) {
                pfsm.goto("off", null, cb);
            },

            "_onExit": function (cb) {
                onExit = true;
                cb();
            }
        },
        "off": {
            "_onEnter": function (cb) {
                offEnter = true;
                cb();
            },

            "turnOn": function(p, cb) {
                pfsm.goto("on", null, cb);
            },

            "_onExit": function(cb) {
                offExit = true;
                cb();
            }
        }
    };

    it("start fsm", function (done) {
        pfsm.fsm(setup);
        pfsm.start("off", null, function () {
            expect(pfsm.state()).toEqual("off");
            expect(offEnter).toEqual(true);
            expect(offExit).toEqual(false);
            expect(onEnter).toEqual(false);
            expect(onExit).toEqual(false);
            done();
        });

    });

    it("change state", function (done) {
        pfsm.call("turnOn", null, function (err) {
            expect(pfsm.state()).toEqual("on");
            expect(offExit).toEqual(true);
            expect(onEnter).toEqual(true);
            expect(onExit).toEqual(false);
            done();
        });
    });

    it("disallow functions not in current state", function () {
        expect(function () {
            pfsm.call("turnOn");
        }).toThrow();
    });

    it("change state again", function (done) {
        pfsm.call("turnOff", null, function (err) {
            expect(pfsm.state()).toEqual("off");
            expect(onExit).toEqual(true);
            done();
        });

    });

    it("again disallow functions not in current state", function () {
        expect(function () {
            pfsm.call("turnOff");
        }).toThrow();
    });

});
