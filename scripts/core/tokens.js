// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
const { expandDecimals } = require("../../test/shared/utilities")

module.exports = {
  fantom: {
    ftm: {
      name: "ftm",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18,
      priceFeed: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 41000,
      minProfitBps: 0,
      maxUsdgAmount: 800 * 1000,
      bufferAmount: 400 * 1000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 300 * 1000,
      maxGlobalShortSize: 150 * 1000,
      spreadBasisPoints: 0
    },
    lzeth: {
      name: "lzeth",
      address: "0x695921034f0387eAc4e11620EE91b1b15A6A09fE",
      decimals: 18,
      priceFeed: "0x11DdD3d147E5b83D01cee7070027092397d63658",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 2500,
      minProfitBps: 0,
      maxUsdgAmount: 150 * 1000,
      bufferAmount: 8,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 20 * 1000,
      maxGlobalShortSize: 10 * 1000
    },
    axleth: {
      name: "axleth",
      address: "0xfe7eDa5F2c56160d406869A8aA4B2F365d544C7B",
      decimals: 18,
      priceFeed: "0x11DdD3d147E5b83D01cee7070027092397d63658",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 2500,
      minProfitBps: 0,
      maxUsdgAmount: 150 * 1000,
      bufferAmount: 8,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 25 * 1000,
      maxGlobalShortSize: 10 * 1000
    },
    lzbtc: {
      name: "lzbtc",
      address: "0xf1648C50d2863f780c57849D812b4B7686031A3D",
      decimals: 8,
      priceFeed: "0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount:  150 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 40 * 1000,
      maxGlobalShortSize: 15 * 1000
    },
    axlbtc: {
      name: "axlbtc",
      address: "0x448d59B4302aB5d2dadf9611bED9457491926c8e",
      decimals: 8,
      priceFeed: "0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount:  150 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 40 * 1000,
      maxGlobalShortSize: 10 * 1000
    },
    lzusdc: {
      name: "lzusdc",
      address: "0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf",
      decimals: 6,
      priceFeed: "0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 16000,
      minProfitBps: 0,
      maxUsdgAmount: 480 * 1000,
      bufferAmount: 100 * 1000,
      isStable: true,
      isShortable: false
    },
    axlusdc: {
      name: "axlusdc",
      address: "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
      decimals: 6,
      priceFeed: "0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 16000,
      minProfitBps: 0,
      maxUsdgAmount: 480 * 1000,
      bufferAmount: 100 * 1000,
      isStable: true,
      isShortable: false
    },
    usdc: {
      name: "usdc",
      address: "0x2F733095B80A04b38b0D10cC884524a3d09b836a",
      decimals: 6,
      priceFeed: "0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 16000,
      minProfitBps: 0,
      maxUsdgAmount: 1000 * 1000,
      bufferAmount: 200 * 1000,
      isStable: true,
      isShortable: false
    },
    lzusdt: {
      name: "lzusdt",
      address: "0xcc1b99dDAc1a33c201a742A1851662E87BC7f22C",
      decimals: 6,
      priceFeed: "0xF64b636c5dFe1d3555A847341cDC449f612307d0",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 0,
      minProfitBps: 0,
      maxUsdgAmount: 19 * 1000,
      bufferAmount: 0 * 1000,
      isStable: true,
      isShortable: false
    },
    axlusdt: {
      name: "axlusdt",
      address: "0xd226392C23fb3476274ED6759D4a478db3197d82",
      decimals: 6,
      priceFeed: "0xF64b636c5dFe1d3555A847341cDC449f612307d0",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 0,
      minProfitBps: 0,
      maxUsdgAmount: 50,
      bufferAmount: 0 * 1000,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "wftm",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18
    }
  },
  bsc: {
    bnb: {
      name: "bnb",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
      priceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 20 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1,
      spreadBasisPoints: 0
    },
    eth: {
      name: "eth",
      address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      decimals: 18,
      priceFeed: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 14000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1
    },
    btc: {
      name: "btc",
      address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      decimals: 18,
      priceFeed: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 14000,
      minProfitBps: 0,
      maxUsdgAmount: 9200,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1
    },
    xrp: {
      name: "xrp",
      address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
      decimals: 18,
      priceFeed: "0x93A67D414896A280bF8FFB3b389fE3686E014fda",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 55,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1
    },
    ada: {
      name: "ada",
      address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
      decimals: 18,
      priceFeed: "0xa767f745331D267c7751297D982b050c93985627",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 2650,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1
    },
    cake: {
      name: "cake",
      address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      decimals: 18,
      priceFeed: "0xB6064eD41d4f67e353768aA239cA86f4F73665a1",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 0,
      maxGlobalShortSize: 0
    },
    usdc: {
      name: "usdc",
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      decimals: 18,
      priceFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 15000,
      minProfitBps: 0,
      maxUsdgAmount: 1000,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    usdt: {
      name: "usdt",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
      priceFeed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 35000,
      minProfitBps: 0,
      maxUsdgAmount: 3500,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "wbnb",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18
    }
  },
  base: {
    eth: {
      name: "eth",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      priceFeed: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 38000,
      minProfitBps: 0,
      maxUsdgAmount: 3000 * 1000,
      bufferAmount: 150,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 500 * 1000,
      maxGlobalShortSize: 250 * 1000
    },
    cbeth: {
      name: "cbeth",
      address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      decimals: 18,
      priceFeed: "0xd7818272B9e248357d13057AAb0B417aF31E817d",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 0,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1
    },
    btc: {
      name: "btc",
      address: "0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad",
      decimals: 8,
      priceFeed: "0xCCADC697c55bbB68dc5bCdf8d3CBe83CdD4E071E",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 8000,
      minProfitBps: 0,
      maxUsdgAmount: 1000 * 1000,
      bufferAmount: 2,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 100 * 1000,
      maxGlobalShortSize: 75 * 1000
    },
    yfi: {
      name: "yfi",
      address: "0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239",
      decimals: 18,
      priceFeed: "0xD40e758b5eC80820B68DFC302fc5Ce1239083548",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 27 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 20 * 1000,
      maxGlobalShortSize: 10 * 1000
    },
    aero: {
      name: "aero",
      address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
      decimals: 18,
      priceFeed: "0x4EC5970fC728C5f65ba413992CD5fF6FD70fcfF0",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.10 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 4000,
      minProfitBps: 0,
      maxUsdgAmount: 100 * 1000,
      bufferAmount: 45 * 1000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 75 * 1000,
      maxGlobalShortSize: 50 * 1000
    },
    usdc: {
      name: "usdbc",
      address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      decimals: 6,
      priceFeed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 12000,
      minProfitBps: 0,
      maxUsdgAmount: 1000 * 1000,
      bufferAmount: 200 * 1000,
      isStable: true,
      isShortable: false
    },
    usdcCircle: {
      name: "usdc",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      priceFeed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 37000,
      minProfitBps: 0,
      maxUsdgAmount: 2000 * 1000,
      bufferAmount: 750 * 1000,
      isStable: true,
      isShortable: false
    },
    dai: {
      name: "dai",
      address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      decimals: 18,
      priceFeed: "0x591e79239a7d679378eC8c847e5038150364C78F",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 0,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false
    },
    nativeToken: {
      name: "weth",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18
    }
  }
}
