const fs = require('fs');
const { ethers } = require('ethers');

const filename = 'week4.csv';
const outputFilename = 'output.json';

const outputObj = {};
const addresses = [];
const numbers = [];

fs.readFile(filename, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  data.split('\n').forEach(line => {
    const [address, number] = line.trim().split(',');
    addresses.push(address.trim());
    const weiNumber = ethers.utils.parseEther(number.trim());
    numbers.push(weiNumber.toString());
    outputObj[address.trim()] = weiNumber.toString();
  });

  console.log('Addresses:', JSON.stringify(addresses).replace(/\"/g, ''));
  console.log('Numbers (in wei):', numbers.join());

  fs.writeFile(outputFilename, JSON.stringify(outputObj), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Parsed data written to ${outputFilename}`);
  });
});
