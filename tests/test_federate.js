var m = require('akeley'),
rewire = require('rewire');

var federate = rewire('../federate');

exports.testFederate = {
    setUp: function(cb) {
        this.mockPostNote = m.create_func();
        federate.__set__('client', {
            postNote: this.mockPostNote
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
            FEDERATE: [{
                label:'host0',
                filter: /none/
            }, {
                label: 'host1',
                filter: /nothing/
            }]
        });
        federate("hello there");
        test.ok(!this.mockPostNote.called);
        test.done();
    },
    testFederateSomeMatches: function(test) {
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
            FEDERATE: [{
                label:'host0',
                filter: /one/
            }, {
                label: 'host1',
                filter: /two/
            }]
        });
        federate('hello one there');
        test.equal(this.mockPostNote.calls, 1);
        test.equal(this.mockPostNote.args[0][1], 'host0');
        test.done();
    },
    testFederateAllMatches: function(test) {
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
            FEDERATE: [{
                label:'host0',
                filter: /one/
            }, {
                label: 'host1',
                filter: /two/
            }]
        });
        federate('hello one two there');
        test.equal(this.mockPostNote.calls, 2);
        test.equal(this.mockPostNote.args[0][1], 'host0');
        test.equal(this.mockPostNote.args[1][1], 'host1');
        test.done();
    }
};
