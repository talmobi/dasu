var test = require('tape')
var dasu = require('../dist/bundle.js')
var xhr = dasu.xhr || dasu
var req = dasu.req
var server = require('./server.js')

test('sample test', t => {
  t.plan(1)
  t.ok(true, 'always true')
})

const PORT = 4488

test('start local mockup test server', t => {
  t.plan(1)
  server.listen(PORT, function () {
    t.ok(server.listening, 'mockup test server is listening')
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
    port: 80,
    method: 'GET'
  }

  xhr(params, function (err, data) {
    t.error(err, 'no xhr errors')
    t.ok(data, 'data received')
    var ip = data
    t.equal(ip.split('.').filter(n => Number(n) >= 0).length, 4, 'ipv4 found as expected')
  })
})

test('test public uinames.com api (returns a random person information)', t => {
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

    t.pass('response header tests passed!')
    t.end()
  })
})

test('close local mockup test server', t => {
  t.plan(2)
  t.ok(server.listening, 'mockup test server still running')
  server.close()
  t.ok(!server.listening, 'mockup test server closed')
})
