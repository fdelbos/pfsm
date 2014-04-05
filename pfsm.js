"use strict";

var _ = require("lodash");

var make = function () {

    var _fsm = null,
        _currentState = null,
        _data = null,

        pfsm = {

            handleError: function(err, cb) {
                if(_.isNull(err) || _.isUndefined(err)) {
                    return false;
                }
                else {
                    if (_.isFunction(cb)) {
                        cb(err);
                    }
                    return true;
                }

            },

            error: function (msg) {
                throw "pfsm error: " + msg;
            },

            fsm: function (fsm) {
                _fsm = fsm;
            },

            start: function (state, data, cb) {
                if (_.isNull(_fsm)) {
                    pfsm.error("no fsm definition found!");
                }
                if (_.has(_fsm, "_init") && _.isFunction(_fsm._init)) {
                    _fsm._init(state, data, function (err) {
                        if (!pfsm.handleError(err, cb)) {
                            pfsm.goto(state, data, cb);
                        }
                    });
                } else {
                    pfsm.goto(state, data, cb);
                }
            },

            stateChangeHandle: function (cb, funName) {
                if (_.has(_fsm[_currentState], funName)) {
                    var fn = _fsm[_currentState][funName];
                    if(fn.length > 0) {
                        fn(cb);
                    } else {
                        fn();
                        cb(null);
                    }
                } else {
                    cb(null);
                }
            },

            exit: function (cb) {
                pfsm.stateChangeHandle(cb, "_onExit");
            },

            enter: function (cb) {
                pfsm.stateChangeHandle(cb, "_onEnter");
            },

            goto: function (state, data, cb) {
                if (!_.has(_fsm, state)) {
                    pfsm.error("state '" + state + "' not found");
                }
                if (!_.isNull(_currentState)) {
                    pfsm.exit(function (err) {
                        if (!pfsm.handleError(err, cb)) {
                            _data = data;
                            _currentState = state;
                            pfsm.enter(function (err) {
                                if (_.isFunction(cb)) {
                                    cb(err);
                                }
                            });
                        }
                    });
                } else {
                    _data = data;
                    _currentState = state;
                    pfsm.enter(function (err) {
                        if (_.isFunction(cb)) {
                            cb(err);
                        }
                    });
                }
            },

            call: function (fn, params, cb) {
                if (!_.has(_fsm[_currentState], fn) || !_.isFunction(_fsm[_currentState][fn])) {
                    pfsm.error("function: '" + fn + "' not found for state: '" + _currentState + "'.");
                }
                _fsm[_currentState][fn](params, cb);
            },

            save: function () {
                if (_.isNull(_currentState)) {
                    pfsm.error("FSM do not have a state yet.");
                }
                return {
                    "state": _currentState,
                    "data": _data
                };
            },

            load: function (stateData, cb) {
                if (_.isNull(_fsm)) {
                    pfsm.error("no fsm definition found!");
                }
                if (!_.isNull(_currentState)) {
                    pfsm.error("FSM already has state: '" + _currentState + "'.");
                }
                if (!_.has(stateData, "state") || !_.has(_fsm, stateData.state)) {
                    pfsm.error("invalid import state.");
                }
                if (!_.has(stateData, "data") || !_.has(_fsm, stateData.data)) {
                    pfsm.error("invalid import data.");
                }
                pfsm.goto(stateData.state, stateData.data, cb);
            }


        };

    return {
        fsm: pfsm.fsm,
        start: pfsm.start,
        goto: pfsm.goto,
        call: pfsm.call,
        save: pfsm.save,
        load: pfsm.load,
        state: function () {
            return _currentState;
        }
    };
};

exports.make = make;
