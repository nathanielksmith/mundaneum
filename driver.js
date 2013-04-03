#!/usr/bin/env node

var path = require('path'),
request = require('request');

var daemon = require('./daemon'),
client = require('./client');

require('./util').extend(global, require('./util'));

var HOME = process.env.HOME,
MUNDANEUMPATH = path.join(HOME, '.mundaneum'),
STOREPATH = path.join(MUNDANEUMPATH, 'doctore'),
SSLPATH = path.join(MUNDANEUMPATH, 'ssl'),
KEYPATH = path.join(SSLPATH, 'mundaneum.key'),
CERTPATH = path.join(SSLPATH, 'mundaneum.cert'),
OPENSSLBIN = '/usr/bin/openssl',
PASSPHRASE = 'secret',
PIDPATH = path.join(MUNDANEUMPATH, 'server.pid'),
PORT = 4073,
HOST = 'localhost';

(function main(argv) {
    if (argv.length <= 2) {return error('usage: TODO');}

    if (argv[2].match(/-s|--start/))
        return daemon.ensureServer(
            PASSPHRASE,
            PORT,
            HOST,
            MUNDANEUMPATH,
            STOREPATH,
            OPENSSLBIN,
            SSLPATH,
            KEYPATH,
            CERTPATH,
            PIDPATH,
            function(err) { if (err) return error(err) }
        );

    var content = argv.slice(2).join(' ');
    client.postNote(PORT, HOST, PASSPHRASE, content);
})(process.argv);
