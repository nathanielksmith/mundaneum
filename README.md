# mundaneum

being a memory-extending device for bits of personal knowledge. More simply, a private microblogger.

## NOTE

this is 100% half-in-brain WIP code. It is mostly pipe dreams. Do not use
unless you want to contribute.

## motivation

twitter is convenient. or, more generally, microblogging is
convenient. simply popping open a prompt from anywhere, somehow
authenticating, jotting some words, and then having that note saved in
perpetuity on your behalf is highly useful. Twitter, however, as well
as sites such as identi.ca, have some extra features and
anti-features: non-personal cloud ownership, a limited api, and lack
of privacy (this last one is both a feature and and anti-feature
depending on your interpretation of the word).

From this brick of prose we can extract some features that are _useful_:

 * "anywhere" access
   * phone, browser, terminal
 * security
   * encryption, obfuscation
 * archival
   * remote backup
 * search
 * private
   * self-hosted. one IP -> person.

## Architecture

all notes are saved to localhost; a client request (browser, cli) will
never make an external request.

question: do we need to use http/networking locally? i think so; a
client library ties you to a specific language. always using http
means client can be any language / server can be any language. it's
also less code: the server that the local client talks to is identical
to a server receiving federated notes.

question: what config format? this matters. i am reluctant to use json but ehhh. fine for now.

## UI thoughts

### proposed CLI interface

        $ mundaneum --connect notehost:noteport
        Passphrase? ...
        OK

        $ mundaneum http://someurl.com/somedoc.pdf
        # if internet
        OK

        $ mundaneum http://someurl.com/somedoc.pdf
        # if not internet
        LOCAL OK
        # then connect and...
        $ mundaneum --sync
        OK

        $ echo http://someuril.com/somedoc.pdf | mundaneum

### proposed browser

 * go to central site (or browser plugin.)
 * "connect mundaneumhost:mundaneumport"
 * passphrase prompt
 * dest, pass stored in browser (cookie or whatever)
 * then js from any page can hit mundaneumhost (CORS)
 * https only (self-signed should be fine). payload is something like:
            {"passphrase":"...", "content":..., "source":"browser|cli|phone"}

### proposed phone

 * "share" intent for anything textually shareable
 * same approach as browser

## display/extraction

Initially, a basic grep functionality is fine: it's all text,
anyway. Ideally a plugin architecture will look at the text and
categorize it.

### Metadata

Timestamp created. Source IP.

## Development Plan

Backend node.js server with https interface. start with
docstore. implement cli first. consider tests.

