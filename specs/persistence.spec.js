describe("Persistence tests ->", function () {

    var pfsm = require('../pfsm').make();

    var setup = {
        "on": {
            "turnOff": function () {
                pfsm.goTo("off", null);
            }
        },
        "off": {
            "turnOn": function(p, cb) {
                pfsm.goTo("on", null, cb);
            }
        }
    };

    it("start fsm", function (done) {
        pfsm.fsm(setup);
        pfsm.start("off", null, function (err) {
            if (!err) {
                expect(pfsm.state()).toEqual("off");
                done();
            }
        });

    });

    it("change state", function (done) {
        pfsm.call("turnOn", null, function (err) {
            if (!err) {
                expect(pfsm.state()).toEqual("on");
                done();
            }
        });
    });

});

