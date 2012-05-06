var query = require('querystring')
  , utils = require('./utils')

var Resources = function(uri, id, tokens, gklst) {
  this.uri = uri
  this.id = id
  this.tokens = tokens
  this.gklst = gklst
  return this
}

Resources.prototype.profile = function(callback) {
  var self = this

  callback = utils.safe(callback)

  var url = this.id
          ? [this.uri, this.id].join('/')
          : this.uri
  this.gklst._get(
      url
    , this.tokens
    , function(err, res) {
        if (err) return callback(err)
        utils.toObject(res, callback)
      }
  )
}

Resources.prototype._get = function(resource, callback) {
  var url = this.id
          ? [this.uri, this.id, resource].join('/')
          : [this.uri, resource].join('/')
  this.gklst._get(
      url
    , this.tokens
    , callback
  )
}

var followRes = [
    {name: 'follow', method: 'put'}
  , {name: 'unfollow', method: 'del'}
]

followRes.forEach(function(resource) {
  Resources.prototype[resource.name] = function(callback) {
    var self = this

    callback = utils.safe(callback)

    if (!this.id) return callback(new Error('You cannot follow/unfollow yourself'))

    this.gklst['_' + resource.method](
        [this.uri, this.id, 'follow'].join('/')
      , this.tokens
      , function(err, res) {
          if (err) return callback(err)

          utils.toObject(res, callback)
        }
    )
  }
})

function o() {
  return {
      name: arguments[0]
    , key: arguments[1]
  }
}

var resources = [
    o('cards', 'cards')
  , o('contribs', 'cards')
  , o('micros', 'micros')
  , o('following', 'following')
  , o('followers', 'followers')
  , o('connections', 'connections')
  , o('activity', 'activities')
]

resources.forEach(function(resource) {
  Resources.prototype[resource.name] = function(params, callback) {
    var uri = resource.name
      , self = this

    callback = utils.safe(callback)

    if (typeof params === 'function') {
      callback = params
      params = null
    } else if (params) {
      uri = resource.name + '?' + query.stringify(params)
    }
    this._get(
        uri
      , function(err, res) {
          if (err) return callback(err)

          utils.toObject(res, function(err, res) {
            if (err) return callback(err)

            var obj
            if (res.data[resource.key]) {
              obj = new ReturnObject(
                  res.data[resource.key]
                , res.data['total_' + resource.key]
              )
            } else {
              obj = new ReturnObject(
                res.data
              )
            }
            callback(null, obj)
          })
        }
    )
  }
})

var ReturnObject = function (data, total) {
  if (total) {
    data.total = total
  }
  return data
}

module.exports = Resources
