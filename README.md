VelvetSpider
===========
VelvetSpider is a web application that provides a common query interface and single API to multiple APIs across different services. Services are configured via drop-in schemas in JSON format.

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
* Download and install [node.js](http://nodejs.org)
* Clone the repo, run npm install and bower install 
```sh
git clone https://github.com/binoculars/VelvetSpider.git VelvetSpider
cd VelvetSpider
npm install
```
* Configure tokens and database
```sh
cp config/auth.js config/authLocal.js
cp config/database.js config/databaseLocal.js
```
* Fill out the token information in the local config files.
* Start the server
```sh
./bin/www
```
* Open [Chrome](https://www.google.com/chrome/browser/) and browse to http://localhost:3000/
