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
                },
                hosts: [
                    ["sylvia", "sylvia:4078", "secrot"],
                    ["lambda_wiki", "lambdaphil.es:7768", "screret"],
                    ["earlham", "quark.cs.earlham.edu:5667", "screerit"]
                ],
                federate: [
                    ['sylvia'],
                    ['lambda_wiki', '#lwiki']
                ],
                sync: [
                    ['sylvia'],
                    ['earlham', '#earlham']
                ]
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
            settings(process.env);
        });
        test.done()
    },
    testBadRCPath: function(test) {
        util.stat = function() { return false }
        test.throws(function() {
            settings(process.env);
        });
        test.done();
    },
    testHostParsing: function(test) {
        var s = settings(process.env);
        test.deepEqual(s.HOSTS, {
            sylvia: {
                host: "sylvia",
                port: 4078,
                passphrase: "secrot"
            },
            lambda_wiki: {
                host: "lambdaphil.es",
                port: 7768,
                passphrase: "screret"
            },
            earlham: {
                host: "quark.cs.earlham.edu",
                port: 5667,
                passphrase: "screerit"
            }
        });

        test.done();
    },
    testFederateParsing: function(test) {
        var s = settings(process.env);
        test.equal(s.FEDERATE[0].label, 'sylvia');
        test.equal(s.FEDERATE[1].label, 'lambda_wiki');
        test.equal(s.FEDERATE[0].filter.toString(), '/.*/');
        test.equal(s.FEDERATE[1].filter.toString(), '/#lwiki/');
        test.done();
    },
    testSyncParsing: function(test) {
        var s = settings(process.env);
        test.deepEqual(s.SYNC, [
            {label:'sylvia', tag:''},
            {label:'earlham', tag:'#earlham'}
        ]);
        test.done();
    }
};
