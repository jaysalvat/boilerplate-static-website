## Install

First install [NodeJs](https://nodejs.org/en/download/).

Then install dependencies.

    npm install

Then init the app

    npm run init

## Developement

Build and watch

    gulp

Watch and open server

    gulp watch

Watch and open server on another port

    gulp watch --port 3010

Watch and open server with no sync between browers

    gulp watch --nosync

Generate pages or partials from templates

    plop

## Production

Build the website with minified CSS / HTML and scripts to the /dist folder.

    gulp build --production

Deploy the /dist content on the server.
