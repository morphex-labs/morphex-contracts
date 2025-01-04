const {
  contractAt,
  sendTxn,
  updateTokensPerInterval,
} = require("../shared/helpers");
const { ethers } = require("hardhat");
const {
  BASE_DEPLOY_KEY,
  BASE_URL,
  FTM_URL,
  MODE_URL,
} = require("../../env.json");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Configuration
const network = "fantom"; // set to network you want to update on
const additionalRevenueSources = {
  freestyleUSDC: "0", // set this, 6 decimals
  basedMediaXETH: "0", // set this, 18 decimals
};
const USER_ADDRESS = "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce";

// Constants
const API_ENDPOINTS = {
  quote: "https://api.odos.xyz/sor/quote/v2",
  assemble: "https://api.odos.xyz/sor/assemble",
};
const FREESTYLE_ALLOCATIONS = {
  singleStaking: 25, // swap to weth
  bltMlt: 30, // swap to weth
  bribes: 35,
  burnBmx: 10, // swap to BMX
};
const BASED_MEDIAX_ALLOCATIONS = {
  singleStaking: 55,
  bltMlt: 20,
  bribes: 20,
  burnBmx: 5, // swap to BMX
};

// Contract ABIs
const VELOCIMETER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "notifyRewardAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const AERODROME_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_rewardsToken", type: "address" },
      { internalType: "uint256", name: "reward", type: "uint256" },
    ],
    name: "notifyRewardAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Helper Functions
function logSectionHeader(title) {
  console.log("\n" + "=".repeat(50));
  console.log(`${title}`);
  console.log("=".repeat(50));
}
function logTransactionHash(type, hash) {
  console.log("\n📝 Transaction Hash:");
  console.log(`${type}:`);
  console.log(`${hash}`);
}
function logBalance(label, amount, decimals = 18, symbol = "ETH") {
  console.log(
    `${label}: ${amount.toString()} (${ethers.utils.formatUnits(
      amount,
      decimals
    )} ${symbol})`
  );
}
async function logFinalSummary(
  freestyleResults,
  basedMediaXResults,
  classicRewardBalance
) {
  logSectionHeader("Final Distribution Summary");

  console.log("\n🏆 Classic Revenue:");
  logBalance("Total Classic ETH", classicRewardBalance);

  console.log("\n🎯 Additional Revenue Sources:");
  if (freestyleResults?.bribes) {
    console.log("\nFreestyle Bribes:");
    logBalance("Amount", freestyleResults.bribes.amount, 6, "USDC");
  }
  if (basedMediaXResults?.bribes) {
    console.log("\nBased MediaX Bribes:");
    logBalance("Amount", basedMediaXResults.bribes.amount, 18, "ETH");
  }
}

async function encodeFunctionCall(abi, functionName, params) {
  const iface = new ethers.utils.Interface(abi);
  return iface.encodeFunctionData(functionName, params);
}

async function createQuoteRequest(chainId, toTokenAddress, inputTokens) {
  return {
    chainId,
    inputTokens,
    outputTokens: [
      {
        tokenAddress: toTokenAddress,
        proportion: 1,
      },
    ],
    userAddr: USER_ADDRESS,
    slippageLimitPercent: 1,
    referralCode: 0,
    disableRFQs: true,
    compact: true,
  };
}

async function requestQuote(tokens, toTokenAddress, chainId) {
  const requestBody = await createQuoteRequest(chainId, toTokenAddress, tokens);
  console.log(`Getting quote for ${toTokenAddress}...`);

  const response = await fetch(API_ENDPOINTS.quote, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Quote Error:",
      response.status,
      response.statusText,
      errorText
    );
    throw new Error("Quote request failed");
  }

  const quote = await response.json();
  console.log("Quote generated successfully");
  return quote;
}

async function assembleAndExecuteTransaction(quote, wallet, provider) {
  const assembleRequestBody = {
    userAddr: USER_ADDRESS,
    pathId: quote.pathId,
    simulate: true,
  };

  console.log("Assembling transaction...");
  const response = await fetch(API_ENDPOINTS.assemble, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assembleRequestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Assembly Error:",
      response.status,
      response.statusText,
      errorText
    );
    throw new Error("Transaction assembly failed");
  }

  const assembled = await response.json();
  console.log("Transaction assembled");

  const transaction = {
    ...assembled.transaction,
    gasLimit: assembled.transaction.gas,
    value: parseInt(assembled.transaction.value),
  };
  delete transaction.gas;

  const signedTx = await wallet.signTransaction(transaction);
  const txResponse = await provider.sendTransaction(signedTx);
  const receipt = await txResponse.wait();

  console.log("Transaction executed:", receipt.transactionHash);
  return receipt;
}

