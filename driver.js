#!/usr/bin/env node

var path = require('path'),
request = require('request');

var client = require('./client'),
daemon = require('./daemon'),
settings = require('./settings');
require('./util').extend(global, require('./util'));

(function main(argv) {
    if (argv.length <= 2) {return error('usage: TODO');}

    if (argv[2].match(/-s|--start/)) {
        return daemon.ensureServer(
            settings.PASSPHRASE,
            Number(argv[3]) || settings.PORT,
            settings.HOST,
            settings.MUNDANEUMPATH,
            settings.STOREPATH,
            settings.OPENSSLBIN,
            settings.SSLPATH,
            settings.KEYPATH,
            settings.CERTPATH,
            function(err) { if (err) return error(err) }
        );
    }

    var content = argv.slice(2).join(' ');
    client.postNote(PORT, HOST, PASSPHRASE, content);
})(process.argv);
