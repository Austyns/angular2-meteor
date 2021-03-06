"use strict";
var rxjs_1 = require('rxjs');
var observable_subscription_1 = require('./observable-subscription');
var _ = require('lodash');
var MeteorObservable = (function () {
    function MeteorObservable() {
    }
    MeteorObservable.call = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var argumentsArray = Array.prototype.slice.call(arguments);
        var lastParam = argumentsArray[argumentsArray.length - 1];
        if (lastParam && _.isFunction(lastParam)) {
            throw new Error("Invalid MeteorObservable.call arguments:\n         Your last param can't be a callback function, \n         please remove it and use \".subscribe\" of the Observable!");
        }
        return rxjs_1.Observable.create(function (observer) {
            Meteor.call.apply(Meteor, argumentsArray.concat([
                function (error, result) {
                    if (error) {
                        observer.error(error);
                        observer.complete();
                    }
                    else {
                        observer.next(result);
                        observer.complete();
                    }
                }
            ]));
        });
    };
    MeteorObservable.subscribe = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var argumentsArray = Array.prototype.slice.call(arguments);
        var lastParam = argumentsArray[argumentsArray.length - 1];
        if (lastParam && _.isObject(lastParam) && (lastParam.onReady || lastParam.onError)) {
            throw new Error("Invalid MeteorObservable.subscribe arguments: \n        your last param can't be a callbacks object, \n        please remove it and use \".subscribe\" of the Observable!");
        }
        var observable = observable_subscription_1.ObservableMeteorSubscription.create(function (observer) {
            var handle = Meteor.subscribe.apply(Meteor, argumentsArray.concat([
                {
                    onError: function (error) {
                        observer.error(error);
                        observer.complete();
                    },
                    onReady: function () {
                        observer.next();
                    }
                }
            ]));
            observable._meteorSubscriptionRef = handle;
            return function () {
                if (handle && handle.stop) {
                    try {
                        handle.stop();
                    }
                    catch (e) {
                    }
                }
            };
        });
        return observable;
    };
    return MeteorObservable;
}());
exports.MeteorObservable = MeteorObservable;
