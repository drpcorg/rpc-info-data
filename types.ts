export type Network = {
  name: string;
  chain: string;
  icon?: string;
  slug: string;
  rpc: string[];
  features?: {
    name: string;
  }[];
  faucets?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL?: string;
  shortName?: string;
  chainId: number | null;
  networkId: number | null;
  slip44?: number;
  ens?: {
    registry: string;
  };
  explorers?: {
    name?: string;
    url: string;
    standard?: string;
  }[];
  status?: string;
};
