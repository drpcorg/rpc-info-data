import { readFileSync, writeFileSync } from "fs";
import https from "https";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readJsonFile = (path: string) => {
  return JSON.parse(readFileSync(join(__dirname, path), "utf8"));
};

const OVERRIDE_NETWORKS: Network[] = readJsonFile("./override-networks.json");
const OVERRIDE_CHAIN_NAMES = readJsonFile("./override-chain-names.json");
const OVERRIDE_RPCS_BY_CHAIN_ID = readJsonFile("./override-rpc.json");

async function fetchAndSaveChains() {
  try {
    console.log("🐛 Fetching chains from API...");
    const response = await new Promise((resolve, reject) => {
      https.get("https://chainid.network/chains.json", (res: any) => {
        let data = "";

        res.on("data", (chunk: any) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });

        res.on("error", (err: any) => {
          reject(err);
        });
      });
    });

    return JSON.parse(response as string);
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

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

export type Chain = {
  chain: string;
  icon?: string;
  networks: Network[];
};

const getFinalRpcs = (network: Network) => {
  const chainId = network.chainId;
  const rpcs = network.rpc;
  if (chainId && chainId in OVERRIDE_RPCS_BY_CHAIN_ID) {
    const newRpcs = new Set([
      ...OVERRIDE_RPCS_BY_CHAIN_ID[
        chainId as unknown as keyof typeof OVERRIDE_RPCS_BY_CHAIN_ID
      ],
      ...rpcs,
    ]);
    return Array.from(newRpcs);
  }
  return network.rpc;
};

const OVERRIDE_NETWORK_NAMES = {
  Ropsten: "Ethereum Ropsten Testnet",
  Rinkeby: "Ethereum Rinkeby Testnet",
  Goerli: "Ethereum Goerli Testnet",
  Holesky: "Ethereum Holesky Testnet",
};

const getChainName = (chain: string, network: string) => {
  const chainName =
    OVERRIDE_CHAIN_NAMES[chain as keyof typeof OVERRIDE_CHAIN_NAMES] || chain;

  if (chainName === "Ethereum") {
    const override = getEthChainOverrideByNetwork(network);
    if (override) {
      return override;
    }
  } else if ((chainName as string) === "NEAR") {
    if (!network.startsWith("NEAR")) {
      // Assume that the correct chain name is the first word of the network name
      return network.split(" ")[0] || network;
    }
  } else if ((chainName as string) === "Polygon") {
    if (network.startsWith("Polygon zkEVM")) {
      return "Polygon zkEVM";
    }
  }

  return chainName;
};

function getEthChainOverrideByNetwork(network: string) {
  if (network.startsWith("Ethereum")) {
    return "Ethereum";
  }
  if (network.startsWith("OP ") || network.startsWith("Optimism ")) {
    return "Optimism";
  }
  if (network.startsWith("Cycle Network")) {
    return "Cycle Network";
  }
  if (network.startsWith("Molereum Network")) {
    return "Molereum Network";
  }
  if (network.startsWith("GRVT Exchange")) {
    return "GRVT Exchange";
  }
  if (network.startsWith("Proof of Play")) {
    return "Proof of Play";
  }
  if (network.startsWith("Zytron Linea")) {
    return "Zytron Linea";
  }
  if (network.startsWith("Elastos Smart Chain")) {
    return "Elastos Smart Chain";
  }

  if (network in OVERRIDE_ETH_CHAIN_NAMES_BY_NETWORK) {
    return OVERRIDE_ETH_CHAIN_NAMES_BY_NETWORK[
      network as keyof typeof OVERRIDE_ETH_CHAIN_NAMES_BY_NETWORK
    ];
  }

  return network.split(" ")[0] || network;
}

const OVERRIDE_ETH_CHAIN_NAMES_BY_NETWORK = {
  "AB Core Testnet": "AB Core",
  "Anytype EVM Chain": "Anytype EVM Chain",
  "Beverly Hills": "Beverly Hills",
};

const EXCLUDE_CHAINS_FROM_API = ["ARC"];

const processNetworks = async () => {
  const networksFromApi = await fetchAndSaveChains();
  if (!networksFromApi.length) {
    console.error("❌ No chains fetched from API");
    return [];
  }
  console.log("🦋 Chains fetched from API, starting processing...");

  const NETWORKS_FROM_API: Network[] = networksFromApi
    .filter((network: Network) => {
      if (
        !network.rpc?.length ||
        network.status === "deprecated" ||
        network.name.match(/deprecated/i) ||
        network.name.match(/discard/i) ||
        EXCLUDE_CHAINS_FROM_API.includes(network.chain)
      ) {
        return false;
      }
      return true;
    })
    .map((network: Network) => ({
      ...network,
      slug: network.name.toLowerCase().replace(/\s+/g, "-"),
      rpc: network.rpc.filter((rpc: string) => rpc.startsWith("https")),
    }));

  const CHAINS_FROM_API: Chain[] = Object.values(
    NETWORKS_FROM_API.reduce(
      (acc, network) => {
        const networkName =
          OVERRIDE_NETWORK_NAMES[
            network.name as keyof typeof OVERRIDE_NETWORK_NAMES
          ] || network.name;

        const chain = getChainName(network.chain, networkName);

        const existingChain = acc[chain] as Chain | undefined;
        const explorers = network.explorers?.filter((explorer) =>
          explorer.url.startsWith("https")
        );

        if (existingChain) {
          return {
            ...acc,
            [chain]: {
              ...existingChain,
              networks: [
                ...existingChain.networks,
                {
                  ...network,
                  chain,
                  name: networkName,
                  rpc: getFinalRpcs(network),
                  explorers,
                },
              ],
            },
          };
        }

        return {
          ...acc,
          [chain]: {
            chain,
            icon: network.icon,
            networks: [
              {
                ...network,
                name: networkName,
                chain,
                rpc: getFinalRpcs(network),
                explorers,
              },
            ],
          },
        };
      },
      {} as Record<string, Chain>
    )
  );

  const OVERRIDEN_CHAINS_BY_NAME = OVERRIDE_NETWORKS.reduce(
    (acc, overridenNetwork) => {
      const chain = overridenNetwork.chain;

      if (chain in acc) {
        acc[chain].networks.push({
          ...overridenNetwork,
        });
        return acc;
      }

      acc[chain] = {
        chain,
        networks: [overridenNetwork],
      };
      return acc;
    },
    {} as Record<string, Chain>
  );

  const OVERRIDEN_CHAINS = Object.values(OVERRIDEN_CHAINS_BY_NAME);

  return [...CHAINS_FROM_API, ...OVERRIDEN_CHAINS].sort((a, b) =>
    a.chain.localeCompare(b.chain)
  );
};

(async () => {
  const chains = await processNetworks();
  if (!chains.length) {
    return;
  }
  console.log(`🤟 Chains: ${chains.length}`);

  // write chains to file
  writeFileSync(
    join(__dirname, "./chains.generated.json"),
    JSON.stringify(chains, null, 2)
  );
})();
