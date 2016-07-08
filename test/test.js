var test = require('tape')
var dasu = require('../dist/bundle.js')
var xhr = dasu.xhr || dasu
var server = require('./server.js')

test('sample test', t => {
  t.plan(1)
  t.ok(true, 'always true')
})

const PORT = 4488

test('start mockup test server', t => {
  t.plan(1)
  server.listen(PORT, function () {
    t.ok(server.listening, 'server is listening')
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
    t.equal(ip.split('.').filter(n => Number(n) == n).length, 4, 'ip v4 found as expected')
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
    t.ok(json.name)
    t.ok(json.surname)
    t.ok(json.gender)
    t.ok(json.region)
  })
})

test('mockup test server closed', t => {
  t.plan(2)
  t.ok(server.listening, 'mockup test server still running')
  server.close()
  t.ok(!server.listening, 'mockup test server closed')
})
