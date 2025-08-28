import { NETWORKS } from "../networks-and-chains";

describe("networks", () => {
  test("should have slugs", () => {
    const missingSlugs = NETWORKS.filter((network) => !network.slug);
    expect(missingSlugs).toEqual([]);
  });
  test("should have names", () => {
    const missingNames = NETWORKS.filter((network) => !network.name);
    expect(missingNames).toEqual([]);
  });

  it("should have unique names", () => {
    const networkNames = NETWORKS.map((network) => network.name);
    const nameCounts = networkNames.reduce(
      (acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const duplicates = Object.entries(nameCounts)
      .filter(([_, count]) => count > 1)
      .map(([name, count]) => `${name} (${count} times)`);

    if (duplicates.length > 0) {
      console.log("Found duplicates:");
      console.log(duplicates.join("\n"));
    }

    const uniqueNames = new Set(networkNames);
    expect(uniqueNames.size).toBe(NETWORKS.length);
  });

  it("should have unique slugs", () => {
    const uniqueSlugs = new Set(NETWORKS.map((network) => network.slug));
    expect(uniqueSlugs.size).toBe(NETWORKS.length);
  });

  test("explorers should be https", () => {
    for (const network of NETWORKS) {
      const { explorers = [] } = network;
      for (const explorer of explorers) {
        expect(explorer.url).toMatch(/^https/);
      }
    }
  });
});
