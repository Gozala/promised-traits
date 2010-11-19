'use strict'

var Q = require('q'), defer = Q.defer, when = Q.when, isPromise = Q.isPromise
,   Promised = require('promised-utils').Promised
,   Trait = require('light-traits').Trait

,   _slice = Array.prototype.slice

function create(proto) {
  if (!isPromise(proto)) return Trait.prototype.create.call(this, proto)
  var promisedProto = when(proto, Trait.prototype.create.bind(this))
  return Trait.prototype.create.call(this, promisedProto)
}

exports.PromisedTrait = function PromisedTrait() {
  var TPromised = Trait.apply(null, arguments)
  ,   trait = Object.create(TPromised)

  Object.getOwnPropertyNames(TPromised).forEach(function(key) {
    var descriptor = trait[key] = TPromised[key]
    if (descriptor.required || descriptor.conflict) return
    var method = 'function' == typeof descriptor.value ? descriptor.value : null
    ,   getter = 'function' == typeof descriptor.get ? descriptor.get : null
    ,   setter = 'function' == typeof descriptor.set ? descriptor.set : null

    if (method) descriptor.value = Promised(method)
    if (getter) descriptor.get = Promised.sync(getter)
    if (setter) descriptor.set = Promised.sync(setter)
  })
  TPromised.create = create
  return trait
}
