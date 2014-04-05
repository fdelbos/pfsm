"use strict";

var _ = require("lodash");

var make = function () {

    var _fsm = null,
        _currentState = null,
        _data = null,

        /**
         * The main object where all the Finite State Machine logic takes place.
         * @class pfsm
         *
         */
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

            /**
             * Finite State Machine contructor, must be called before everything else with a definition.
             * See the example bellow:
             * ```
             *   // create the Finite State Machine.
             *   var pfsm = require('pfsm').make();
             *
             *   var definition = {
             *        "on": {
             *            // enter state hook
             *            "_enter": function (cb) {
             *                // do something asynchronously with a call back that takes an error as a parameter.
             *                // The callback is provided by pfsm.
             *                doSomethingAsync(cb);
             *            },
             *
             *            // change state synchronously.
             *            "turnOff": function (p) {
             *                pfsm.goTo("off", someData);
             *            },
             *            // exit state hook synchronously (since it doesn't take a call back)
             *            "_exit": function () {
             *                // maybe some cleanup stuff...
             *            }
             *        },
             *        "off": {
             *            // asynchronous, takes a callback
             *            "connectToDb": function(params, cb) {
             *                connectToDB(params.host + ":" + params.port, function(err) {
             *                    if (err) { // something goes wrong
             *                        return cb(err);
             *                    }
             *                    // ok everything is fine, we can change state.
             *                    pfsm.goTo("on", null, cb);
             *                });
             *            },
             *        }
             *    };
             *
             *   // ok now the Finite State Machine can be started.
             *   pfsm.fsm(setup);
             * ```
             *
             * @method fsm
             * @param definition {Object} The definition of the Finite State Machine.
             */
            fsm: function (definition) {
                _fsm = definition;
            },

            /**
             * Start the Finite State Machine, setting it's initial state and data. If a callback is provided,
             * then startup can be asynchronous.
             *
             * @method start
             * @param state {String} Initial state
             * @param data {Any} Initial data for the FSM
             * @param cb {Function} An optional callback, for asynchronous startup
             */
            start: function (state, data, cb) {
                if (_.isNull(_fsm)) {
                    pfsm.error("no fsm definition found!");
                }
                if (_.has(_fsm, "_init") && _.isFunction(_fsm._init)) {
                    _fsm._init(state, data, function (err) {
                        if (!pfsm.handleError(err, cb)) {
                            pfsm.goTo(state, data, cb);
                        }
                    });
                } else {
                    pfsm.goTo(state, data, cb);
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
                pfsm.stateChangeHandle(cb, "_exit");
            },

            enter: function (cb) {
                pfsm.stateChangeHandle(cb, "_enter");
            },

            /**
             * Transition to another state. If the state is not defined an exception will be thrown.
             *
             * @method goTo
             * @param state {String} next state to go to.
             * @param data {Any} data associated with the next state.
             * @param cb {Function} callback for asynchronous state change.
             */
            goTo: function (state, data, cb) {
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

            /**
             * Call a function defined for this state. If the function is undefined for the current state then,
             * an exception will be thrown.
             *
             * @method call
             * @param fn
             * @param params
             * @param cb
             */
            call: function (fn, params, cb) {
                if (!_.has(_fsm[_currentState], fn) || !_.isFunction(_fsm[_currentState][fn])) {
                    pfsm.error("function: '" + fn + "' not found for state: '" + _currentState + "'.");
                }
                _fsm[_currentState][fn](params, cb);
            },

            /**
             * Save the Finite State Machine's state and data. The returned object can be persisted and later
             * reloaded with the load function.
             *
             * @method save
             * @return {Object} Returns an object containing the state and the data of the Finite State Machine. This object
             * is meant to be persisted to later on restore the Finite State Machine's state via the load function.
             */
            save: function () {
                if (_.isNull(_currentState)) {
                    pfsm.error("FSM do not have a state yet.");
                }
                return {
                    "state": _currentState,
                    "data": _data
                };
            },

            /**
             * Restore the state and data of a previous Finite State Machine. Note that this function must be called
             * just after the fsm function and it will take care of restarting the Finite State Machine, and restoring
             * it's state. Don't call the start function after this.
             *
             * @method load
             * @param stateData {Object} A state, data object gathered from the save function.
             * @param cb {Function} An optionnal callback for asynchronous startup.
             */
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
                pfsm.goTo(stateData.state, stateData.data, cb);
            },

            /**
             * A getter for the Finite State Machine's current state. Be smart when using this method as the state can
             * change in an asynchronous fashion.
             *
             * @method state
             * @returns {String} The current state of the Finite State Machine.
             */
            state: function () {
                return _currentState;
            }


        };

    return {
        fsm: pfsm.fsm,
        start: pfsm.start,
        goTo: pfsm.goTo,
        call: pfsm.call,
        save: pfsm.save,
        load: pfsm.load,
        state: pfsm.state
    };
};

exports.make = make;
