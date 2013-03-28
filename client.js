var request = require('request');
require('./util').extend(global, require('util'));

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
        if (err) error(err)
    });
};
