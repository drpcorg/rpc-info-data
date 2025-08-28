import { NETWORKS } from "../networks-and-chains";
import OVERRIDE_RPCS_BY_CHAIN_ID from "../override-rpc.json";

describe("OVERRIDE_RPCS_BY_CHAIN_ID", () => {
  it("should have a corresponding object in NETWORKS for each key in OVERRIDE_RPCS_BY_CHAIN_ID", () => {
    // Get all chainIds from NETWORKS
    const finalNetworksChainIds = new Set(
      NETWORKS.map((network) => network.chainId).filter(Boolean)
    );

    const overrideChainIds = Object.keys(OVERRIDE_RPCS_BY_CHAIN_ID);

    // Check that each key in OVERRIDE_RPCS_BY_CHAIN_ID has a corresponding chainId in NETWORKS
    const missingChainIds = overrideChainIds.filter(
      (chainId) => !finalNetworksChainIds.has(Number(chainId))
    );

    if (missingChainIds.length > 0) {
      console.error(
        "❌ Found chainId in OVERRIDE_RPCS_BY_CHAIN_ID, which is not in NETWORKS:"
      );
      missingChainIds.forEach((chainId) => {
        console.error(
          `  - ChainId ${chainId}: ${OVERRIDE_RPCS_BY_CHAIN_ID[chainId as keyof typeof OVERRIDE_RPCS_BY_CHAIN_ID].length} RPC`
        );
      });
    }

    expect(missingChainIds).toHaveLength(0);
  });
});
