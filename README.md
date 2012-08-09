node-geeklist
=============

Geekli.st API wrapper for Node.js

```javascript
var geeklist = require('geeklist')
  , gklst = geeklist.create({
		    consumer_key: ''    // omit to use process.env.GEEKLIST_CONSUMER_KEY
		  , consumer_secret: '' // omit to use process.env.GEEKLIST_CONSUMER_SECRET
		  , access_token: ''    // omit to use process.env.GEEKLIST_ACCESS_TOKEN
		  , access_secret: ''   // omit to use process.env.GEEKLIST_ACCESS_SECRET
		  , api_server: 'http://sandbox-api.geeklist'
		  , www_server: 'http://sandbox.geekli.st'
		});

gklst.users('rekatz').micros();
```