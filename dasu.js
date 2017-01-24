// basic streamlined xhr request for browser and server

var _request = function () {
  throw new Error('dasu: No request implemention specified in dasu.js')
}

if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
  // use XMLHttpRequest

  _request = function (opts, dataString, callback) {
    var req = new window.XMLHttpRequest()

    opts.protocol = opts.protocol || (window.location.protocol) || 'http'
    if (opts.protocol[opts.protocol.length - 1] !== ':') opts.protocol += ':'
    // opts.host = opts.host || window.location.host
    opts.hostname = opts.hostname || window.location.hostname

    var defaultPort = 80

    // default port based off of protocol
    if (opts.protocol) {
      if (opts.protocol.indexOf('https') !== -1) {
        defaultPort = 443
      } else {
        defaultPort = 80
      }
    }

    // if requesting current domain, assume by default the same port
    var ohn = opts.hostname.toLowerCase().trim()
    var whn = window.location.hostname.toLowerCase().trim()
    if (ohn.indexOf(whn) !== -1) defaultPort = window.location.port || defaultPort

    opts.port = opts.port || defaultPort

    var origin = opts.protocol + '//' + (opts.hostname + (opts.port ? (':' + opts.port) : ''))
    // XMLHttpRequest takes a complete url (not host and path separately)
    var url = origin + opts.path
    console.log('dasu: url [' + url + ']')
    req.open(opts.method, url, true)

    req.onload = function () {
      callback(undefined, req, req.responseText)
    }

    req.onerror = function () {
      callback(req.responseText || 'dasu.js XMLHttpRequest error')
    }

    // attach headers to the request
    // console.log(opts.headers)
    var headerKeys = Object.keys(opts.headers)
    for (var i = 0; i < headerKeys.length; i++) {
      var key = headerKeys[i]
      var value = opts.headers[key]
      req.setRequestHeader(key, value)
      // console.log("set header: %s, to: %s", key, value)
    }
    req.send(dataString)

    // return minimal api to abort
    return {
      abort: function () {
        req.abort()
      }
    }
  }
} else { // assume in nodejs environment, use nodejs core http lib
  // use this require hack so that bundlers don't automatically bundle
  // node's http library within exported bundles
  var require_ = require
  var http = require_('http')
  var https = require_('https')

  _request = function (opts, dataString, callback) {
    opts = opts || {}
    opts.protocol = opts.protocol || 'http'
    var _h = http
    if (opts.protocol && opts.protocol.indexOf('https') !== -1) _h = https
    if (opts.protocol[opts.protocol.length - 1] !== ':') opts.protocol += ':'
    var req = _h.request(opts, function (res) {
      var buffer = ''
      res.on('data', function (chunk) {
        buffer += chunk
      })

      res.on('end', function () {
        callback(undefined, res, buffer)
      })
    })

    req.on('error', function (err) {
      // console.error("error: " + err)
      callback(err)
    })

    // console.log("rest: sending: " + dataString)
    req.write(dataString)
    req.end()

    // return minimal api to abort
    return {
      abort: function () {
        req.abort()
      }
    }
  }
}

function request (params, done) {
  var contentType = ''
  var data = (params.data || params.json) || ''
  var dataString = ''
  switch (typeof data) {
    case 'object':
      dataString = JSON.stringify(data)
      contentType = 'application/json'
      break
    case 'string':
      if (data.length > 1 && (data[0] === '{' || data[0] === '[')) {
        try { // could be json
          var  _j = JSON.parse(data)
          // if no error is thrown, json parsed successfully
          if (console && console.warn) console.warn('dasu: Sending data that may be JSON as text/plain')
        } catch (err) {} // text was not parsed as json, ignore and assume text/plain
      }
      dataString = data
      contentType = 'text/plain'
      break
    default: // try coercion as a last resort
      dataString = ('' + data)
      contentType = 'text/plain'
  }

  // console.log("rest: contentType: " + contentType)

  params = Object.assign({}, params)
  delete params.data

  // try to add content-type if it doesn't exist
  params.headers = Object.assign({}, {
    'content-type': contentType
  }, params.headers || {})

  // console.log("rest: headers: " + JSON.stringify(params.headers))

  // set default method
  params.method = params.method || 'GET'

  // default path
  params.path = params.path || '/'
  // people often emit leading '/' - so support it
  if (params.path[0] !== '/') {
    params.path = '/' + params.path
  }

  var opts = {
    protocol: params.protocol,
    hostname: params.hostname,
    port: params.port,
    path: params.path, // attach root path
    method: params.method,
    headers: params.headers
  }

  // used XMLHttpRequest if availalb, else nodejs http library
  return _request(opts, dataString, function (err, res, body) {
    if (err || res === undefined) {
      done(err)
    } else {
      // homogenize response headers
      if (!res.getResponseHeader && res.headers) {
        res.getResponseHeader = function (header) {
          return res.headers[header]
        }
      }
      if (res.getAllResponseHeaders && !res.headers) {
        res.headers = res.getAllResponseHeaders()
      }

      // homogenize response status
      if (res.status === undefined) {
        res.status = res.statusCode
      } else {
        res.statusCode = res.status
      }

      done(undefined, res, body)
    }
  })
}

var client = {
  xhr: function (params, done) {
    request(params, function (err, res, body) {
      done(err, body)
    })
  },
  req: request
}

module.exports = client
