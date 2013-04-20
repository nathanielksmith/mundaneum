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

exports.testEnsureDir = {
    setUp: function(cb) {
        this.ensureMundaneumDir = daemon.__get__('ensureMundaneumDir');
        this.mockStat = m.create_func({return_value:false});
        this.mockMkdir = m.create_func();
        u.stat = this.mockStat;
        u.mkdir = this.mockMkdir;
        daemon.__set__('u', u);
        cb();
    },
    testNoDir: function(test) {
        this.ensureMundaneumDir();
        test.equal(this.mockMkdir.calls, 1);
        test.done();
    },
    testDirExists: function(test) {
        this.mockStat.return_value = true;
        this.ensureMundaneumDir();
        test.ok(!this.mockMkdir.called);
        test.done();
    }
};

exports.testConnectDataStore = {
    setUp: function(cb) {
        this.connectDatastore = daemon.__get__('connectDatastore');
        this.mockOpen = m.create_func();
        daemon.__set__('ds', {
            open: this.mockOpen
        });
        cb();
    },
    testSuccess: function(test) {
        test.expect(2);
        this.mockOpen.func = function(path, cb) {
            cb(null, 'store');
        };

        this.connectDatastore('path', function(err, store) {
            test.ok(!err);
            test.equal(store, 'store');
            test.done();
        });
    },
    testFailure: function(test) {
        test.expect(1);
        this.mockOpen.func = function(path, cb) {
            cb('error');
        };
        this.connectDatastore('path', function(err, store) {
            test.equal(err, 'error');
            test.done();
        });
    }
};

exports.testRequestServer = {
    setUp: function(cb) {
        this.mockSave = m.create_func({func:function(note, cb) {
            cb(null);
        }})
        this.mockStore = {save:this.mockSave};
        this.requestServer = daemon.__get__('requestServer')(
            this.mockStore, 'secret'
        );
        u.log = m.create_func();
        u.error = m.create_func();
        u.four = m.create_func();
        u.five = m.create_func();
        u.two = m.create_func();
        daemon.__set__('u', u);
        cb();
    },
    testBadPassphrase: function(test) {
        this.requestServer({
            method:'POST',
            body: {
                content: 'hello world',
                passphrase: 'bad boom'
            }
        }, {});
        test.equal(u.four.calls, 1);
        test.equal(u.error.calls, 1);
        test.ok(!this.mockSave.called);
        test.ok(!u.two.called);

        test.done();
    },
    testBadPayload: function(test) {
        this.requestServer({
            method:'POST',
        }, {});
        test.equal(u.four.calls, 1);
        test.equal(u.error.calls, 1);
        test.ok(!this.mockSave.called);
        test.ok(!u.two.called);
        test.done();
    },
    testBadContent: function(test) {
        this.requestServer({
            method:'POST',
            body: {
                passphrase: 'secret'
            }
        }, {});
        test.equal(u.four.calls, 1);
        test.equal(u.error.calls, 1);
        test.ok(!this.mockSave.called);
        test.ok(!u.two.called);
        test.done();
    },
    testStoreError: function(test) {
        this.mockSave.func = function(_, cb) {
            cb('error');
        };
        this.requestServer({
            method:'POST',
            body: {
                content: 'hello there',
                passphrase: 'secret'
            }
        }, {});

        test.ok(!u.two.called);
        test.ok(!u.four.called);
        test.equal(u.five.calls, 1);
        test.equal(u.error.args[0][0], 'error');

        test.done();
    },
    testSuccess: function(test) {
        this.requestServer({
            method:'POST',
            body: {
                content: 'hello there',
                passphrase: 'secret'
            }
        }, {});

        test.equal(u.two.calls, 1);
        test.ok(!u.four.called);
        test.ok(!u.five.called);
        test.done();
    }
};

exports.testAddSourceType = {
    setUp: function(cb) {
        this.addSourceType = daemon.__get__('addSourceType');
        cb();
    },
    testFound: function(test) {
        var note = this.addSourceType({
            method: 'POST',
            body: {
                sourceType:'type'
            }
        }, {content:'hello'});

        test.equal(note.content, 'hello');
        test.equal(note.sourceType, 'type');

        test.done();
    },
    testNotFound: function(test) {
        var note = this.addSourceType({
            method: 'POST',
            body: {
            }
        }, {content:'hello'});

        test.equal(note.content, 'hello');
        test.ok(!note.sourceType);

        test.done();
    }
};
