**Dependencies**: Install Node/NPM, bower and, grunt-cli globally.

`npm install`

`bower install`

#Development

`grunt preview` in one Terminal tab, `grunt watch` in a second. This will serve a dev web server and watch for further changes to the code.

#Production

`grunt build` - compiles, minified, uglifies and concatenates CSS, JS and HTML into `/dist` directory. This is what you need to serve to your punters.

Relies on the use of the [Loadshedding-api](https://github.com/richarcher/loadshedding-api) configured to currently run at `https://loadshedding-api.herokuapp.com/zone?long=X&lat=X`

