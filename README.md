# notes

being a memory-extending device for bits of personal knowledge

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

## UI thoughts

### proposed CLI interface

	    $ note --connect notehost:noteport
		Passphrase? ...
		OK

        $ note http://someurl.com/somedoc.pdf
		# if internet
		OK

        $ note http://someurl.com/somedoc.pdf
		# if not internet
		LOCAL OK
		# then connect and...
		$ note --sync
		OK
		
		$ echo http://someuril.com/somedoc.pdf | note

### proposed browser

 * go to central site (or browser plugin.)
 * "connect notehost:noteport"
 * passphrase prompt
 * dest, pass stored in browser (cookie or whatever)
 * then js from any page can hit notehost (CORS)
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

Backend node.js server with http interface. consider a raw tcp
interface but note that security is an issue, there: ie how to
encrypt? research ssh encryption and see if you can do a pubkey
setup. but https is fine in the short term. start with
docstore. implement cli first. consider tests.

