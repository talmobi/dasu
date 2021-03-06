var test = require('tape')
var dasu = require('../dist/dasu.min.js')
var xhr = dasu.xhr || dasu
var req = dasu.req
var server = require('./server.js')

var fs = require( 'fs' )
var path = require( 'path' )

test('sample test', t => {
  t.plan(1)
  t.ok(true, 'always true')
})

const PORT = 4488

test('start local mockup test server', t => {
  t.plan(1)
  server.listen(PORT, function () {
    req({
      path: '/running',
      hostname: '127.0.0.1',
      port: PORT,
      method: 'GET'
    }, function (err, res, data) {
      t.ok(!err && res && Number(res.statusCode) === 200, 'mockup test server is listening')
    })
  })
})

test('basic json test', { timeout: 500 }, t => {
  t.plan(3)

  var params = {
    path: '/users',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'POST'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    var json = JSON.parse(data)
    t.deepEqual(json, {
      message: 'hello, yes, this is DOG!',
      users: [
        { name: 'dave' },
        { name: 'mark' },
        { name: 'lisa' }
      ]
    }
    )
  })
})

test('get echoes', t => {
  t.plan(3)

  var params = {
    path: '/echo/helloworld',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'POST'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    var msg = data
    t.equal(msg, 'helloworld')
  })
})

test('test public ipify.org ip (returns your ip)', t => {
  t.plan(3)

  var params = {
    path: '/',
    hostname: 'api.ipify.org',
    protocol: 'https:',
    port: 443,
    method: 'GET'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    var ip = data
    t.equal(ip.split('.').filter(n => Number(n) >= 0).length, 4, 'ipv4 found as expected')
  })
})

test('test params.host support ( alias to params.hostname )', t => {
  t.plan(6)

  var params1 = {
    path: '/',
    hostname: 'api.ipify.org',
    protocol: 'https:',
    port: 443,
    method: 'GET'
  }

  var params2 = Object.assign( {}, params1 )

  params2.host = params2.hostname
  delete params2.hostname

  var data1

  xhr( params1, function ( err, data ) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')

    data1 = data

    xhr( params2, function ( err, data ) {
      t.error(err, 'no xhr errors')
      t.ok(data, 'data received')

      data2 = data
      t.equal(
        data1,
        data2,
        'both requests results in the same data'
      )

      var ip = data
      t.equal(ip.split('.').filter(n => Number(n) >= 0).length, 4, 'ipv4 found as expected')
    } )
  } )
})

test('test better default protocol (and port) if omitted', t => {
  t.plan(3)

  var params = {
    path: '/',
    hostname: 'api.ipify.org',
    method: 'GET'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    var ip = data
    t.equal(ip.split('.').filter(n => Number(n) >= 0).length, 4, 'ipv4 found as expected')
  })
})

test('test better default port based on protocol if omitted', t => {
  t.plan(3)

  var params = {
    path: '/',
    hostname: 'api.ipify.org',
    protocol: 'http',
    method: 'GET'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    var ip = data
    t.equal(ip.split('.').filter(n => Number(n) >= 0).length, 4, 'ipv4 found as expected')
  })
})

test('test better default port based on protocol if omitted', t => {
  t.plan(3)

  var params = {
    path: '/',
    hostname: 'api.ipify.org',
    protocol: 'https',
    method: 'GET'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    var ip = data
    t.equal(ip.split('.').filter(n => Number(n) >= 0).length, 4, 'ipv4 found as expected')
  })
})

// skip as uinames.com is currently unavailable
test.skip('test public uinames.com api (returns a random person information)', t => {
  t.plan(6)

  var params = {
    path: '/api/',
    hostname: 'uinames.com',
    protocol: 'http:',
    port: 80,
    method: 'GET'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    var json = JSON.parse(data)
    t.ok(typeof json.name === 'string', 'found name')
    t.ok(typeof json.surname === 'string', 'found surname')
    t.ok(typeof json.gender === 'string', 'found gender')
    t.ok(typeof json.region === 'string', 'found region')
  })
})

test('test public json api (returns a random person information)', t => {
  t.plan(6)

  var params = {
    path: '/api/',
    hostname: 'randomuser.me',
    protocol: 'https:',
    method: 'GET'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    console.log( data )
    dasu.debug = true
    var json = JSON.parse(data)
    var person = json.results[ 0 ]
    t.ok(typeof person.name.first === 'string', 'found name')
    t.ok(typeof person.name.last === 'string', 'found surname')
    t.ok(typeof person.gender === 'string', 'found gender')
    t.ok(typeof person.location.city === 'string', 'found region')
  })
})

test('test dasu.req api && response headers', { timeout: 2000 }, t => {
  var params = {
    path: '/echo/helloworld',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'POST'
  }

  req(params, function (err, res, data) {
    t.error(err, 'no errors ')

    t.equal(res.headers['content-type'], 'text/html; charset=utf-8', 'res.headers ok!')
    t.equal(res.getResponseHeader('content-type'), 'text/html; charset=utf-8', 'res.getResponseHeader() ok!')

    Object.keys(res.headers).forEach(function (header) {
      t.equal(res.headers[header], res.getResponseHeader(header), 'header [' + header + '] ok!')
    })

    t.equal( res.headers, res.getAllResponseHeaders(), 'res.getAllResponseHeaders() ok!' )

    t.pass('response header tests passed!')
    t.end()
  })
})

