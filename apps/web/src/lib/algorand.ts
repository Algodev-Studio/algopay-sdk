import algosdk from "algosdk";

const USDC_MAIN = 31566704;
const USDC_TEST = 10458941;

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

export async function getUsdcBalance(address: string, network: string): Promise<string> {
  const { indexer, usdc } = defaultUrls(network);
  const token = process.env.ALGOD_TOKEN ?? "";
  const idx = new algosdk.Indexer(token, indexer, "");
  const res = await idx.lookupAccountAssets(address).do();
  const assets = res.assets ?? [];
  const row = assets.find((a) => Number(a.assetId) === usdc);
  const amt = row ? row.amount : 0n;
  return (Number(amt) / 1e6).toFixed(6);
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