async function getFantomValues() {
  const chainId = 250;
  const provider = new ethers.providers.JsonRpcProvider(FTM_URL);
  const rewardToken = await contractAt(
    "Token",
    "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
  );
  const govToken = await contractAt(
    "Token",
    "0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb"
  );
  const usdcToken = await contractAt(
    "Token",
    "0x2F733095B80A04b38b0D10cC884524a3d09b836a"
  );

  const swapTokenArr = [
    "0x695921034f0387eAc4e11620EE91b1b15A6A09fE", // lzWETH
    "0xfe7eDa5F2c56160d406869A8aA4B2F365d544C7B", // axlWETH
    "0xf1648C50d2863f780c57849D812b4B7686031A3D", // lzWBTC
    "0x448d59B4302aB5d2dadf9611bED9457491926c8e", // axlWBTC
    "0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf", // lzUSDC
    "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4", // axlUSDC
    "0xcc1b99dDAc1a33c201a742A1851662E87BC7f22C", // lzUSDT
    "0xd226392C23fb3476274ED6759D4a478db3197d82", // axlUSDT
    "0x2F733095B80A04b38b0D10cC884524a3d09b836a", // USDC.e
  ];
  const rewardTrackerArr = [
    {
      name: "feeGmxDistributor",
      address: "0x1d556F411370E5F1850A51EB66960798e6F5eDeC",
      allocation: 10,
    },
    {
      name: "feeGlpDistributor",
      address: "0xF8182960A4C23e3db610E031C5cb0C9D01D2299f",
      allocation: 60,
    },
    {
      name: "velocimeterGauge",
      address: "0x172bbbE7B3575865a0B7D51e044b1bCb75f9780E",
      allocation: 30,
      abi: VELOCIMETER_ABI,
    },
  ];

  return {
    chainId,
    provider,
    rewardToken,
    rewardTrackerArr,
    swapTokenArr,
    govToken,
    usdcToken,
  };
}

async function getBaseValues() {
  const chainId = 8453;
  const provider = new ethers.providers.JsonRpcProvider(BASE_URL);
  const rewardToken = await contractAt(
    "Token",
    "0x4200000000000000000000000000000000000006"
  );
  const govToken = await contractAt(
    "Token",
    "0x548f93779fBC992010C07467cBaf329DD5F059B7"
  );
  const usdcToken = await contractAt(
    "Token",
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  );

  const swapTokenArr = [
    "0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad", // axlWBTC
    "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", // USDbC
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    "0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239", // YFI
    "0x940181a94A35A4569E4529A3CDfB74e38FD98631", // AERO
    "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
    "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22", // cbETH
    "0x2Da56AcB9Ea78330f947bD57C54119Debda7AF71", // MOG
    "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42", // EURC
    "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", // cbBTC
    "0xA88594D404727625A9437C3f886C7643872296AE", // WELL
  ];
  const rewardTrackerArr = [
    {
      name: "feeGmxDistributor",
      address: "0x0259083181Ae54730f4FBB1C174a53E21BCE5266",
      allocation: 15,
    },
    {
      name: "feeGlpDistributor",
      address: "0x06c35893Ba9bc454e12c36F4117BC99f75e34346",
      allocation: 60,
    },
    // {
    //   name: "aerodromeBribes", // BMX-wBLT
    //   address: "0xE1e4637738e575F90d02B3fA18b55373Dc510522",
    //   allocation: 30,
    //   abi: aerodromeAbi,
    // },
  ];

  return {
    chainId,
    provider,
    rewardToken,
    rewardTrackerArr,
    swapTokenArr,
    govToken,
    usdcToken,
  };
}

async function getModeValues() {
  const chainId = 34443;
  const provider = new ethers.providers.JsonRpcProvider(MODE_URL);
  const rewardToken = await contractAt(
    "Token",
    "0x4200000000000000000000000000000000000006"
  );
  const govToken = await contractAt(
    "Token",
    "0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb"
  );
  const usdcToken = await contractAt(
    "Token",
    "0xd988097fb8612cc24eeC14542bC03424c656005f"
  );

  const swapTokenArr = [
    "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A", // weETH
    "0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF", // wBTC
    "0xDfc7C877a950e49D2610114102175A06C2e3167a", // MODE
    "0xd988097fb8612cc24eeC14542bC03424c656005f", // USDC
  ];
  const rewardTrackerArr = [
    {
      name: "feeGmxDistributor",
      address: "0x26e6C47682FfC1824d7aC5512752FC671dA5e607",
      allocation: 15,
    },
    {
      name: "feeGlpDistributor",
      address: "0x366152Fc0FC4680e0A05ce9739a4210228C72BA3",
      allocation: 60,
    },
    // {
    //   name: "aerodromeBribes", // BMX-wMLT
    //   address: "",
    //   allocation: 30,
    //   abi: aerodromeAbi,
    // },
  ];

  return {
    chainId,
    provider,
    rewardToken,
    rewardTrackerArr,
    swapTokenArr,
    govToken,
    usdcToken,
  };
}

