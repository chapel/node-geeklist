var OAuth = require('oauth').OAuth

var Geeklist = function (options) {
  this.options = options

  this.consumer = {
      key    : options.consumer_key
    , secret : options.consumer_secret
  }

  if (options.access_token && options.access_secret) {
    this.access = {
        token: options.access_token
      , secret: options.access_secret
    }
  }

  this.usePin = options.usePin || false

  this.callback = options.callback

  this.apiServer = options.api_server || 'http://api.geekli.st'
  this.wwwServer = options.www_server || 'http://geekli.st'

  var requestUrl = this.apiServer + '/v1/oauth/request_token'
  var accessUrl = requestUrl.replace('request', 'access')

  this.client = new OAuth(
      requestUrl
    , accessUrl
    , this.consumer.key
    , this.consumer.secret
    , '1.0A'
    , this.usePin ? 'oob' : this.callback
    , 'HMAC-SHA1'
  )
}


/**
 * Constructs Full API url
 *
 * @param {String} url: End resource url
 * @return {String}
 */

Geeklist.prototype._makeUrl = function(url) {
  return this.apiServer + '/v1/' + url
}

Geeklist.prototype._parseUrl = function(url) {
  return url.parse(url, true).query
}

Geeklist.prototype._authorize = function(callback) {
  var self = this

  this.client.getOAuthRequestToken(function(err, token, secret, res) {
    if (err) return callback(err)

    var obj = {
        token: token
      , secret: secret
      , auth_url: self.wwwServer + '/oauth/authorize?oauth_token=' + token
    }

    callback(null, obj)
  })
}

Geeklist.prototype._getAccess = function(tokens, callback) {
  this.client.getOAuthAccessToken(
      tokens.token
    , tokens.secret
    , tokens.verifier
    , function(err, token, secret, res) {
        if (err) return callback(err)

        var obj = {
            token: token
          , secret: secret
          , res: res
        }

        callback(null, obj)
      }
  )
}

Geeklist.prototype._callback = function(tokens, callback) {
  this._getAccess(
      tokens.token
    , tokens.secret
    , tokens.verifier
    , callback
  )
}


Geeklist.prototype._pin = function(pin, tokens, callback) {
  this._getAccess(
      tokens.token
    , tokens.secret
    , pin
    , callback
  )
}


/**
 * Get resource
 *
 * @param {String} url
 * @param {Object} tokens
 * @param {Callback} callback
 *
 * @api private
 */

Geeklist.prototype._get = function (url, tokens, callback) {
  this.client.getProtectedResource(
      this._makeUrl(url)
    , tokens.access
    , tokens.secret
    , callback
  )
}


/**
 * Post data
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} tokens
 * @param {Callback} callback
 *
 * @api private
 */

Geeklist.prototype._post = function (url, data, tokens, callback) {
  this.client.post(
      this._makeUrl(url)
    , tokens.access
    , tokens.secret
    , data
    , 'json'
    , callback
  )
}


/**
 * Users
 *
 */

var users = {}

users.get = function(user, tokens, callback) {
  this._get(
      'users/' + user
    , tokens
    , this.safe(callback)
  )
}

Geeklist.prototype.users = users


Geeklist.prototype.safe = function(fn) {
  function log(err, res) {
    if (err) return console.log('Error: ' + err)

    console.log(res)
  }

  fn = fn || log

  return fn
}
