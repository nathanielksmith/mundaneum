var rewire = require('rewire');

var settings = rewire('../settings.js');
var util = require('../util.js');

var json = JSON.stringify.bind(JSON);

exports.testSettings = {
    setUp: function(cb) {
        util.read = function() { 
            return json({
                local: {
                    passphrase: 'secret'
                }
            });
        }
        util.stat = function() {return true;}
        settings.__set__('util', util);
        cb();
    },
    testSeePassphrase: function(test) {
        var s = settings(process.env);
        test.equal(s.PASSPHRASE, 'secret', 'see passphrase');
        test.done();
    },
    testNoPassphrase: function(test) {
        util.read = function() {
            return json({
            });
        };
        test.throws(function() {
            var s = settings(process.env);
        });
        test.done()
    }
};
