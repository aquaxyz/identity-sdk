import { CheckNFT, fromNFTToIndex } from "./types";

export const checkNFTOwnership = async ({
  walletAddress,
  nftType,
}: CheckNFT) => {
  const nftList = await getNFTOwnership(walletAddress);

  return {
    valid: nftList.includes(nftType),
  };
};

export const retrieveNFTList = async ({
  walletAddress,
}: {
  walletAddress: string;
}) => {
  const nftList = await getNFTOwnership(walletAddress);
  return nftList;
};

export const verifyUserIdentity = async ({
  walletAddress,
}: {
  walletAddress: string;
}) => {
  const url = `https://api.aqua.xyz/imx/auth?${new URLSearchParams({
    method: "challenge",
    public_address: walletAddress,
  })}`;
  const response = await fetch(url);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.msg ?? json.message);
  }

  return { isAquaUser: !!json.sb_user_id };
};

export const awardNFT = async ({ walletAddress, nftType }: CheckNFT) => {
  const { status } = await fetch(
    `https://api-v2.aqua.xyz/aquaStudios/mint?${new URLSearchParams({
      wallet_address: walletAddress,
      nft_type: fromNFTToIndex[nftType].toString(),
    })}`
  );

  return { valid: status === 200 };
};

const getNFTOwnership = async (walletAddress: string): Promise<string[]> => {
  const tokenAddress = "0x87966e1e839065d6abf069e685f1cd3ba987ff51";
  const boostAssetClassKeys = {
    "aqua_boosts:TimeBonus": "slowdown",
    "aqua_boosts:Rewind": "redo",
    "aqua_boosts:Skip": "skip",
  };
  const url = `https://api-v2.aqua.xyz/wallet-summary?wallet_address=${walletAddress?.toLowerCase()}&token_address=${tokenAddress}`;

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg);
  }

  return data.walletSummary.map(
    ({ asset_class_key }: { asset_class_key: string }) =>
      boostAssetClassKeys[asset_class_key as keyof typeof boostAssetClassKeys]
  );
};
