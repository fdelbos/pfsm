describe("Persistence tests ->", function () {

    var pfsm = require('../pfsm').make();

    var setup = {
        "on": {
            "turnOff": function (p, cb) {
                pfsm.goTo("off", {"some": "dataOff"}, cb);
            }
        },
        "off": {
            "turnOn": function(p, cb) {
                pfsm.goTo("on", {"some": "dataOn"}, cb);
            }
        }
    };

    it("start fsm", function (done) {
        pfsm.fsm(setup);
        pfsm.start("off", null, function () {
            expect(pfsm.state()).toEqual("off");
            done();
        });

    });

    var persistedData;

    it("save state", function (done) {
        pfsm.call("turnOn", null, function (err) {
            expect(pfsm.state()).toEqual("on");
            persistedData = pfsm.save();
            done();
        });
    });

    var pfsm2 = require('../pfsm').make();

    var setup2 = {
        "on": {
            "turnOff": function (p, cb) {
                pfsm2.goTo("off", {"some": "dataOff"}, cb);
            }
        },
        "off": {
            "turnOn": function(p, cb) {
                pfsm2.goTo("on", {"some": "dataOn"}, cb);
            }
        }
    };

    it("restore state", function (done) {
        pfsm2.fsm(setup2);
        pfsm2.load(persistedData, function () {
            expect(pfsm2.state()).toEqual("on");
            done();
        });

    });

    it("change state again", function (done) {
        pfsm2.call("turnOff", null, function (err) {
            expect(pfsm2.state()).toEqual("off");
            done();
        });

    });

    it("again disallow functions not in current state", function () {
        expect(function () {
            pfsm2.call("turnOff");
        }).toThrow();
    });

});