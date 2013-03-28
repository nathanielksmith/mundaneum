#!/usr/bin/env node

var path = require('path');

var daemon = require('./daemon'),
util = require('./util');
util.extend(global, util);

var HOME = process.env.HOME,
MUNDANEUMPATH = path.join(HOME, '.mundaneum'),
STOREPATH = path.join(MUNDANEUMPATH, 'doctore'),
SSLPATH = path.join(MUNDANEUMPATH, 'ssl'),
KEYPATH = path.join(SSLPATH, 'mundaneum.key'),
CERTPATH = path.join(SSLPATH, 'mundaneum.cert'),
OPENSSLBIN = '/usr/bin/openssl',
PASSPHRASE = 'secret',
PORT = 4073,
HOST = 'localhost';

(function main(argv) {
    daemon.ensureMundaneumDir(MUNDANEUMPATH);
    if (argv.length <= 2) {return error('usage: TODO');}
    if (argv[2].match(/-s|--start/)) 
        return daemon.ensureSSL(OPENSSLBIN, SSLPATH, KEYPATH, CERTPATH, function(err) {
            if (err) return error(e);
            var ssl = {key: read(KEYPATH), cert: read(CERTPATH)};
            daemon.connectDatastore(STOREPATH, applyRight(daemon.serve, ssl, PASSPHRASE, PORT, HOST));
    });
})(process.argv);
