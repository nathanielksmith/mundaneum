#!/usr/bin/env node

var path = require('path'),
optimist = require('optimist'),
request = require('request');

var client = require('./client'),
daemon = require('./daemon'),
settings = require('./settings')(process.env),
u = require('./util.js');

var mkStorePath = function(root, label) {
    return path.join(root, label);
};

(function main(argv, rawArgv) {
    var hostLabel = argv.label || argv.l || 'local';
    var hostObj = settings.HOSTS[hostLabel];

    if (!hostObj) {
        return u.error('no such label');
    }

    if (argv.start || argv.s) {
        return daemon.ensureServer(
            hostObj.passphrase,
            hostObj.port,
            hostObj.host,
            settings.MUNDANEUMPATH,
            mkStorePath(settings.STOREPATH, hostLabel),
            settings.OPENSSLBIN,
            settings.SSLPATH,
            settings.KEYPATH,
            settings.CERTPATH,
            function(err) { if (err) return u.error(err) }
        );
    }

    var content = u.join(' ',
        u.skipUntil(u.applyFirst(u.match, /^[^-]/), rawArgv.slice(2))
    );


    client.postNote(hostObj.port, hostObj.host, hostObj.passphrase, content);
})(optimist.argv, process.argv);
