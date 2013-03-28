var exec = require('child_process').exec,
https = require('https');

var connect = require('connect'),
ds = require('docstore');

var util = require('./util'),
types = require('./types');

util.extend(global, util, types);


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
    var maybePayload = maybe(extractPayload)(request);
    if (type(None, maybePayload)) {
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
        log('request made');
        var maybeContent = maybe(compose(
                extractContent,
                applyFirst(verifyPayload, passphrase),
                extractPayload
        ))(request);
        log(maybeContent);
        if (type(None, maybeContent)) {
            four(response);
            return error(maybeContent.v());
        }

        var content = maybeContent.v();

        log(content);

        var note = compose(
            applyFirst(addTimestamp, request),
            applyFirst(addSourceUA, request),
            applyFirst(addSourceType, request)
        )({content:content});

        saveNote(store, note, function(err) {
            if (!err) return two(response);
            five(response);
            error(err);
        });
    };
};

exports.serve = function(store, ssl, passphrase, port, host) {
    var app = connect(ssl)
        .use(connect.bodyParser())
        .use(requestServer(store, passphrase));
    https.createServer(ssl, app).listen(port, host);
    log('listening at', host, port);
    return app;
};

exports.connectDatastore = function(storePath, cb) {
    ds.open(storePath, function(err, store) {
        if (err) throw(err);
        else cb(store);
    });
};

exports.ensureMundaneumDir = function(mundaneumPath) {
    if (!stat(mundaneumPath)) mkdir(mundaneumPath);
};

exports.ensureSSL = function(openSSLBin, sslPath, keyPath, certPath, cb) {
    if (!stat(sslPath)) mkdir(sslPath);
    if (stat(keyPath) && stat(certPath)) return cb();
    var generateSSL = applyFirst(exec, openSSLBin+" req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj '/C=US/ST=Denial/L=Springfield/O=Dis/CN=mundaneum' -keyout "+keyPath+" -out "+certPath);
    return generateSSL(cb);
};
