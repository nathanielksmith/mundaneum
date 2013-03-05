# # Requirements.
fs = require 'fs'
http = require 'http'
path = require 'path'
url = require 'url'

ds = require 'docstore'

# # Utility

# ## Logging
log = (args...) -> console.log.apply(console, args)
error = (args...) -> console.error.apply(console, args)

# ## General
applyFirst = (fn, arg) ->
    (args...) ->
        fn.apply @, [arg].concat(args)

compose = (fnFst, fnSnd) ->
    (args...) -> fnFst fnSnd.apply(@, args)

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

extractPayload = (req) -> req.url[1..]
extractNote = JSON.parse
verifyNote = (passphrase, note) ->
    #throw 'passphrase mismatch' unless note.passphrase is passphrase
    note
# TODO verifyNote
serveRequest = (store, passphrase) ->
    (req, res) ->
        log 'attempt', req.url
        maybeNote = maybe(
            compose(
                applyFirst(verifyNote, passphrase),
                extractNote,
                extractPayload
            )
        ) req
        if type None, maybeNote
            four res
            return error maybeNote.v()
        note = maybeNote.v()
        store.save note, (err, doc) ->
            if err
                five res
                error err
            else
                two res

serve = (store, passphrase, port = 4073, host = 'localhost') ->
    server = http.createServer(serveRequest(store, passphrase))
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