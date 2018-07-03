const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const CronJob = require('cron').CronJob;

app.use(express.static('public'));

const PORT = process.env.PORT || 8910;

// sec
const defaultTimeout = 60;

const deviceMap = {
  0x0011001011010101: [{
    ip: '124.123.12.1',
    port: 8910,
    timeout: 1530513754
  }],
  0x3211111111111111: [{
    ip: '124.123.12.1',
    port: 8910,
    timeout: 1530515228
  }]
};

// Logging
if (!process.env.IS_TEST_ENV) {
  app.use(morgan('short'));
}

// Parsing
app.use(bodyParser.json());

// every second this function will delete few addresses in the list
const timeoutCheck = new CronJob('* * * * * *', () => {
  console.log("tick");
  for(const address in deviceMap){
    deviceMap[address].forEach(object => {
      if(object.timeout < Math.floor(Date.now())){
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
timeoutCheck.start();

// Get all edge devices List.
app.get('/devicelist/', authorityCheck, (req, res, next) => {
  res.send(deviceMap);
});

// Create a new address
app.post('/devicelist/', authorityCheck, (req, res, next) => {
  // edge device request to put it's address to the list.
  // return the address of full node.
  const address = req.body.address;
  if (deviceMap.indexOf(address) === -1) {
    deviceMap[req.body.address] = [{
      ip: req.ip,
      port: req.body.port,
      timeout: Math.floor((Date.now() + defaultTimeout)/1000)
    }];
    res.status(201).send('Your device is succesfully added to the list.');
  } else {
    res.status(400).send('Your address is already on the list, Use PUT/POST method with your address.');
  }
});

// Add additional IP address to the list.
app.post('/devicelist/:address', authorityCheck, (req, res, next) => {
  const address = req.params.address;
  if (deviceMap.indexOf(address) === -1) {
    return res.status(404).send('This address is not valid. Try to POST your address.');
  }
  const newObject = {
    ip: req.ip,
    port: req.body.port,
    timeout: Math.floor((Date.now() + defaultTimeout)/1000)
  };
  deviceMap[req.body.address].push(newObject);
  res.satus(201).send(newObject);
});

// Update the list
app.put('/devicelist/:address', authorityCheck, (req, res, next) => {
  const address = req.params.address;
  if (deviceMap.indexOf(address) === -1) {
    return res.status(404).send('This address is not valid. Try to POST your address.');
  }
  deviceMap[address].forEach(object => {
    if(object.ip === req.ip){
      if(object.port === req.body.port){
        object.timeout = Math.floor((Date.now() + defaultTimeout)/1000);
        res.send('List updated.');
      }
    }
  });
  res.status(404).send('This IP address is not valid.');
});

// Delete an address from the list.
app.delete('/devicelist/:address', (req, res, next) => {
  const address = req.params.address;
  if (deviceMap.indexOf(address) === -1) {
    return res.status(404).send('This address is not valid. Try to POST your address.');
  }
  delete deviceMap[address];
  res.status(204).send('Your address is successfully deleted from the list.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Full-node server is listening on port ${PORT}...`);
});
