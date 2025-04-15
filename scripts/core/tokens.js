// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
const { expandDecimals } = require("../../test/shared/utilities");

module.exports = {
  fantom: {
    ftm: {
      name: "ftm",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18,
      priceFeed: "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 0,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1,
      spreadBasisPoints: 0,
    },
    lzeth: {
      name: "lzeth",
      address: "0x695921034f0387eAc4e11620EE91b1b15A6A09fE",
      decimals: 18,
      priceFeed: "0x11DdD3d147E5b83D01cee7070027092397d63658",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 7000,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1,
    },
    axleth: {
      name: "axleth",
      address: "0xfe7eDa5F2c56160d406869A8aA4B2F365d544C7B",
      decimals: 18,
      priceFeed: "0x11DdD3d147E5b83D01cee7070027092397d63658",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 10000,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1,
    },
    lzbtc: {
      name: "lzbtc",
      address: "0xf1648C50d2863f780c57849D812b4B7686031A3D",
      decimals: 8,
      priceFeed: "0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 4000,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1,
    },
    axlbtc: {
      name: "axlbtc",
      address: "0x448d59B4302aB5d2dadf9611bED9457491926c8e",
      decimals: 8,
      priceFeed: "0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 4000,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1,
      maxGlobalShortSize: 1,
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
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false,
    },
    axlusdc: {
      name: "axlusdc",
      address: "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
      decimals: 6,
      priceFeed: "0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 39000,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false,
    },
    usdc: {
      name: "usdc",
      address: "0x2F733095B80A04b38b0D10cC884524a3d09b836a",
      decimals: 6,
      priceFeed: "0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false,
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
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false,
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
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false,
    },
    nativeToken: {
      name: "wftm",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18,
    },
  },
  base: {
    eth: {
      name: "eth",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      priceFeed: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 30000,
      minProfitBps: 0,
      maxUsdgAmount: 1400 * 1000,
      bufferAmount: 200,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 400 * 1000,
      maxGlobalShortSize: 200 * 1000,
    },
    cbbtc: {
      name: "cbbtc",
      address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      decimals: 8,
      priceFeed: "0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 14000,
      minProfitBps: 0,
      maxUsdgAmount: 1000 * 1000,
      bufferAmount: 2,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 200 * 1000,
      maxGlobalShortSize: 100 * 1000,
    },
    aero: {
      name: "aero",
      address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
      decimals: 18,
      priceFeed: "0x4EC5970fC728C5f65ba413992CD5fF6FD70fcfF0",
      priceDecimals: 8,
      fastPricePrecision: 100000000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 140 * 1000,
      bufferAmount: 40 * 1000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 100 * 1000,
      maxGlobalShortSize: 50 * 1000,
    },
    well: {
      name: "well",
      address: "0xA88594D404727625A9437C3f886C7643872296AE",
      decimals: 18,
      priceFeed: "0xc15d9944dAefE2dB03e53bef8DDA25a56832C5fe",
      priceDecimals: 8,
      fastPricePrecision: 100000000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 69 * 1000,
      bufferAmount: 400 * 1000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 60 * 1000,
      maxGlobalShortSize: 30 * 1000,
    },
    usdc: {
      name: "usdbc",
      address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      decimals: 6,
      priceFeed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 4000,
      minProfitBps: 0,
      maxUsdgAmount: 2000 * 1000,
      bufferAmount: 25 * 1000,
      isStable: true,
      isShortable: false,
    },
    usdcCircle: {
      name: "usdc",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      priceFeed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 44000,
      minProfitBps: 0,
      maxUsdgAmount: 6000 * 1000,
      bufferAmount: 675 * 1000,
      isStable: true,
      isShortable: false,
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
      isShortable: false,
    },
    eurc: {
      name: "eurc",
      address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
      decimals: 6,
      priceFeed: "0xDAe398520e2B67cd3f27aeF9Cf14D93D927f8250",
      priceDecimals: 8,
      isStrictStable: false,
      tokenWeight: 0,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false,
    },
    nativeToken: {
      name: "weth",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
  },
  mode: {
    eth: {
      name: "eth",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      priceFeed: "0x73144b43560C34581A2Bb31f62bAAB21e656d77f",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 11000,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 5 * 1000,
      maxGlobalShortSize: 3 * 1000,
    },
    weeth: {
      name: "weeth",
      address: "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A",
      decimals: 18,
      priceFeed: "0x4ECcCA9634213bCE9A9725D1C65dFF17e38b2757",
      priceDecimals: 18,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 25000,
      minProfitBps: 0,
      maxUsdgAmount: 25 * 1000,
      bufferAmount: 1, 
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000,
      maxGlobalShortSize: 7 * 1000,
    },
    wbtc: {
      name: "wbtc",
      address: "0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF",
      decimals: 8,
      priceFeed: "0xF48C76Bf6EFA90CBcE23972192a46bD12530aDB6",
      priceDecimals: 18,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 6000,
      minProfitBps: 0,
      maxUsdgAmount: 9 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 5 * 1000,
      maxGlobalShortSize: 2 * 1000,
    },
    mode: {
      name: "mode",
      address: "0xDfc7C877a950e49D2610114102175A06C2e3167a",
      decimals: 18,
      priceFeed: "0xEF367CB26A6Dc7DF0e48aEd99d0E68250Ff7A9F4",
      priceDecimals: 18,
      fastPricePrecision: 100000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 10000,
      minProfitBps: 0,
      maxUsdgAmount: 8 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1 * 1000,
      maxGlobalShortSize: 500,
    },
    usdc: {
      name: "usdc",
      address: "0xd988097fb8612cc24eeC14542bC03424c656005f",
      decimals: 6,
      priceFeed: "0xF9440bd417c28C407C9c22785928Ec3DFE04Bb76",
      priceDecimals: 18,
      isStrictStable: true,
      tokenWeight: 48000,
      minProfitBps: 0,
      maxUsdgAmount: 1000 * 1000,
      bufferAmount: 33 * 1000,
      isStable: true,
      isShortable: false,
    },
    nativeToken: {
      name: "weth",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
  },
  sonic: {
    s: {
      name: "s",
      address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
      decimals: 18,
      priceFeed: "0xc76dFb89fF298145b417d221B2c747d84952e01d",
      priceDecimals: 8,
      fastPricePrecision: 100000000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 35000,
      minProfitBps: 0,
      maxUsdgAmount: 300 * 1000,
      bufferAmount: 20 * 1000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 15 * 1000,
      maxGlobalShortSize: 7 * 1000,
    },
    weth: {
      name: "weth",
      address: "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b",
      decimals: 18,
      priceFeed: "0x824364077993847f71293B24ccA8567c00c2de11",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 15000,
      minProfitBps: 0,
      maxUsdgAmount: 200 * 1000,
      bufferAmount: 2, 
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 7 * 1000,
      maxGlobalShortSize: 4 * 1000,
    },
    usdc: {
      name: "usdc",
      address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
      decimals: 6,
      priceFeed: "0x55bCa887199d5520B3Ce285D41e6dC10C08716C9",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 50000,
      minProfitBps: 0,
      maxUsdgAmount: 500 * 1000,
      bufferAmount: 25 * 1000,
      isStable: true,
      isShortable: false,
    },
    nativeToken: {
      name: "s",
      address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
      decimals: 18,
    },
  },
};
