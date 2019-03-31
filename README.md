# xml-viewer

This is a simple XML viewer I wrote to play around with **Vue.js**.

One of the self-imposed limitations on this viewer was that it needed to work when run from the filesystem (w/o requiring a local web server to be setup, just served using `file://`), which meant that there were certain limitations to how the the library could be referenced.

The browser security model apparently does not allow script libraries to be pulled in via `module` references when serving up the files using the `file://` scheme, so the **Vue.js** library had to be pulled in using a `script` tag in the HTML file and my source scripts files couldn't use `module` references either.

This is less than optimal and I would have preferred to be able to use the `module` syntax, but I did not want to budge on the ability to run this locally w/o a web server, so that was the compromise I made.

As for the appearance and interface, it *is* very bare and basic, but again I created this for my own use to play around with **Vue.js** and not for others to use. It is up here on Github purely for visiblity purposes as a simple **Vue.js** example.
