var exec = require('child_process').exec,
https = require('https');

var connect = require('connect'),
ds = require('docstore');

var federate = require('./federate.js'),
sync = require('./sync.js'),
types = require('./types'),
u = require('./util');

var extractPayload = function(request) {
    if (request.method !== 'POST')
        throw('bad http method');
    return request.body;
};
var extractContent = function(payload) {
    if (!payload.content)
        throw('corrupt content');
    return payload.content;
};
var verifyPayload = function(passphrase, payload) {
    if (payload.passphrase !== passphrase)
        throw('passphrase mismatch');
    return payload
};

var addTimestamp = function(request, note) {
    note.created = Date.now();
    return note;
};
var addSourceUA = function(request, note) {
    if (request.headers && request.headers['user-agent']) {
        note.ua = request.headers['user-agent'];
    }
    return note;
};
var addSourceType = function(request, note) {
    var maybePayload = u.maybe(extractPayload)(request);
    if (types.type(types.None, maybePayload)) {
        return note;
    }
    var payload = maybePayload.v();
    if (payload.sourceType) {
        note.sourceType = payload.sourceType;
    }
    return note;
};

var saveNote = function(store, note, cb) {store.save(note, cb);}

var requestServer = function(store, passphrase) {
    return function(request, response) {
        u.log('request made');
        var maybeContent = u.maybe(u.compose(
                extractContent,
                u.applyFirst(verifyPayload, passphrase),
                extractPayload
        ))(request);
        u.log(maybeContent);
        if (types.type(types.None, maybeContent)) {
            u.four(response);
            return u.error(maybeContent.v());
        }

        var content = maybeContent.v();

        u.log(content);

        var note = u.compose(
            u.applyFirst(addTimestamp, request),
            u.applyFirst(addSourceUA, request),
            u.applyFirst(addSourceType, request)
        )({content:content});

        saveNote(store, note, function(err) {
            if (!err) return u.two(response);
            u.five(response);
            u.error(err);
        });
    };
};

var serve = function(store, ssl, passphrase, port, host) {
    var app = connect(ssl)
        .use(connect.bodyParser())
        .use(requestServer(store, passphrase));
    https.createServer(ssl, app).listen(port, host);
    u.log('listening at', host, port);
    return app;
};

var connectDatastore = function(storePath, cb) {
    ds.open(storePath, function(err, store) {
        if (err) return cb(err);
        else cb(null, store);
    });
};

var ensureMundaneumDir = function(mundaneumPath) {
    if (!u.stat(mundaneumPath)) u.mkdir(mundaneumPath);
};

var ensureSSL = function(openSSLBin, sslPath, keyPath, certPath, cb) {
    if (!u.stat(sslPath)) u.mkdir(sslPath);
    if (u.stat(keyPath) && u.stat(certPath)) return cb();
    var generateSSL = u.applyFirst(exec, openSSLBin+" req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj '/C=US/ST=Denial/L=Springfield/O=Dis/CN=mundaneum' -keyout "+keyPath+" -out "+certPath);
    return generateSSL(cb);
};

exports.ensureServer = function(passphrase, port, host, mundaneumPath, storePath, openSSLBin, sslPath, keyPath, certPath, cb) {
    ensureMundaneumDir(mundaneumPath);
    ensureSSL(openSSLBin, sslPath, keyPath, certPath, function(err) {
        if (err) return cb(err);
        connectDatastore(storePath, function(err, store) {
            if (err) return cb(err);
            serve(store, {key:u.read(keyPath), cert: u.read(certPath)}, passphrase, port, host);
            return cb();
        });
    });
};
