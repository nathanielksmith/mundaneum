var path = require('path'),
fs = require('fs');

require('./util').extend(global, require('./util'));

// Defaults
PORTDEFAULT = 4073;
HOSTDEFAULT = 'localhost';

// Static settings
exports.HOME = process.env.HOME;
exports.MUNDANEUMPATH = path.join(exports.HOME, '.mundaneum');
exports.RCPATH = path.join(exports.MUNDANEUMPATH, 'mundaneumrc.json');
exports.STOREPATH = path.join(exports.MUNDANEUMPATH, 'doctore');
exports.SSLPATH = path.join(exports.MUNDANEUMPATH, 'ssl');
exports.KEYPATH = path.join(exports.SSLPATH, 'mundaneum.key');
exports.CERTPATH = path.join(exports.SSLPATH, 'mundaneum.cert');
exports.OPENSSLBIN = '/usr/bin/openssl';


// Dynamic settings
if (!stat(exports.RCPATH)) {
    throw exports.MUNDANEUMPATH + " must exist to minimally define a passphrase.";
}

var rc;
try {
    rc = JSON.parse(read(exports.RCPATH));
}
catch (e) {
    throw "error reading configuration file: " + e;
}

rc.local = rc.local || {};
rc.hosts = rc.hosts || [];
rc.federate = rc.federate || [];
rc.sync = rc.sync || [];

exports.PORT = rc.local.port || PORTDEFAULT;
exports.HOST = rc.local.host || HOSTDEFAULT;
exports.PASSPHRASE = rc.local.passphrase;

if (!exports.PASSPHRASE) {
    throw "a passphrase must be set in " + exports.RCPATH;
}


exports.HOSTS = {};
rc.hosts.forEach(function(triple) {
    if (triple.length !== 3) {
        throw "host definition must be a triple <label, domain:port, passphrase>";
    }
    var label = triple[0],
    hostport = triple[1].split(':'),
    passphrase = triple[2];
    
    var host = hostport[0];
    var port = hostport[1] || PORTDEFAULT;

    exports.HOSTS[label] = {
        host:host,
        port:port,
        passphrase: passphrase
    };
});

exports.FEDERATE = {};
rc.federate.forEach(function(pair) {
    var label = pair[0],
    filter = new RegExp(pair[1] || '.*');
    exports.FEDERATE[label] = {filter:filter};
});

exports.SYNC = {};
rc.sync.forEach(function(pair) {
    var label = pair[0],
    tag = pair[1] || '';
    exports.SYNC[label] = {tag:tag};
});
