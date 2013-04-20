var path = require('path');

var u = require('./util.js');

// Defaults
PORTDEFAULT = 4073;
HOSTDEFAULT = 'localhost';

var e = function(env) {
    // Static settings
    e.OPENSSLBIN = '/usr/bin/openssl';
    e.HOME = env.HOME;
    e.MUNDANEUMPATH = path.join(e.HOME, '.mundaneum');
    e.RCPATH = path.join(e.MUNDANEUMPATH, 'mundaneumrc.json');
    e.STOREPATH = path.join(e.MUNDANEUMPATH, 'doctore');
    e.SSLPATH = path.join(e.MUNDANEUMPATH, 'ssl');
    e.KEYPATH = path.join(e.SSLPATH, 'mundaneum.key');
    e.CERTPATH = path.join(e.SSLPATH, 'mundaneum.cert');
    
    // Dynamic settings
    if (!u.stat(e.RCPATH)) {
        throw e.MUNDANEUMPATH + " must exist to minimally define a passphrase.";
    }
    
    var rc;
    try {
        rc = JSON.parse(u.read(e.RCPATH));
    }
    catch (e) {
        throw "error reading configuration file: " + e;
    }
    
    rc.local = rc.local || {};
    rc.hosts = rc.hosts || [];
    rc.federate = rc.federate || [];
    rc.sync = rc.sync || [];
    
    e.PORT = rc.local.port || PORTDEFAULT;
    e.HOST = rc.local.host || HOSTDEFAULT;
    e.PASSPHRASE = rc.local.passphrase;
    
    if (!e.PASSPHRASE) {
        throw "a passphrase must be set in " + e.RCPATH;
    }
    
    var processHost = u.applyArg(u.arity(3)(function(label, hostport, passphrase) {
        hostport = hostport.split(':');
        return [label, {
            host:hostport[0],
            port:Number(hostport[1] || PORTDEFAULT),
            passphrase: passphrase
        }];
    }));
    e.HOSTS = u.tuples2obj(u.map(processHost, rc.hosts));
    
    var processFederate = u.applyArg(function(label, filter) {
        return {label:label, filter:new RegExp(filter || '.*')};
    });
    e.FEDERATE = u.map(processFederate, rc.federate);
    
    var processSync = u.applyArg(function(label, tag) {
        return {label: label, tag: tag || ''};
    });
    e.SYNC = u.map(processSync, rc.sync);

    return e
};

module.exports = e; 
