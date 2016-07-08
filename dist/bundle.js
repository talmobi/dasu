(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, function () { 'use strict';

  // basic streamlined xhr request for browser and server

  var request = function () {
    throw new Error("No request implemention specified in dasu.js")
  }

  if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
    // use XMLHttpRequest

    request = function (opts, dataString, callback) {
      var req = new XMLHttpRequest()

      opts.protocol = opts.protocol || 'http:'
      // opts.host = opts.host || window.location.host
      opts.hostname = opts.hostname || window.location.hostname
      opts.port = opts.port || window.location.port
      var origin = opts.protocol + '//' + (opts.hostname + ':' + opts.port)
      // XMLHttpRequest takes a complete url (not host and path separately)
      var url = origin + opts.path
      console.log("url: " + url)
      req.open(opts.method, url, true)

      req.onload = function () {
        callback(null, req, req.responseText)
      }

      req.onerror = function () {
        callback(req.responseText || "dasu.js XMLHttpRequest error")
      }

      // attach headers to the request
      //console.log(opts.headers)
      var headerKeys = Object.keys(opts.headers)
      for (var i = 0; i < headerKeys.length; i++) {
        var key = headerKeys[i]
        var value = opts.headers[key]
        req.setRequestHeader(key, value)
        //console.log("set header: %s, to: %s", key, value)
      }
      req.send( dataString )
    }
  } else {
    // assume in nodejs environment, use nodejs core http lib
    var http = require('http')

    request = function (opts, dataString, callback) {
      var req = http.request(opts, function (res) {
        var buffer = ""
        res.on('data', function (chunk) {
          buffer += chunk
        })

        res.on('end', function () {
          callback(null, res, buffer)
        })
      })

      req.on('error', function (err) {
        //console.error("error: " + err)
        callback(err)
      })

      //console.log("rest: sending: " + dataString)
      req.write( dataString )
      req.end()
    }
  }

  function xhr (params, done) {

    var contentType = ""
    var data = (params.data || params.json) || ""
    var dataString = ""
    switch (typeof data) {
      case 'object':
        dataString = JSON.stringify(data)
        contentType = "application/json"
      break
      case 'string':
        dataString = data
        contentType = "text/plain"
      break
      default: // try coercion as a last resort
        dataString = ("" + data)
        contentType = "text/plain"
    }

    //console.log("rest: contentType: " + contentType)

    var params = Object.assign({}, params)
    delete params.data

    // try to add content-type if it doesn't exist
    params.headers = Object.assign({}, {
      'Content-Type': contentType
    }, params.headers || {})

    // if (!params.headers['Authorization'] && _token) {
    //   params.headers['Authorization'] = _token
    // }

    //console.log("rest: headers: " + JSON.stringify(params.headers))

    // set default method
    params.method = params.method || 'GET'

    // default path
    params.path = params.path || '/'
    // people often emit leading '/' - so support it
    if (params.path[0] !== '/') {
      params.path = '/' + params.path
    }

    var opts = {
      hostname: params.hostname,
      port: params.port,
      path: params.path, // attach root path
      method: params.method,
      headers: params.headers
    }

    // used XMLHttpRequest if availalb, else nodejs http library
    request(opts, dataString, function (err, res, body) {
      if (err) {
        done(err, null)
      } else {
        done(null, body)
      }
    })

  }

  var client = {
    xhr: xhr
  }

  module.exports = client

}));