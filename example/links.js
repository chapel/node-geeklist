var geeklist = require('../')

var gklst = geeklist.create({
    consumer_key: ''
  , consumer_secret: ''
//  , api_server: 'http://sandbox-api.geeklist'
//  , www_server: 'http://sandbox.geekli.st'
})

gklst.auth({
    token: ''
  , secret: ''
})

// display popular links
console.log(gklst.links())

// get my own links
console.log(gklst.user().links())

// get links from a user
console.log(gklst.users('chapel').links())

// create a new link
/*
gklst.links().create({
  url: url,
  title: title
  }, function(err, data) {
});
*/
