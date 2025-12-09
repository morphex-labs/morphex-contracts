const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const CSV_PATH = path.join(__dirname, 'balances_sbfBMX.csv');
const OUTPUT_PATH = path.join(__dirname, 'veilAirdropOutput.txt');
const DECIMALS = 18;
const TOTAL_VEIL_WEI = ethers.utils.parseUnits('166667', DECIMALS);
const MIN_BALANCE_WEI = ethers.utils.parseUnits('1', DECIMALS);

function readEligibleAccounts(csvPath) {
	const content = fs.readFileSync(csvPath, 'utf8');
	const lines = content.split(/\r?\n/);
	const accounts = [];
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;
		if (i === 0) {
			// skip header
			continue;
		}
		const parts = line.split(',');
		if (parts.length < 2) continue;
		const address = parts[0].trim();
		const balanceStr = parts[1].trim();
		if (!address || !balanceStr) continue;
		let balanceWei;
		try {
			balanceWei = ethers.utils.parseUnits(balanceStr, DECIMALS);
		} catch (e) {
			continue;
		}
		if (balanceWei.lt(MIN_BALANCE_WEI)) continue;
		accounts.push({ address, balanceWei });
	}
	return accounts;
}

function chunkArray(arr, chunkCount) {
	const result = [];
	const chunkSize = Math.ceil(arr.length / chunkCount);
	for (let i = 0; i < chunkCount; i++) {
		const start = i * chunkSize;
		const end = Math.min(start + chunkSize, arr.length);
		result.push(arr.slice(start, end));
	}
	return result;
}

function main() {
	const accounts = readEligibleAccounts(CSV_PATH);
	if (accounts.length === 0) {
		console.error('No eligible accounts (balance >= 1) found.');
		process.exit(1);
	}

	const totalBalanceWei = accounts.reduce((acc, a) => acc.add(a.balanceWei), ethers.BigNumber.from(0));
	if (totalBalanceWei.isZero()) {
		console.error('Total eligible balance is zero.');
		process.exit(1);
	}

	console.log('Total eligible source balance used:', ethers.utils.formatUnits(totalBalanceWei, DECIMALS));

	const addresses = accounts.map(a => a.address);
	let amountsWei = accounts.map(a => TOTAL_VEIL_WEI.mul(a.balanceWei).div(totalBalanceWei));

	// fix rounding remainder so total equals exactly TOTAL_VEIL_WEI
	const allocated = amountsWei.reduce((acc, x) => acc.add(x), ethers.BigNumber.from(0));
	const remainder = TOTAL_VEIL_WEI.sub(allocated);
	if (remainder.gt(0)) {
		let maxIdx = 0;
		for (let i = 1; i < accounts.length; i++) {
			if (accounts[i].balanceWei.gt(accounts[maxIdx].balanceWei)) maxIdx = i;
		}
		amountsWei[maxIdx] = amountsWei[maxIdx].add(remainder);
	}

	const addressChunks = chunkArray(addresses, 4);
	const amountChunks = chunkArray(amountsWei, 4);

	const lines = [];
	for (let i = 0; i < 4; i++) {
		const addrChunk = addressChunks[i];
		const amtChunk = amountChunks[i];
		const addrArrayStr = `[${addrChunk.join(',')}]`;
		const amtArrayStr = `[${amtChunk.map(a => a.toString()).join(',')}]`;
		lines.push(`addresses_part${i + 1}=${addrArrayStr}`);
		lines.push(`amounts_part${i + 1}=${amtArrayStr}`);
	}

	fs.writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf8');
	console.log(`Wrote airdrop arrays to ${OUTPUT_PATH}`);
}

main();


