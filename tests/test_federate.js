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
        this.hosts = {
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
        };

        this.federate = [{
            label:'host0',
            filter: /one/
        }, {
            label: 'host1',
            filter: /two/
        }];
 
        cb();
    },
    testFederateNoMatches: function(test) {
        federate("hello there", this.hosts, this.federate);
        test.ok(!this.mockPostNote.called);
        test.done();
    },
    testFederateSomeMatches: function(test) {
        federate('hello one there', this.hosts, this.federate);
        test.equal(this.mockPostNote.calls, 1);
        test.equal(this.mockPostNote.args[0][1], 'host0');
        test.done();
    },
    testFederateAllMatches: function(test) {
        federate('hello one two there', this.hosts, this.federate);
        test.equal(this.mockPostNote.calls, 2);
        test.equal(this.mockPostNote.args[0][1], 'host0');
        test.equal(this.mockPostNote.args[1][1], 'host1');
        test.done();
    }
};
