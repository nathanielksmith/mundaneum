var m = require('akeley'),
rewire = require('rewire');

var federate = rewire('../federate');

exports.testFederate = {
    setUp: function(cb) {
        federate.__set__('client', {
            postNote: m.create_func()
        });
        var p = process;
        p.nextTick = function(fn) { fn() };
        federate.__set__('process', p);
        cb();
    },
    testFederateNoMatches: function(test) {
        federate.__set__('settings', {
            HOSTS: {
                host0: {
                    passphrase: 'screret',
                    host: 'host0',
                    port: 5000
                },
                host1: {
                    passphrase: 'srrect',
                    host: 'host1',
                    port: 6000
                }
            },
            FEDERATE: {
               host0: {
                   filter: /none/
               },
               host1: {
                   filter: /nothing/
               }
            }
        })
        test.ok(false);
        test.done();
    },
    testFederateMatches: function(test) {
        test.ok(false);
        test.done();
    }
};
