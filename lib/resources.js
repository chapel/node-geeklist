var query = require('querystring')

var Resources = function(uri, id, tokens, gklst) {
  this.uri = uri
  this.id = id
  this.tokens = tokens
  this.gklst = gklst
  return this
}

Resources.prototype.profile = function(callback) {
  var url = this.id
          ? [this.uri, this.id].join('/')
          : this.uri
  this.gklst._get(
      url
    , this.tokens
    , this.gklst.safe(callback)
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

function resObj() {
  return {
      name: arguments[0]
    , key: arguments[1]
  }
}

var resources = [
    resObj('cards', 'cards')
  , resObj('contribs', 'cards')
  , resObj('micros', 'micros')
  , resObj('following', 'following')
  , resObj('followers', 'followers')
  , resObj('connections', 'connections')
  , resObj('activity', 'activities')
]

resources.forEach(function(resource) {
  Resources.prototype[resource.name] = function(params, callback) {
    var self = this
    var uri = resource.name
    if (params) {
      uri = resource.name + '?' + query.stringify(params)
    }
    this._get(
        uri
      , function(err, res) {
          if (err) return callback(err)

          self.gklst.toObject(res, function(err, res) {
            if (err) return callback(err)

            var obj = {
                total: res.data['total_' + resource.key]
              , data: res.data[resource.key]
            }
            callback(null, obj)
          })
        }
    )
  }
})

module.exports = Resources
