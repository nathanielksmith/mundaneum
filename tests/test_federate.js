var m = require('akeley'),
rewire = require('rewire');

var federate = rewire('./federate');

exports.testFederate = {
    setUp: function(cb) {
        federate.__set__('client', {
            postNote: m.create_func()
        });
        var p = process;
        p.nextTicket = function(fn) { fn() };
        federate.__set__('process', p);
        cb();
    },
    testFederateNoMatches: function(test) {
        test.ok(false);
        test.done();
    },
    testFederateMatches: function(test) {
        test.ok(false);
        test.done();
    }
};
