var request = require('request');
var u = require('./util.js');

var createPayload = function(content, passphrase) {
    return {
        content: content,
        passphrase: passphrase,
        sourceType: 'mundaneum client'
    };
};

exports.postNote = function(port, host, passphrase, content) {
    var payload = createPayload(content, passphrase);
    request({
        method: 'POST',
        headers: {
            'content-type':'application/json'
        },
        body: JSON.stringify(payload),
        uri: 'https://'+host+':'+port,
    }, function(err, response, body) {
        if (err) u.error(err)
        // TODO log success
    });
};
