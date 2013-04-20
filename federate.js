var client = require('./client'),
u = require('./util');


var _postTo = function(noteContent, destination) {
    var port = destination.port;
    var host = destination.host;
    var passphrase = destination.passphrase;
    client.postNote(port, host, passphrase, noteContent);
}

var _federate = function(noteContent, hosts, federate) {
    var match = function(s, r) { return Boolean(s.match(r)) }
    var matchFilter = u.compose(
        u.applyFirst(match, noteContent),
        u.applyFirst(u.getWith, 'filter')
    );
    var extractLabel = u.compose(
        u.applyFirst(u.get, hosts),
        u.applyFirst(u.getWith, 'label')
    );
    var labels = u.map(extractLabel, u.filter(matchFilter, federate));

    labels.forEach(u.applyFirst(_postTo, noteContent));
}

module.exports = function(noteContent, hosts, federate) {
    process.nextTick(function() {
        _federate(noteContent, hosts, federate);
    });
}
