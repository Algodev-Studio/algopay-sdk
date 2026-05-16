import algosdk from "algosdk";

const USDC_MAIN = 31566704;
const USDC_TEST = 10458941;

export const USDC_ASA_ID: Record<string, number> = {
  mainnet: USDC_MAIN,
  testnet: USDC_TEST,
};

export const ALGO_DECIMALS = 6;
export const USDC_DECIMALS = 6;

export const PAYMENT_PROCESSOR_APP_ID = 758127303;
export const PAYMENT_PROCESSOR_ADDRESS =
  "VHNVP2CDHDN5LIFEGVDN5IDWSR6HJYOW7LLA36HVPK2KNQ7VKDWEPINCC4";
export const GAS_POOL_ADDRESS =
  "QV7EMAUKKOYSMM4EOWKM32B37EYDBJSNT73LLWKJTZ3F3ONB2SO2DZYC3I";

export function defaultUrls(network: string): { algod: string; indexer: string; usdc: number } {
  if (network === "mainnet") {
    return {
      algod: process.env.ALGOD_URL || "https://mainnet-api.algonode.cloud",
      indexer: process.env.INDEXER_URL || "https://mainnet-idx.algonode.cloud",
      usdc: Number(process.env.ALGOPAY_USDC_ASA_ID) || USDC_MAIN,
    };
  }
  return {
    algod: process.env.ALGOD_URL || "https://testnet-api.algonode.cloud",
    indexer: process.env.INDEXER_URL || "https://testnet-idx.algonode.cloud",
    usdc: Number(process.env.ALGOPAY_USDC_ASA_ID) || USDC_TEST,
  };
}

export function getAlgodClient(network: string): algosdk.Algodv2 {
  const { algod } = defaultUrls(network);
  const token = process.env.ALGOD_TOKEN ?? "";
  return new algosdk.Algodv2(token, algod, "");
}

export function getIndexerClient(network: string): algosdk.Indexer {
  const { indexer } = defaultUrls(network);
  const token = process.env.ALGOD_TOKEN ?? "";
  return new algosdk.Indexer(token, indexer, "");
}

export async function getUsdcBalance(address: string, network: string): Promise<string> {
  const { indexer, usdc } = defaultUrls(network);
  const token = process.env.ALGOD_TOKEN ?? "";
  const idx = new algosdk.Indexer(token, indexer, "");
  const res = await idx.lookupAccountAssets(address).do();
  const assets = res.assets ?? [];
  const row = assets.find((a: { assetId: number | bigint }) => Number(a.assetId) === usdc);
  const amt = row ? row.amount : 0n;
  return (Number(amt) / 1e6).toFixed(6);
}

export async function getAlgoBalance(address: string, network: string): Promise<string> {
  const algod = getAlgodClient(network);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const info: any = await algod.accountInformation(address).do();
  return (Number(info.amount) / 1e6).toFixed(6);
}

export async function submitUsdcTransfer(params: {
  mnemonic: string;
  network: string;
  to: string;
  amountMicro: bigint;
  feeLevelMult?: number;
}): Promise<{ txId: string }> {
  const { algod, usdc } = defaultUrls(params.network);
  const token = process.env.ALGOD_TOKEN ?? "";
  const client = new algosdk.Algodv2(token, algod, "");
  const acct = algosdk.mnemonicToSecretKey(params.mnemonic);
  const suggested = await client.getTransactionParams().do();
  const mult = params.feeLevelMult ?? 2;
  const fee = BigInt(Number(suggested.minFee) * mult);
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: acct.addr,
    receiver: params.to,
    amount: params.amountMicro,
    assetIndex: usdc,
    suggestedParams: { ...suggested, fee },
  });
  const signed = txn.signTxn(acct.sk);
  const submitted = await client.sendRawTransaction(signed).do();
  return { txId: submitted.txid };
}

export async function optInToUsdc(params: {
  mnemonic: string;
  network: string;
}): Promise<{ txId: string }> {
  const { algod, usdc } = defaultUrls(params.network);
  const token = process.env.ALGOD_TOKEN ?? "";
  const client = new algosdk.Algodv2(token, algod, "");
  const acct = algosdk.mnemonicToSecretKey(params.mnemonic);
  const suggested = await client.getTransactionParams().do();
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: acct.addr,
    receiver: acct.addr.toString(),
    amount: 0n,
    assetIndex: usdc,
    suggestedParams: suggested,
  });
  const signed = txn.signTxn(acct.sk);
  const submitted = await client.sendRawTransaction(signed).do();
  return { txId: submitted.txid };
}

export async function fundFromFaucet(address: string, network: string): Promise<boolean> {
  if (network !== "testnet") return false;
  try {
    const res = await fetch(
      `https://dispenser.testnet.aws.algodev.network/faucet?account=${address}`,
      { method: "POST" }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function buildUnsignedPaymentTxns(params: {
  senderAddress: string;
  merchantAddress: string;
  amountMicroUsdc: bigint;
  suggestedParams: algosdk.SuggestedParams;
  network: string;
}): algosdk.Transaction[] {
  const usdc = USDC_ASA_ID[params.network] ?? USDC_TEST;

  const usdcTransfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: params.senderAddress,
    receiver: params.merchantAddress,
    amount: params.amountMicroUsdc,
    assetIndex: usdc,
    suggestedParams: params.suggestedParams,
  });

  const gasTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: params.senderAddress,
    receiver: GAS_POOL_ADDRESS,
    amount: BigInt(2000),
    suggestedParams: params.suggestedParams,
  });

  algosdk.assignGroupID([gasTxn, usdcTransfer]);

  return [gasTxn, usdcTransfer];
}

export function getExplorerUrl(txId: string, network: string): string {
  const base = network === "mainnet" ? "https://allo.info/tx" : "https://testnet.explorer.perawallet.app/tx";
  return `${base}/${txId}`;
}
