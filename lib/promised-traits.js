'use strict'

var Q = require('q'), defer = Q.defer, when = Q.when, isPromise = Q.isPromise
,   Promised = require('promised-utils').Promised
,   Trait = require('light-traits').Trait

function PromisedTrait() {
  var TPromisedProto = Object.create(PromisedTrait.prototype)
  ,   TPromised = Object.create(TPromisedProto)
  ,   trait = Trait.apply(null, arguments)
  ,   keys = Object.getOwnPropertyNames(trait)

  for (var i = 0, ii = keys.length; i < ii; i++) {
    var key = keys[i]
    ,   property = TPromised[key] = trait[key]
    ,   descriptor = TPromisedProto[key] =
      { configurable: property.configurable
      , enumerable: property.enumerable
      }

    if (property.conflict) continue

    var method = 'function' == typeof property.value ? property.value : null
    ,   getter = 'function' == typeof property.get ? property.get : null
    ,   setter = 'function' == typeof property.set ? property.set : null

    if (property.required) {
      if (getter) descriptor.get = Promised.sync(Getter(key))
      if (setter) descriptor.set = Promised.sync(Setter(key))
      continue
    }

    if (getter) descriptor.get = property.get = Promised.sync(getter)
    if (setter) descriptor.set = property.set = Promised.sync(setter)
    if (method) {
      descriptor.writable = property.writable
      descriptor.value = property.value = Promised(method)
    } else {
      descriptor.get = Promised.sync(Getter(key))
      descriptor.set = Promised.sync(Setter(key))
    }
  }
  return TPromised
}
PromisedTrait.required = Trait.required
PromisedTrait.prototype = Object.freeze(Object.create(Trait.prototype,
{ create: { value: function create(proto) {
    proto = when(proto, Trait.prototype.create.bind(this))
    return Trait.prototype.create.call(Object.getPrototypeOf(this), proto)
  }}
}))
exports.PromisedTrait = Object.freeze(PromisedTrait)

var Getter = Object.freeze(function promisedGetter(key) {
  return function getter() { return this[key] }
})
Object.freeze(Getter.prototype)
var Setter = Object.freeze(function promisedSetter(key) {
  return function setter(value) { this[key] = value }
})
Object.freeze(Setter.prototype)
var Method = Object.freeze(function promisedMethod() {
  return this[key].apply(this, arguments)
})
Object.freeze(Method.prototype)
