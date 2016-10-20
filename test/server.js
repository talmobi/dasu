var express = require('express')
var app = express()

var users = [
  { name: 'dave' },
  { name: 'mark' },
  { name: 'lisa' }
]

app.use('/running', function (req, res, next) {
  res.status(200).end()
})

app.use('/users', function (req, res, next) {
  res.json({
    message: 'hello, yes, this is DOG!',
    users: users
  }).end()
})

app.use('/echo/:msg', function (req, res, next) {
  res.send(req.params.msg).end()
})

var server = require('http').createServer(app)
module.exports = server