function getValues() {
  if (network === "base") {
    return getBaseValues();
  }
  if (network === "fantom") {
    return getFantomValues();
  }
  if (network === "mode") {
    return getModeValues();
  }

  throw new Error("Invalid network");
}

// Revenue Processing Functions
async function processClassicRevenue(
  tokens,
  rewardToken,
  wallet,
  provider,
  chainId,
  basedMediaXETH
) {
  logSectionHeader("Processing Classic Revenue");
  if (tokens.length === 0) {
    console.log("No classic revenue tokens to process");
    const balanceRaw = await rewardToken.balanceOf(USER_ADDRESS);
    const balance = balanceRaw.sub(basedMediaXETH);
    logBalance("Classic Revenue Final Balance", balance);
    return balance;
  }

  if (tokens.length > 6) {
    const mid = Math.ceil(tokens.length / 2);
    const firstHalf = tokens.slice(0, mid);
    const secondHalf = tokens.slice(mid);

    const firstQuote = await requestQuote(
      firstHalf,
      rewardToken.address,
      chainId
    );
    await assembleAndExecuteTransaction(firstQuote, wallet, provider);

    const secondQuote = await requestQuote(
      secondHalf,
      rewardToken.address,
      chainId
    );
    await assembleAndExecuteTransaction(secondQuote, wallet, provider);
  } else {
    const quote = await requestQuote(tokens, rewardToken.address, chainId);
    await assembleAndExecuteTransaction(quote, wallet, provider);
  }

  const finalBalanceWithBasedMediaX = await rewardToken.balanceOf(USER_ADDRESS);
  const finalBalance = finalBalanceWithBasedMediaX.sub(basedMediaXETH);
  logBalance("Classic Revenue Final Balance", finalBalance);
  return finalBalance;
}

async function processFreestyleRevenue(
  freestyleUSDC,
  allocations,
  rewardToken,
  govToken,
  wallet,
  provider,
  chainId,
  classicRewardBalance
) {
  logSectionHeader("Processing Freestyle Revenue");
  if (freestyleUSDC.amount.isZero() || chainId === 250) {
    console.log("No Freestyle revenue to process");
    return null;
  }

  console.log(
    `Total amount: ${freestyleUSDC.amount.toString()}, ${ethers.utils.formatUnits(
      freestyleUSDC.amount,
      6
    )} USDC`
  );

  const amounts = {
    singleStaking: freestyleUSDC.amount.mul(allocations.singleStaking).div(100),
    bltMlt: freestyleUSDC.amount.mul(allocations.bltMlt).div(100),
    bribes: freestyleUSDC.amount.mul(allocations.bribes).div(100),
    burnBmx: freestyleUSDC.amount.mul(allocations.burnBmx).div(100),
  };

  // Log allocations
  Object.entries(amounts).forEach(([key, value]) => {
    console.log(
      `${key}: ${value.toString()}, ${ethers.utils.formatUnits(value, 6)} USDC`
    );
  });

  const result = {
    singleStaking: ethers.BigNumber.from(0),
    bltMlt: ethers.BigNumber.from(0),
    bribes: {
      tokenAddress: freestyleUSDC.tokenAddress,
      amount: amounts.bribes,
    },
    hasBurnedBMX: false,
  };

  // Process single staking
  const singleQuote = await requestQuote(
    [
      {
        tokenAddress: freestyleUSDC.tokenAddress,
        amount: amounts.singleStaking.toString(),
      },
    ],
    rewardToken.address,
    chainId
  );
  await assembleAndExecuteTransaction(singleQuote, wallet, provider);
  const singleStakingBalance = await rewardToken.balanceOf(USER_ADDRESS);
  result.singleStaking = singleStakingBalance
    .sub(classicRewardBalance)
    .sub(additionalRevenueSources.basedMediaXETH);

  // Process BLT/MLT
  const bltMltQuote = await requestQuote(
    [{ tokenAddress: freestyleUSDC.tokenAddress, amount: amounts.bltMlt.toString() }],
    rewardToken.address,
    chainId
  );
  await assembleAndExecuteTransaction(bltMltQuote, wallet, provider);
  const bltMltBalance = await rewardToken.balanceOf(USER_ADDRESS);
  result.bltMlt = bltMltBalance
    .sub(classicRewardBalance)
    .sub(additionalRevenueSources.basedMediaXETH)
    .sub(result.singleStaking);

  // Process BMX burning
  console.log("Buying BMX from Freestyle revenue...");
  const burnQuote = await requestQuote(
    [{ tokenAddress: freestyleUSDC.tokenAddress, amount: amounts.burnBmx.toString() }],
    govToken.address,
    chainId
  );
  const burnTx = await assembleAndExecuteTransaction(
    burnQuote,
    wallet,
    provider
  );
  logTransactionHash("Freestyle BMX Purchase", burnTx.transactionHash);
  result.hasBurnedBMX = true;

  return result;
}

