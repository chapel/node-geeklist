var OAuth = require('oauth').OAuth
  , query = require('querystring')
  , utils = require('./utils')
  , util  = require('util')

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

Geeklist.prototype._getAccess = function(token, secret, verifier, callback) {
  var self = this

  this.client.getOAuthAccessToken(
      token
    , secret
    , verifier
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
    , 'get'
    , tokens.token
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
    , tokens.token
    , tokens.secret
    , data
    , 'json'
    , callback
  )
}

/**
 * Put data
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} tokens
 * @param {Callback} callback
 *
 * @api private
 */

Geeklist.prototype._put = function (url, data, tokens, callback) {
  if (!callback) {
    callback = tokens
    tokens = data
    data = null
  }
  this.client.put(
      this._makeUrl(url)
    , tokens.token
    , tokens.secret
    , data
    , 'json'
    , callback
  )
}

/**
 * Delete resource
 *
 * @param {String} url
 * @param {Object} tokens
 * @param {Callback} callback
 *
 * @api private
 */

Geeklist.prototype._del = function (url, tokens, callback) {
  this.client.delete(
      this._makeUrl(url)
    , tokens.token
    , tokens.secret
    , callback
  )
}

Geeklist.prototype.auth = function(tokens) {
  this.access = {
      token: tokens.token
    , secret: tokens.secret
  }
}

var Resources = require('./resources')

var user = function(uri) {
  return function(id) {
    var self = this
    if (!self.access) {
      var err = 'Access token and secret required'
      if (self.errorFn) {
        return self.errorFn(err)
      } else {
        throw new Error(err)
      }
    }

    var resources = new Resources(
        uri
      , uri === 'users' ? id : null
      , self.access
      , self
    )

    return resources
  }
}

Geeklist.prototype.user = user('user')
Geeklist.prototype.users = user('users')

var Resource = require('./resource')

var resource = function(uri) {
  return function(id) {
    var self = this
    if (!self.access) {
      var err = 'Access token and secret required'
      if (self.errorFn) {
        return self.errorFn(err)
      } else {
        throw new Error(err)
      }
    }

    var resource = new Resource(
        uri
      , id || null
      , self.access
      , self
    )

    return resource
  }
}
Geeklist.prototype.cards = resource('cards')
Geeklist.prototype.micros = resource('micros')

Geeklist.prototype.activity = function(params, callback) {
  var uri = 'activity'

  callback = utils.safe(callback)

  if (typeof params === 'function') {
    callback = params
    params = null
  } else if (params) {
    uri = uri + '?' + query.stringify(params)
  }

  this._get(
      uri
    , this.access
    , function(err, res) {
        if (err) return callback(err)
        utils.toObject(res, function(err, obj) {
          if (err) return callback(err)

          callback(null, obj.data)
        })
      }
  )
}

exports.create = function(options) {
  return new Geeklist(options)
}
