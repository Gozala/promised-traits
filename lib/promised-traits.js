'use strict'

var Q = require('q'), defer = Q.defer, asap = Q.asap, when = Q.when
,   Promised = require('promised-utils').Promised
,   Trait = require('light-traits').Trait

,   _slice = Array.prototype.slice

exports.PromisedTrait = function PromisedTrait() {
  var trait = Trait.apply(null, arguments)
  Object.getOwnPropertyNames(trait).forEach(function(key) {
    var descriptor = trait[key]
    if (descriptor.required || descriptor.conflict) return
    var method = 'function' == typeof descriptor.value ? descriptor.value : null
    ,   getter = 'function' == typeof descriptor.get ? descriptor.get : null

    if (method) descriptor.value = Promised(method)
    if (getter) descriptor.get = Promised(getter)
  })
  return trait
}
