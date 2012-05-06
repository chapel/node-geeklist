var utils = require('./utils')

var Resource = function(uri, id, tokens, gklst) {
  this.uri = uri
  this.id = id
  this.tokens = tokens
  this.gklst = gklst
  return this
}

Resource.prototype.get = function(callback) {
  var url = [this.uri, this.id].join('/')

  callback = utils.safe(callback)

  this.gklst._get(
      url
    , this.tokens
    , function(err, res) {
        if (err) return callback(err)
        utils.toObject(res, function(err, obj) {
          if (err) return callback(err)

          callback(null, obj.data)
        })
      }
  )
}

Resource.prototype.create = function(obj, callback) {
  callback = utils.safe(callback)

  this.gklst._post(
      this.uri
    , obj
    , this.tokens
    , function(err, res) {
        if (err) return callback(err)
        utils.toObject(res, function(err, obj) {
          if (err) return callback(err)

          callback(null, obj.data)
        })
      }
  )
}

Resource.prototype.highfive = function(callback) {
  callback = utils.safe(callback)

  var obj = {
      gfk: this.id
    , type: this.uri.substring(-1, this.uri.length - 1)
  }

  this.gklst._post(
      'highfive'
    , obj
    , this.tokens
    , function(err, res) {
        if (err) return callback(err)
        utils.toObject(res, function(err, obj) {
          if (err) return callback(err)

          callback(null, true)
        })
      }
  )
}

module.exports = Resource
