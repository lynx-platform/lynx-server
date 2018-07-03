const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(express.static('public'));

const PORT = process.env.PORT || 8910;
// Logging
if (!process.env.IS_TEST_ENV) {
  app.use(morgan('short'));
}

const fullNodeAddress = '1231231231';
const DNSAddress = '123.123.123.123';
// IoT, embedded device list from DNS server.
const deviceList = [
  {
    id : 1,
    ip : '123.12.1.1',
    programId : 4,
    bounty : 100
  },
  {
    id : 2,
    ip : '123.12.1.1',
    programId : 3,
    bounty : 100
  }
];

let nextId = 3;

// check if it is reliable entity.
const authorityCheck = (req, res, next) => {
  next();
}

// check through the list to obtain input data.
const checkList = (req, res, next) => {
  next();
}

app.get('/devices/', checkList, (req, res, next) => {
  // send device id
  res.send();
});

// Add the device's information to the list.
// It can be used to check if req's ip address matches with any list element.
app.post('/devices/', authorityCheck, (req, res, next) => {
  res.send();
});

// requester send new input data in its body.
app.put('/devices/:deviceId', checkList, (req, res, next) => {
  res.send();
});

// delete device from the list whenever needed by 'some entities'.
// for example, to ban malicious IoT devices.
app.delete('/devices/', authorityCheck, (req, res, next) => {
  res.send();
});

// Start the server
app.listen(PORT, () => {
  console.log(`DNS server is listening on port ${PORT}...`);
});
