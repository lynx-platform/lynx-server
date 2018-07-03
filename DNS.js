const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(express.static('public'));

const PORT = process.env.PORT || 8910;

const fullNodeAddress = '1212313132~~~';
const edgeDeviceAddresses = [
  '127.0.0.1', '~~', '~~!@'
];
const IoTDeviceAddresses = [
  '123.123.123.12','~'
];

// Logging
if (!process.env.IS_TEST_ENV) {
  app.use(morgan('short'));
}

// Authority check logic, Check the full node's blockchain.
const authorityCheck = (req, res, next) => {
  next();
}

app.get('/fullnode/', (req, res, next) => {
  res.send(fullNodeAddress);
});

// Get all edge devices List.
app.get('/edgeList/', authorityCheck, (req, res, next) => {
  res.send(edgeDeviceAddresses);
});

// Get all IoT list
app.get('/IoTList/', authorityCheck, (req, res, next) => {
  res.send(IoTDeviceAddresses);
});

// Create a new address
app.post('/edgeList/', authorityCheck, (req, res, next) => {
  // edge device request to put it's address to the list.
  // return the address of full node.
  const newIP = req.ip;
  edgeDeviceAddresses.unshift(newIP);
  res.send('Your IP address is succesfully added to the list.')
});

// Create a new address
app.post('/IoTList/', authorityCheck, (req, res, next) => {
  // edge device request to put it's address to the list.
  // return the address of full node.
  const newIP = req.ip;
  IoTDeviceAddresses.unshift(newIP);
  res.send('Your IP address is succesfully added to the list.')
});

// Update the list
app.put('/edgeList/', (req, res, next) => {
  // find index of requester's IP address in edge device list,
  // and move that device to the first place of the list
  const edgeDeviceIP = req.ip;
  const edgeDeviceIndex = edgeDeviceAddresses.findIndex(address => address === edgeDeviceIP);
  if (edgeDeviceIndex === -1) {
    return res.status(404).send('This IP address is not valid address.');
  }
  edgeDeviceAddresses.splice(edgeDeviceIndex, 1);
  edgeDeviceAddresses.unshift(edgeDeviceIP);
  res.send('List updated.');
});

// Update the list
app.put('/IoTList/', (req, res, next) => {
  // find index of requester's IP address in IoT device list,
  // and move that device to the first place of the list
  const IoTDeviceIP = req.ip;
  const IoTDeviceIndex = IoTDeviceAddresses.findIndex(address => address === edgeDeviceIP);
  if (IoTDeviceIndex === -1) {
    return res.status(404).send('This IP address is not valid address.');
  }
  IoTDeviceAddresses.splice(IoTDeviceIndex, 1);
  IoTDeviceAddresses.unshift(IoTDeviceIP);
  res.send('List updated.');
});

// Delete an address from the list.
app.delete('/edgeList/', (req, res, next) => {
  const edgeDeviceIP = req.ip;
  const edgeDeviceIndex = edgeDeviceAddresses.findIndex(address => address === edgeDeviceIP);
  if (edgeDeviceIndex === -1) {
    return res.status(404).send('This IP address is not valid address.');
  }
  edgeDeviceAddresses.splice(edgeDeviceIndex, 1);
  res.status(204).send('Your IP address is successfully deleted from the list.');
});

// Delete an address from the list.
app.delete('/IoTList/', (req, res, next) => {
  const IoTDeviceIP = req.ip;
  const IoTDeviceIndex = IoTDeviceAddresses.findIndex(address => address === edgeDeviceIP);
  if (IoTDeviceIndex === -1) {
    return res.status(404).send('This IP address is not valid address.');
  }
  IoTDeviceAddresses.splice(IoTDeviceIndex, 1);
  res.status(204).send('Your IP address is successfully deleted from the list.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`DNS server is listening on port ${PORT}...`);
});
