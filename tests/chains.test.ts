import { CHAINS } from "../networks-and-chains";

const NON_UNIQUE_CHAINS_EXCEPTIONS = [
  "Aleph Zero EVM",
  "ALG L2",
  "Boba BNB",
  "Metal L2",
  "Nexi V2",
  "PHI V1",
  "TAO EVM",
  "Titan (TKX)",
  "XPLA Verse",
  "Trust EVM",
  "Lamina1 Identity",
  "Polygon zkEVM",
  "Bitcoin EVM",
  "Ethereum Beacon Chain"
];

const uniqueChains = CHAINS.map((chain) => chain.chain).filter(
  (c) => !NON_UNIQUE_CHAINS_EXCEPTIONS.includes(c)
);

describe("uniqueChains", () => {
  it("should have unique first words for all chains", () => {
    // Extract first words from each chain
    const firstWords = uniqueChains.map((chain) => chain.split(" ")[0]);

    // Find duplicates
    const wordCounts: Record<string, number> = {};
    const duplicates: string[] = [];

    firstWords.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (wordCounts[word] === 2) {
        duplicates.push(word);
      }
    });

    // Get examples of chains with duplicate first words
    const duplicateExamples = duplicates.map((word) => {
      const examples = uniqueChains
        .filter((chain) => chain.split(" ")[0] === word)
        .slice(0, 3);
      return { word, examples };
    });

    if (duplicates.length > 0) {
      const errorMessage = `Found ${duplicates.length} duplicate first words:\n${duplicateExamples
        .map(
          ({ word, examples }) =>
            `  "${word}" appears in: ${examples.map((ex) => `"${ex}"`).join(", ")}`
        )
        .join("\n")}`;

      throw new Error(errorMessage);
    }
  });

  it("should have valid chain names", () => {
    uniqueChains.forEach((chain) => {
      // Check that chain name is not empty
      expect(chain.trim()).not.toBe("");

      // Check that chain name is a string
      expect(typeof chain).toBe("string");

      // Check that chain name doesn't start with whitespace
      expect(chain).not.toMatch(/^\s/);

      // Check that chain name doesn't end with whitespace
      expect(chain).not.toMatch(/\s$/);
    });
  });

  it("should have at least one chain", () => {
    expect(uniqueChains.length).toBeGreaterThan(0);
  });
});
