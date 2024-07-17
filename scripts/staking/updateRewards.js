const {
  contractAt,
  sendTxn,
  updateTokensPerInterval,
} = require("../shared/helpers");
const { ethers } = require("hardhat");
const { BASE_DEPLOY_KEY, BASE_URL, FTM_URL } = require("../../env.json");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const network = "fantom"; // set to network you want to update on
const quoteUrl = "https://api.odos.xyz/sor/quote/v2";
const assembleUrl = "https://api.odos.xyz/sor/assemble";
const userAddress = "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce";
const velocimeterAbi = [
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
const aerodromeAbi = [
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

// Function to encode function call data
async function encodeFunctionCall(abi, functionName, params) {
  const iface = new ethers.utils.Interface(abi);
  return iface.encodeFunctionData(functionName, params);
}

async function getFantomValues() {
  const chainId = 250;
  const provider = new ethers.providers.JsonRpcProvider(FTM_URL);
  const rewardToken = await contractAt(
    "Token",
    "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"
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
      abi: velocimeterAbi,
    },
  ];

  return {
    chainId,
    provider,
    rewardToken,
    rewardTrackerArr,
    swapTokenArr,
  };
}

async function getBaseValues() {
  const chainId = 8453;
  const provider = new ethers.providers.JsonRpcProvider(BASE_URL);
  const rewardToken = await contractAt(
    "Token",
    "0x4200000000000000000000000000000000000006"
  );

  const swapTokenArr = [
    "0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad", // axlWBTC
    "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", // USDbC
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    "0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239", // YFI
    "0x940181a94A35A4569E4529A3CDfB74e38FD98631", // AERO
    "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
    "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22", // cbETH
  ];
  const rewardTrackerArr = [
    {
      name: "feeGmxDistributor",
      address: "0x0259083181Ae54730f4FBB1C174a53E21BCE5266",
      allocation: 10,
    },
    {
      name: "feeGlpDistributor",
      address: "0x06c35893Ba9bc454e12c36F4117BC99f75e34346",
      allocation: 60,
    },
    {
      name: "aerodromeBribes", // BMX-wBLT
      address: "0xE1e4637738e575F90d02B3fA18b55373Dc510522",
      allocation: 30,
      abi: aerodromeAbi,
    },
  ];

  return {
    chainId,
    provider,
    rewardToken,
    rewardTrackerArr,
    swapTokenArr,
  };
}

async function getModeValues() {
  const chainId = 34443;
  const provider = new ethers.providers.JsonRpcProvider(BASE_URL);
  const rewardToken = await contractAt(
    "Token",
    "0x4200000000000000000000000000000000000006"
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
      allocation: 10,
    },
    {
      name: "feeGlpDistributor",
      address: "0x366152Fc0FC4680e0A05ce9739a4210228C72BA3",
      allocation: 60,
    },
    {
      name: "aerodromeBribes", // BMX-wMLT
      address: "",
      allocation: 30,
      abi: aerodromeAbi,
    },
  ];

  return {
    chainId,
    provider,
    rewardToken,
    rewardTrackerArr,
    swapTokenArr,
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

async function main() {
  const { chainId, provider, rewardToken, rewardTrackerArr, swapTokenArr } =
    await getValues();
  const wallet = new ethers.Wallet(BASE_DEPLOY_KEY, provider);

  const quoteRequestBody = {
    chainId: chainId,
    inputTokens: [],
    outputTokens: [
      {
        tokenAddress: rewardToken.address,
        proportion: 1,
      },
    ],
    userAddr: userAddress,
    slippageLimitPercent: 1, // 1 = 1%
    referralCode: 0,
    disableRFQs: true,
    compact: true,
  };

  console.log("Calculating balances...");
  const feeTokenBalances = [];
  for (let i = 0; i < swapTokenArr.length; i++) {
    const feeTokenAddress = swapTokenArr[i];
    const feeToken = await contractAt("Token", feeTokenAddress);
    const feeTokenBalance = await feeToken.balanceOf(userAddress);
    if (feeTokenBalance.toString() !== "0") {
      feeTokenBalances.push({
        tokenAddress: feeTokenAddress,
        amount: feeTokenBalance.toString(),
      });
    }
    console.log(`${feeTokenAddress}:`, feeTokenBalance.toString());
  }

  async function requestQuote(tokens) {
    const requestBody = {
      ...quoteRequestBody,
      inputTokens: tokens,
    };
    console.log("Getting quote...");
    const response = await fetch(quoteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {
      const quote = await response.json();
      console.log("Generated quote!");
      return quote;
    } else {
      const errorText = await response.text();
      console.error(
        "Error in Quote:",
        response.status,
        response.statusText,
        errorText
      );
      throw new Error("Quote request failed");
    }
  }

  async function assembleAndSendTransaction(quote) {
    const assembleRequestBody = {
      userAddr: userAddress,
      pathId: quote.pathId,
      simulate: true,
    };

    console.log("Assembling transaction...");
    const response = await fetch(assembleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assembleRequestBody),
    });

    if (response.status === 200) {
      const assembledTransaction = await response.json();
      console.log("Assembled transaction!", assembledTransaction);

      console.log("Sending swap transaction...");

      const transaction = {
        ...assembledTransaction.transaction,
        gasLimit: assembledTransaction.transaction.gas,
        value: parseInt(assembledTransaction.transaction.value),
      };
      delete transaction.gas;

      const signedTx = await wallet.signTransaction(transaction);
      const txResponse = await provider.sendTransaction(signedTx);
      const txReceipt = await txResponse.wait();

      console.log("Transaction Hash:", txReceipt.transactionHash);

      return txReceipt;
    } else {
      const errorText = await response.text();
      console.error(
        "Error in Transaction Assembly:",
        response.status,
        response.statusText,
        errorText
      );
      throw new Error("Transaction assembly failed");
    }
  }

  if (feeTokenBalances.length > 6) {
    const mid = Math.ceil(feeTokenBalances.length / 2);
    const firstHalf = feeTokenBalances.slice(0, mid);
    const secondHalf = feeTokenBalances.slice(mid);

    const firstQuote = await requestQuote(firstHalf);
    await assembleAndSendTransaction(firstQuote);

    const secondQuote = await requestQuote(secondHalf);
    await assembleAndSendTransaction(secondQuote);
  } else {
    const quote = await requestQuote(feeTokenBalances);
    await assembleAndSendTransaction(quote);
  }

  const rewardTokenBalance = await rewardToken.balanceOf(userAddress);
  console.log(
    "rewardTokenBalance",
    rewardTokenBalance.toString(),
    ethers.utils.formatEther(rewardTokenBalance)
  );

  console.log("Updating rewards...");
  for (let i = 0; i < rewardTrackerArr.length; i++) {
    const { name, address, allocation } = rewardTrackerArr[i];
    const rewardAllocation = rewardTokenBalance.mul(allocation).div(100);
    console.log(`${name} rewardAllocation`, rewardAllocation.toString());

    if (name === "velocimeterGauge") {
      const data = await encodeFunctionCall(
        rewardTrackerArr[i].abi,
        "notifyRewardAmount",
        [rewardToken.address, rewardAllocation]
      );

      const tx = {
        to: address,
        data: data,
      };
      await sendTxn(
        wallet.sendTransaction(tx),
        `velocimeterGauge.notifyRewardAmount`
      );
    } else if (name === "aerodromeBribes") {
      const data = await encodeFunctionCall(
        rewardTrackerArr[i].abi,
        "notifyRewardAmount",
        [rewardToken.address, rewardAllocation]
      );

      const tx = {
        to: address,
        data: data,
      };
      await sendTxn(
        wallet.sendTransaction(tx),
        `aerodromeBribes.notifyRewardAmount`
      );
    } else {
      const rewardDistributor = await contractAt("RewardDistributor", address);
      const rewardsPerInterval = rewardAllocation.div(7 * 24 * 60 * 60);
      console.log("rewardsPerInterval", rewardsPerInterval.toString());

      await sendTxn(
        rewardToken.transfer(rewardDistributor.address, rewardAllocation, {
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
  console.log("Rewards updated!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
