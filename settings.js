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

var processHosts = applyArg(arity(3)(function(label, hostport, passphrase) {
    hostport = hostport.split(':');
    return [label, {
        host:hostport[0],
        port:hostport[1] || PORTDEFAULT,
        passphrase: passphrase
    }];
}));
exports.HOSTS = compose(tuples2obj, applyFirst(map, processHosts))(rc.hosts);

var processFederate = applyArg(function(label, filter) {
    return [label, {filter:new RegExp(filter || '.*')}];
});
exports.FEDERATE = compose(tuples2obj, applyFirst(map, processFederate))(rc.federate);

var processSync = applyArg(function(label, tag) {
    return [label, {tag: tag || ''}];
});
exports.SYNC = compose(tuples2obj, applyFirst(map, processSync))(rc.sync);