async function processBasedMediaXRevenue(
  basedMediaXETH,
  allocations,
  govToken,
  wallet,
  provider,
  chainId
) {
  logSectionHeader("Processing Based MediaX Revenue");
  if (basedMediaXETH.amount === "0" || chainId === 250) {
    console.log("No Based MediaX revenue to process");
    return null;
  }

  console.log(
    `Total amount: ${basedMediaXETH.amount}, ${ethers.utils.formatEther(
      basedMediaXETH.amount
    )} ETH`
  );

  const amounts = {
    singleStaking: ethers.BigNumber.from(basedMediaXETH.amount)
      .mul(allocations.singleStaking)
      .div(100),
    bltMlt: ethers.BigNumber.from(basedMediaXETH.amount).mul(allocations.bltMlt).div(100),
    bribes: ethers.BigNumber.from(basedMediaXETH.amount).mul(allocations.bribes).div(100),
    burnBmx: ethers.BigNumber.from(basedMediaXETH.amount).mul(allocations.burnBmx).div(100),
  };

  // Log allocations
  Object.entries(amounts).forEach(([key, value]) => {
    console.log(
      `${key}: ${value.toString()}, ${ethers.utils.formatEther(value)} ETH`
    );
  });

  const result = {
    singleStaking: amounts.singleStaking,
    bltMlt: amounts.bltMlt,
    bribes: {
      tokenAddress: basedMediaXETH.tokenAddress,
      amount: amounts.bribes,
    },
    hasBurnedBMX: false,
  };

  // Process BMX burning
  console.log("Buying BMX from Based MediaX revenue...");
  const burnQuote = await requestQuote(
    [{ tokenAddress: basedMediaXETH.tokenAddress, amount: amounts.burnBmx.toString() }],
    govToken.address,
    chainId
  );
  const burnTx = await assembleAndExecuteTransaction(
    burnQuote,
    wallet,
    provider
  );
  logTransactionHash("Based MediaX BMX Purchase", burnTx.transactionHash);
  result.hasBurnedBMX = true;

  return result;
}

async function burnAccumulatedBMX(govToken) {
  logSectionHeader("Burning Accumulated BMX");
  const burnAmount = await govToken.balanceOf(USER_ADDRESS);
  if (burnAmount?.gt(0)) {
    logBalance("BMX to burn", burnAmount, 18, "BMX");
    const tx = await sendTxn(
      govToken.transfer(
        "0x000000000000000000000000000000000000dEaD",
        burnAmount,
        {
          gasLimit: 500000,
        }
      ),
      `Burning BMX`
    );
    logTransactionHash("BMX Burned", tx.hash);
  }
}

