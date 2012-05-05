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
    , this.gklst.safe(callback)
  )
}

var resources = [
    'cards'
  , 'contribs'
  , 'micros'
  , 'following'
  , 'followers'
  , 'connections'
  , 'activity'
]

resources.forEach(function(resource) {
  Resources.prototype[resource] = function(callback) {
    this._get(
        resource
      , callback
    )
  }
})

module.exports = Resources
