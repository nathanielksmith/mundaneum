http = require 'http'
url = require 'url'

two = (res) ->
    res.writeHead 200
    res.end()

four = (res) ->
    res.writeHead 400
    res.end()

log = (args...) -> console.log.apply(console, args)
error = (args...) -> console.error.apply(console, args)

extractPayload = (req) -> req.url[1..]
extractNote = JSON.parse

server = http.createServer (req, res) ->
    log 'connected'
    
    try
        log 'attempt', req.url
        log extractNote extractPayload req
    catch e
        error 'fail', e
        return four res

    log 'ok'
    two res

server.listen 4073
log 'listening'