async function distributeRewards(
  rewardTrackerArr,
  rewardToken,
  rewardTokenBalance,
  totalSingleStaking,
  totalBltMlt,
  wallet
) {
  console.log("\nDistributing rewards...");
  for (const { name, address, allocation, abi } of rewardTrackerArr) {
    const baseAllocation = rewardTokenBalance.mul(allocation).div(100);
    const additionalAmount =
      allocation === 10 // adjust based on chain
        ? totalSingleStaking
        : allocation === 60
        ? totalBltMlt
        : ethers.BigNumber.from(0);

    const totalAllocation = baseAllocation.add(additionalAmount);
    console.log(
      `\n${name} distribution:`,
      `\nBase allocation: ${ethers.utils.formatEther(baseAllocation)} ETH`,
      `\nAdditional amount: ${ethers.utils.formatEther(additionalAmount)} ETH`,
      `\nTotal: ${ethers.utils.formatEther(totalAllocation)} ETH`
    );

    if (name === "velocimeterGauge" || name === "aerodromeBribes") {
      const data = await encodeFunctionCall(abi, "notifyRewardAmount", [
        rewardToken.address,
        totalAllocation,
      ]);

      await sendTxn(
        wallet.sendTransaction({ to: address, data }),
        `${name}.notifyRewardAmount`
      );
    } else {
      const rewardDistributor = await contractAt("RewardDistributor", address);
      // const finalAmount =
      //   allocation === 15
      //     ? totalAllocation.add("328125000000000000")
      //     : totalAllocation;
      const rewardsPerInterval = totalAllocation.div(7 * 24 * 60 * 60); // set to finalAmount if base
      console.log(
        "Rewards per interval:",
        ethers.utils.formatEther(rewardsPerInterval)
      );

      await sendTxn(
        rewardToken.transfer(rewardDistributor.address, totalAllocation, {
          gasLimit: 500000,
        }),
        `rewardToken.transfer ${name}`
      );

      await updateTokensPerInterval(
        rewardDistributor,
        rewardsPerInterval,
        "rewardDistributor"
      );
    }
  }
}

async function main() {
  const {
    chainId,
    provider,
    rewardToken,
    rewardTrackerArr,
    swapTokenArr,
    govToken,
    usdcToken,
  } = await getValues();
  const wallet = new ethers.Wallet(BASE_DEPLOY_KEY, provider);

  logSectionHeader("Beginning Revenue Processing");
  // Calculate initial balances for classic revenue
  const classicTokenBalances = [];

  for (const tokenAddress of swapTokenArr) {
    const token = await contractAt("Token", tokenAddress);
    const balance = await token.balanceOf(USER_ADDRESS);
    const decimals = await token.decimals();
    const symbol = await token.symbol();

    if (balance.gt(0)) {
      // Handle USDC separately to account for Freestyle revenue
      if (tokenAddress.toLowerCase() === usdcToken.address.toLowerCase()) {
        const classicAmount = balance.sub(
          additionalRevenueSources.freestyleUSDC
        );

        if (classicAmount.gt(0)) {
          classicTokenBalances.push({
            tokenAddress,
            amount: classicAmount.toString(),
          });
          logBalance(`Classic ${symbol}`, classicAmount, decimals, symbol);
        }
      }
      // Handle all other tokens normally
      else {
        classicTokenBalances.push({
          tokenAddress,
          amount: balance.toString(),
        });
        logBalance(`Classic ${symbol}`, balance, decimals, symbol);
      }
    }
  }

  // Process classic revenue first
  const classicRewardBalance = await processClassicRevenue(
    classicTokenBalances,
    rewardToken,
    wallet,
    provider,
    chainId,
    additionalRevenueSources.basedMediaXETH
  );

  // Process Freestyle revenue (USDC)
  const freestyleResults = await processFreestyleRevenue(
    {
      tokenAddress: usdcToken.address,
      amount: ethers.BigNumber.from(additionalRevenueSources.freestyleUSDC),
    },
    FREESTYLE_ALLOCATIONS,
    rewardToken,
    govToken,
    wallet,
    provider,
    chainId,
    classicRewardBalance
  );

  // Process Based MediaX revenue (wETH)
  const basedMediaXResults = await processBasedMediaXRevenue(
    {
      tokenAddress: rewardToken.address,
      amount: additionalRevenueSources.basedMediaXETH,
    },
    BASED_MEDIAX_ALLOCATIONS,
    govToken,
    wallet,
    provider,
    chainId
  );

  // Burn accumulated BMX if any was purchased
  if (freestyleResults?.hasBurnedBMX || basedMediaXResults?.hasBurnedBMX) {
    await burnAccumulatedBMX(govToken);
  }

  // Calculate total allocations from additional revenue sources only
  const totalSingleStaking = ethers.BigNumber.from(0)
    .add(freestyleResults?.singleStaking || 0)
    .add(basedMediaXResults?.singleStaking || 0);

  const totalBltMlt = ethers.BigNumber.from(0)
    .add(freestyleResults?.bltMlt || 0)
    .add(basedMediaXResults?.bltMlt || 0);

  logFinalSummary(freestyleResults, basedMediaXResults, classicRewardBalance);

  // Distribute rewards using only classic revenue balance
  await distributeRewards(
    rewardTrackerArr,
    rewardToken,
    classicRewardBalance,
    totalSingleStaking,
    totalBltMlt,
    wallet
  );

  console.log("\nReward distribution completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
