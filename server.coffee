# # Requirements.
fs = require 'fs'
path = require 'path'
exec = (require 'child_process').exec
https = require 'https'
url = require 'url'

connect = require 'connect'
ds = require 'docstore'

# # Utility

# ## Logging
log = (args...) -> console.log.apply(console, args)
error = (args...) -> console.error.apply(console, args)

# ## fs
stat = fs.existsSync
mkdir = fs.mkdirSync

# ## General
applyFirst = (fn, arg) ->
    (args...) ->
        fn.apply @, [arg].concat(args)

applyLast = (fn, arg) ->
    (args...) ->
        fn.apply @, args.concat([arg])

map = (fn, lst) -> lst.map fn

compose = (fns...) ->
    fns.reduce (fnFst, fnSnd) ->
        (args...) -> fnFst fnSnd.apply(@, args)

type = (t, o) -> o instanceof t

Just = (@value) ->
Just::v = -> @value

None = (@errorMsg) ->
None::v = -> @errorMsg

isNone = applyFirst type, None

maybe = (fn) ->
    (args...) ->
        try
            return new Just fn.apply(@, args)
        catch e
            return new None e

# ## HTTP
end = (statusCode, res) ->
    res.writeHead statusCode
    res.end()

two = applyFirst end, 200
four = applyFirst end, 400
five = applyFirst end, 500

# # Actual application code.

extractPayload = (req) ->
    throw 'bad http method' unless req.method is 'POST'
    req.body
extractContent = (payload) ->
    log payload
    throw 'corrupt content' unless payload.content
    payload.content
verifyPayload = (passphrase, payload) ->
    throw 'passphrase mismatch' unless payload.passphrase is passphrase
    payload

addTimestamp = (req, note = {}) ->
    note.created = Date.now()
    note
addSourceUA = (req, note = {}) ->
    if req.headers?['user-agent']?
        note.ua = req.headers['user-agent']
    note
addSourceType = (req, note) ->
    maybePayload = maybe(extractPayload) req
    if isNone maybePayload
        return note
    payload = maybePayload.v()
    if payload.sourceType?
        note.sourceType = payload.sourceType
    note

serveRequest = (store, passphrase) ->
    (req, res) ->
        log 'request made'
        maybeContent = maybe(
            compose(
                extractContent,
                applyFirst(verifyPayload, passphrase),
                extractPayload
            )
        ) req
        if isNone maybeContent
            four res
            return error maybeContent.v()
        content = maybeContent.v()
        log content
        #note = compose(
        #    map(applyLast(applyFirst, req), [
        #        addTimestamp,
        #        addSourceUA,
        #        addSourceType
        #        # additional/future metadata goes here
        #    ])
        #) content:content
        note = compose(
                applyFirst(addTimestamp, req),
                applyFirst(addSourceUA, req),
                applyFirst(addSourceType, req),
                # additional/future metadata goes here
        ) content:content
        store.save note, (err, doc) ->
            if err
                five res
                error err
            else
                two res

serve = (store, ssl, passphrase, port = 4073, host = 'localhost') ->
    server = connect(ssl)
        .use(connect.bodyParser())
        .use(serveRequest(store, passphrase))
    https.createServer(ssl, server).listen(port, host)
    log 'listening'
    return server

connectDocstore = (storePath, cb) ->
    ds.open storePath, (err, store) ->
        if err
            throw err
        else
            cb store

ensureMundaneumDir = (mundaneumPath) ->
    unless stat mundaneumPath
        mkdir mundaneumPath

ensureSSL = (openSSLBin, sslPath, keyPath, certPath, cb) ->
    unless stat(sslPath)
        mkdir sslPath

    if stat(keyPath) and stat(certPath)
        return cb()

    generateSSL = applyFirst exec, "#{openSSLBin} req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj '/C=US/ST=Denial/L=Springfield/O=Dis/CN=mundaneum' -keyout #{keyPath} -out #{certPath}"

    return generateSSL cb

# # Driver function.
HOME = process.env.HOME
MUNDANEUMPATH = path.join HOME, '.mundaneum'
STOREPATH = path.join MUNDANEUMPATH, 'docstore'
PASSPHRASE = 'secret'
SSLPATH = path.join MUNDANEUMPATH, 'ssl'
KEYPATH = path.join SSLPATH, 'mundaneum.key'
CERTPATH = path.join SSLPATH, 'mundaneum.crt'
OPENSSLBIN = '/usr/bin/openssl'

main = (storePath = STOREPATH, port = 4073, host = 'localhost') ->
    ensureMundaneumDir(MUNDANEUMPATH)
    ensureSSL OPENSSLBIN, SSLPATH, KEYPATH, CERTPATH, (e) ->
        return error(e) if e
        ssl =
            key: fs.readFileSync KEYPATH
            cert: fs.readFileSync CERTPATH
        connectDocstore storePath, (store) ->
            serve store, ssl, PASSPHRASE, port, host

main()