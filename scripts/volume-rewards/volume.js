const fs = require('fs');
const { ethers } = require('ethers');

const filename = 'weeks/week10.csv'; // change this to the week you want to calculate
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
    addresses.push(`"${address.trim()}"`);
    const weiNumber = ethers.utils.parseEther(number.trim());
    numbers.push(weiNumber.toString());
    outputObj[address.trim()] = weiNumber.toString();
  });

  console.log('Addresses:', `[${addresses.join(',')}]`);
  console.log('Numbers (in wei):', numbers.join());

  const totalSum = numbers.reduce((accumulator, currentValue) => {
    return ethers.BigNumber.from(accumulator).add(ethers.BigNumber.from(currentValue));
  }, ethers.BigNumber.from('0'));

  console.log('Total sum of the numbers:', ethers.utils.formatEther(totalSum));

  fs.writeFile(outputFilename, JSON.stringify(outputObj), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Parsed data written to ${outputFilename}`);
  });
});
