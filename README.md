# 出す　ー　dasu
## Barebones XMLHttpRequest for browser and server

Simple to use:
```
var dasu = require('dasu')
var xhr = dasu.xhr

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
Use the same XHR in the browser and on the server. Similar libraries already exists such as https://github.com/ykzts/node-xmlhttprequest. This aims to be as simple and minimalistic as possible.


## Why
Sometimes you'd like to test how a XMLHttpRequest would work on the server side without opening up the browser.
For example when making automated tests for client login/regisration.


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
