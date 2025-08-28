import NotTypedChains from "./chains.generated.json";
import { Chain } from "./refresh-data";

const CHAINS = NotTypedChains as Chain[];
const NETWORKS = CHAINS.map((chain) => chain.networks).flat();

export { CHAINS, NETWORKS };
