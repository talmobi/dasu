# 出す　ー　dasu
## The same xhr API for both client and server

Simple to use:
```javascript
var dasu = require('dasu')
var xhr = dasu.xhr

// works just like Node's require('http').request
var params = {
  path: '/api/',
  hostname: 'uinames.com',
  protocol: 'http:',
  port: 80,
  method: 'GET'
}

xhr(params, function (err, data) {
  var json = JSON.parse(data)
  console.log(json)
  // eg: {"name":"Milica","surname":"Maslo","gender":"female","region":"Slovakia"}
})
```

## About
Using XMLHttpRequest or Node's http libraries under the hood, **dasu** aims to streamline your basic xhr for both contexts. It provides the familiar structure to Node's http library (http://devdocs.io/node/http#http_http_request_options_callback)


## Why
Test your client side request/fetch/xhr logic on the server side with the same api you're using on the client.


## Install
from npm
```
npm install dasu
```

from source
```
git clone https://github.com/talmobi/dasu
cd dasu
npm install
```


## Test
```
npm test
```
