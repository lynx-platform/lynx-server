const request = require('request');

const mObject = {
  address: '0x0011001011010131',
  port: 8910
}


request.post({
  url: 'http://127.0.0.1:8910/devicelist/',
  form: mObject
}, (err, res, body) => {
  console.log('error: ', err);
  console.log('statusCode: ', res && res.statusCode);
  console.log('body: ', body);
});

request.post({
  url: 'http://127.0.0.1:8910/devicelist/0x0011001011010131',
  form: mObject
}, (err, res, body) => {
  console.log('error: ', err);
  console.log('statusCode: ', res && res.statusCode);
  console.log('body: ', body);
});

request.put({
  uri:     'http://127.0.0.1:8910/devicelist/0x0011001011010131',
  form: mObject
}, function(error, response, body){
  console.log(body);
});

request.get('http://127.0.0.1:8910/devicelist', (err, res, body) => {
  console.log('error: ', err);
  console.log('statusCode: ', res && res.statusCode);
  console.log('body: ', body);
})
