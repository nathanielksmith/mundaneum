# # Requirements.
fs = require 'fs'
http = require 'http'
path = require 'path'
url = require 'url'

connect = require 'connect'
ds = require 'docstore'

# # Utility

# ## Logging
log = (args...) -> console.log.apply(console, args)
error = (args...) -> console.error.apply(console, args)

# ## General
id = (x) -> x
applyFirst = (fn, arg) ->
    (args...) ->
        fn.apply @, [arg].concat(args)

compose = (fns...) ->
    _compose = (fnFst, fnSnd) ->
        (args...) -> fnFst fnSnd.apply(@, args)
    reduced = fns.reduce(_compose)
    (outer_args...) ->
        reduced.apply(@, outer_args)

type = (t, o) -> o instanceof t

Just = (@value) ->
Just::v = -> @value

None = (@errorMsg) ->
None::v = -> @errorMsg

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
    throw 'corrupt content' unless payload.content
    payload.content
verifyPayload = (passphrase, payload) ->
    throw 'passphrase mismatch' unless payload.passphrase is passphrase
    payload
# TODO verifyNote
serveRequest = (store, passphrase) ->
    (req, res) ->
        maybeContent = maybe(
            compose(
                extractContent,
                applyFirst(verifyPayload, passphrase),
                extractPayload
            )
        ) req
        if type None, maybeContent
            four res
            return error maybeContent.v()
        content = maybeNote.v()
        note = content:content
        store.save note, (err, doc) ->
            if err
                five res
                error err
            else
                two res

serve = (store, passphrase, port = 4073, host = 'localhost') ->
    server = connect()
        .use(connect.bodyParser())
        .use(serveRequest(store, passphrase))
    server.listen(port, host)
    return server

connectDocstore = (storePath, cb) ->
    ds.open storePath, (err, store) ->
        if err
            throw err
        else
            cb store

ensureNotesDir = (notesPath) ->
    unless fs.existsSync(notesPath)
        fs.mkdirSync(notesPath)

# # Driver function.
HOME = process.env.HOME
NOTESPATH = path.join HOME, '.notes'
STOREPATH = path.join NOTESPATH, 'docstore'
PASSPHRASE = 'secret'
main = (storePath = STOREPATH, port = 4073, host = 'localhost') ->
    ensureNotesDir(NOTESPATH)
    connectDocstore storePath, (store) ->
        serve store, PASSPHRASE, port, host

main()