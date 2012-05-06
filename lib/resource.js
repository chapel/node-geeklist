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
        utils.toObject(res, callback)
      }
  )
}

module.exports = Resource
