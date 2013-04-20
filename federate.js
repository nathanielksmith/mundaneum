var client = require('./client'),
settings = require('./settings')(process.env),
util = require('./util');

util.extend(global, require('./util'));

var _postTo = function(noteContent, destination) {
    var port = destination.port;
    var host = destination.host;
    var passphrase = destination.passphrase;
    client.postNote(port, host, passphrase, noteContent);
}

var federate = function(noteContent) {
    var match = function(s, r) { return Boolean(s.match(r)) }
    var matchFilter = compose(
        applyFirst(match, noteContent),
        applyFirst(getWith, 'filter')
    );
    var extractLabel = compose(
        applyFirst(get, settings.HOSTS),
        applyFirst(getWith, 'label')
    );
    var labels = map(extractLabel, filter(matchFilter, settings.FEDERATE));

    labels.forEach(applyFirst(_postTo, noteContent));
}

module.exports = function(noteContent, cb) {
    process.nextTick(function() {
        federate(noteContent);
    });
}
