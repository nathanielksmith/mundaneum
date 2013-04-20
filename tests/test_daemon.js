var m = require('akeley'),
rewire = require('rewire');

var daemon = rewire('../daemon.js'),
u = require('../util.js');

exports.testEnsureSSL = {
    setUp: function(cb) {
        this.ensureSSL = daemon.__get__('ensureSSL');
        this.mockStat = m.create_func({return_value:false});
        this.mockMkdir = m.create_func();
        u.stat = this.mockStat;
        u.mkdir = this.mockMkdir;
        daemon.__set__('u', u);
        this.mockExec = m.create_func();
        daemon.__set__('exec', this.mockExec);
        cb();
    },
    testNoFilesExist: function(test) {
        this.ensureSSL('path0', 'path1', 'path2', 'path3', function() {});
        test.equal(this.mockMkdir.calls, 1);
        test.equal(this.mockExec.calls, 1);
        test.done();
    },
    testFilesExist: function(test) {
        this.mockStat.return_value = true;
        this.ensureSSL('path0', 'path1', 'path2', 'path3', function() {});
        test.ok(!this.mockMkdir.called);
        test.ok(!this.mockExec.called);
        test.done();
    },
};


//        this.mockStore = {
//            save: m.create_func({func:function(_, cb) {cb()}});
//        };
//        daemon.__set__('ds', this.mockStore);
//        this.mockFederate = m.create_func();
//        daemon.__set__('federate', this.mockFederate);
//        cb();

