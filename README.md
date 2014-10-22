VelvetSpider
===========
VelvetSpider is a web application that provides a common query interface and single API to multiple APIs across different services.

Why the name?
-------------
[Velvet spiders](http://en.wikipedia.org/wiki/Velvet_spider) (Eresidae) are *social* family of spiders. Spiders *crawl* the *web*. Plus, it just sounds cool.

Framework
---------
* [Node.js](http://nodejs.org)
* [Express](http://expressjs.com/)
* [Polymer](https://www.polymer-project.org/)

Installation
--------------
1. Download and install [node.js](http://nodejs.org)
1. 
```sh
git clone https://github.com/binoculars/VelvetSpider.git VelvetSpider
cd VelvetSpider
npm install
bower install
```
1. 
##### Configure tokens
```sh
cp config/auth.js config/authLocal.js
cp config/userTokens.js config/userTokensLocal.js
```
1. Fill out the token information in the local config files.
1. Start the server
```sh
./bin/www
```
1. Open [Chrome](https://www.google.com/chrome/browser/) and browse to http://localhost:3000/
