const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const CronJob = require('cron').CronJob;
const multer = require('multer'); // v1.0.5
const upload = multer(); // for parsing multipart/form-data
const fs = require('fs');
const request = require('request');

app.use(express.static('public'));

const PORT = process.env.PORT || 5511;

// sec
const defaultTimeout = 60;

const deviceMap = {
  '8913': [{
    ip: '::ffff:147.46.123.249',
    port: 8913,
    timeout: 15305137544
  }],
  '0x0011001011010101': [{
    ip: '124.123.12.1',
    port: 8910,
    timeout: 15305137544
  }],
  '0x3211111111111111': [{
    ip: '124.123.12.1',
    port: 8910,
    timeout: 15305152284
  }]
};

// Logging
if (!process.env.IS_TEST_ENV) {
  app.use(morgan('short'));
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// every second this function will delete few addresses in the list
const timeoutCheck = new CronJob('* * * * * *', () => {
  for(const address in deviceMap){
    deviceMap[address].forEach(object => {
      if(object.timeout < Math.floor(Date.now()/1000)){
        delete deviceMap[address];
      }
    });
  }
});

// Authority check logic, Check the full node's blockchain.
const authorityCheck = (req, res, next) => {
  // deposit check, req.body should contain address.
  next();
}

// start timeout check for the list.
// timeoutCheck.start();

// Get all edge devices List.
app.get('/devicelist/', authorityCheck, (req, res, next) => {
  res.send(deviceMap);
});

// Create a new address
app.post('/devicelist/', upload.array(), authorityCheck, (req, res, next) => {
  // edge device request to put it's address to the list.
  // return the address of full node.
  const address = String(req.body.address);
  if (!deviceMap.hasOwnProperty(address)) {
    deviceMap[address] = [{
      ip: req.ip,
      port: Number(req.body.port),
      timeout: Math.floor(Date.now()/1000) + defaultTimeout
    }];
    return res.status(201).send('Your device is succesfully added to the list.');
  } else {
    return res.status(400).send('Your address is already on the list, Use PUT/POST method with your address.');
  }
});

// Add additional IP address to the list.
app.post('/devicelist/:address', upload.array(), authorityCheck, (req, res, next) => {
  const address = String(req.body.address);
  if (!deviceMap.hasOwnProperty(address)) {
    res.status(404).send('This address is not valid. Try to POST your address.');
  } else {
    let count = 0;
    deviceMap[address].forEach((object) => {
      if(object.ip === req.ip){
        res.status(400).send('Device\'s IP address is already on the list. Use PUT method instead.')
        count += 1;
      }
    })
    if(count === 0){
      const newObject = {
        ip: req.ip,
        port: Number(req.body.port),
        timeout: Math.floor(Date.now()/1000) + defaultTimeout
      };
      deviceMap[address].push(newObject);
      res.status(201).send(newObject);
    }
  }
});

function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type: ', res.headers['content-type']);
    console.log('content-length: ', res.headers['content-lentgh']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

// Receive input data
app.post('/input/', upload.array(), authorityCheck, (req, res, next) => {
  download(req.body.uri, 'test', () => {console.log('Full node received your input...')}); // TODO : Need to decide how to name input file.
  res.status(201).send();
});

// Receive result data
app.post('/result/', upload.array(), authorityCheck, (req, res, next) => {
  download(req.body.uri, 'test_result', () => {console.log('Full node received your result...')}); // TODO : Need to decide how to name result file.
  res.status(201).send();
});


// Update the list
app.put('/devicelist/:address', upload.array(), authorityCheck, (req, res, next) => {
  const address = String(req.params.address);
  if (!deviceMap.hasOwnProperty(address)) {
    res.status(404).send('This address is not valid. Try to POST your address.');
  }
  deviceMap[address].forEach(function(object){
    if(object.ip === req.ip){
      if(object.port === Number(req.body.port)){
        object.timeout = Math.floor(Date.now()/1000) + defaultTimeout
        res.send(deviceMap);
      } else {
        res.status(404).send('This port number is not on the list.');
      }
    } else {
      res.status(404).send('This IP address is not valid.');
    }
  });
});

// Delete an address from the list.
app.delete('/devicelist/:address', upload.array(), (req, res, next) => {
  const address = String(req.params.address);
  if (!deviceMap.hasOwnProperty(address)) {
    res.status(404).send('This address is not valid. Try to POST your address.');
  } else {
    delete deviceMap[address];
    res.status(204).send('Your address is successfully deleted from the list.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Full-node server is listening on port ${PORT}...`);
});
