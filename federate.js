var client = require('./client'),
settings = require('./settings')(process.env),
util = require('./util');

util.extend(global, require('./util'));

var _postTo = function(noteContent, label) {
    var port = settings.HOSTS[label].port;
    var host = settings.HOSTS[label].host;
    var passphrase = settings.HOSTS[label].passphrase;
    client.postNote(port, host, passphrase, noteContent);
}

var federate = function(noteContent) {
    var match = function(s, r) { return s.match(r) }
    var matchFilter = compose(
        applyFirst(match, noteContent),
        applyFirst(getWith, 'filter')
    );
    var extractLabel = compose(
        applyFirst(get, settings.HOST),
        applyFirst(getWith, 'label')
    );
    var labels = settings.FEDERATE
        .filter(matchFilter)
        .map(extractLabel);

    labels.forEach(applyFirst(_postTo, noteContent));
}

module.exports = function(noteContent, cb) {
    process.nextTick(function() {
        federate(noteContent);
    });
}
