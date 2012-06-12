var geeklist = require('./')

var gklst = geeklist.create({
    consumer_key: ''
  , consumer_secret: ''
  , api_server: 'http://sandbox-api.geeklist'
  , www_server: 'http://sandbox.geekli.st'
})

gklst.auth({
    token: ''
  , secret: ''
})

gklst.users('rekatz').micros()