test('test response status code', { timeout: 2000 }, t => {
  t.plan(3)

  var params = {
    path: '/echo/helloworld',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'POST'
  }

  req(params, function (err, res, data) {
    t.error(err, 'no request errors ')
    t.equal(res.statusCode, res.status, 'res.statusCode (NodeJS) === res.status (XMLHttpRequest)')
    t.equal(res.statusCode, 200)
  })
})

test('post text/plain', { timeout: 2000 }, t => {
  t.plan(3)

  var params = {
    path: '/text',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'POST',
    data: 'Dogs are the best!'
  }

  req(params, function (err, res, data) {
    t.error(err, 'no request errors ')
    t.equal(res.statusCode, 200)
    t.equal(data, 'Dogs are the best!')
  })
})

test('warning message on text/plain for data that is JSON parsable', { timeout: 2000 }, t => {
  t.plan(4)

  var params = {
    path: '/text',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'POST',
    data: '{ "name": "Ada" }'
  }

  var _warn = console.warn
  var _ok = false
  console.warn = function (text) {
    if (text === '[WARNING] dasu: Sending data that may be JSON as text/plain') {
      _ok = true
    }
    _warn.call(arguments)
  }

  req(params, function (err, res, data) {
    t.error(err, 'no request errors ')
    t.equal(res.statusCode, 200)
    t.equal(data, '{ "name": "Ada" }')
    t.equal(_ok, true, 'warning message printed correctly.')
    console.warn = _warn
  })
})

test('post application/json', { timeout: 2000 }, t => {
  t.plan(3)

  var params = {
    path: '/json',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'POST',
    data: { message: 'Cats are OK.' }
  }

  req(params, function (err, res, data) {
    t.error(err, 'no request errors ')
    t.equal(res.statusCode, 200)
    t.deepEqual(JSON.parse(data), { message: 'Cats are OK.' })
  })
})

test('test abort() api', { timeout: 2000 }, t => {
  t.plan(6)

  var params = {
    path: '/echo/helloworld',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'POST'
  }

  var r1 = req(params, function (err, res, data) {
    t.error(err, 'first request succeeded (not aborted)')
  })

  var r2 = req(params, function (err, res, data) {
    t.error(err, 'first request succeeded (not aborted)')
    t.fail('failed to abort intended request (r2)')
  })

  var r3 = req(params, function (err, res, data) {
    t.error(err, 'third request succeeded (not aborted)')
  })

  t.ok(typeof r1.abort === 'function', 'r1.abort() function found')
  t.ok(typeof r2.abort === 'function', 'r2.abort() function found')
  t.ok(typeof r3.abort === 'function', 'r3.abort() function found')

  r2.abort()
  setTimeout(function () {
    t.ok(true, 'r2 was successfully aborted')
  }, 1500)
})

test('test follow redirect', { timeout: 2000 }, t => {
  t.plan(6)

  var params = {
    path: '/redirect',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'GET'
  }

  const _follow = dasu.follow
  dasu.follow = true

  req(params, function (err, res, body) {
    t.equal(res.status, 200)
    t.equal(body, 'REDIRECT')

    dasu.follow = false
    process.nextTick( function () {
      req(params, function (err, res, body) {
        t.equal(res.status, 301)
        t.notEqual(body, 'REDIRECT')

        dasu.follow = true
        process.nextTick( function () {
          req(params, function (err, res, body) {
            t.equal(res.status, 200)
            t.equal(body, 'REDIRECT')

            // restore follow
            dasu.follow = _follow
          })
        } )
      })
    } )
  })
})

test('close local mockup test server', t => {
  t.plan(2)

  req({
    path: '/running',
    hostname: '127.0.0.1',
    port: PORT,
    method: 'GET'
  }, function (err, res, data) {
    t.ok(!err && res && Number(res.statusCode) === 200, 'server still running, closing...')
    server.close()

    setTimeout(function () {
      req({
        path: '/running',
        hostname: '127.0.0.1',
        port: PORT,
        method: 'GET'
      }, function (err, res, data) {
        t.ok(err && !res, 'server closed')
      })
    }, 1000)
  })
})

test('test image ( dragonite.gif ) upload to imgur.com', { timeout: 25 * 1000 }, t => {
  t.plan(6)

  // please register your own Client-ID: https://api.imgur.com/oauth2/addclient
  const clientId = '279f0e248e5f16c' // imgur app Client-ID

  const data = fs.readFileSync( path.join( 'test', 'dragonite.gif' ) )

  const params = {
    protocol: 'https',
    hostname: 'api.imgur.com',
    port: 443,
    path: '/3/image',
    method: 'POST',
    headers: {
      authorization: 'Client-ID ' + clientId,
      // 'content-type': 'application/octet-stream',
      // 'content-length': data.length
    },
    data: data
  }

  dasu.req( params, function ( err, res, data ) {
    if ( err ) throw err

    t.equal( res.status, 200, 'status code OK' )

    const json = JSON.parse( data )

    t.equal( json.data.width, 32, 'width OK' )
    t.equal( json.data.height, 32, 'height OK' )
    t.equal( json.data.animated, true, 'animated flag OK' )
    t.equal( json.data.size, 17685, 'size OK' )
    t.ok( json.data.link.length > 3, 'link OK' )
  } )
})
