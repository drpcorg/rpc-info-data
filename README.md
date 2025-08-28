This directory contains tools and data for managing blockchain network information and RPC endpoints for https://rpc.info. 

## Prerequisites

- **Node.js**: Version 22.18.0 or higher
- **pnpm**: Package manager 

## Overview

The external data system consists of several key components:

- **Data Sources**: Primary data comes from [chainid.network](https://chainid.network/chains.json)
- **Override Files**: Custom configurations for networks and RPCs not in the primary source
- **Generated Output**: Consolidated data in `chains.generated.json`

## File Structure

```
rpc.info.data/
├── refresh-data.ts          # Main data aggregation script
├── chains.generated.json    # Generated consolidated data
├── override-networks.json   # Custom networks
├── override-rpc.json        # Custom RPC endpoints by chain ID
├── override-chain-names.json # Custom chain name mappings
├── types.ts                 # TypeScript type definitions
└── tests/                   # Test files
```

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Refresh data**:
   ```bash
   pnpm run refresh-data
   # or
   node refresh-data.ts
   ```

3. **Run tests**:
   ```bash
   pnpm test
   # or
   pnpm test:watch
   ```

## Adding New Networks

If the network exists in [chainid.network/chains.json](https://chainid.network/chains.json):

1. Simply run the refresh script:
   ```bash
   node refresh-data.ts
   ```

2. Commit the updated `chains.generated.json` file

If the network is not in [chainid.network/chains.json](https://chainid.network/chains.json):

1. Add the network configuration to `override-networks.json`:
   ```json
   {
     "chain": "blockchain-name",
     "slug": "network-slug",
     "name": "Network Display Name",
     "chainId": 1234567890,
     "networkId": null,
     "nativeCurrency": {
       "name": "TOKEN",
       "symbol": "TOKEN",
       "decimals": 18
     },
     "rpc": ["https://rpc-endpoint.com"]
   }
   ```
   The `networkId` field is not currently used but is required for compatibility with [chainid.network/chains.json](https://chainid.network/chains.json). You can safely set it to null.

2. Run the refresh script:
   ```bash
   node refresh-data.ts
   ```

3. Commit the updated `chains.generated.json` file

## Adding RPC Endpoints

### For Networks with Chain IDs

#### RPCs in Primary Source
If the RPC endpoint exists in [chainid.network/chains.json](https://chainid.network/chains.json):

1. Run the refresh script:
   ```bash
   node refresh-data.ts
   ```

2. Commit the updated `chains.generated.json` file

#### Custom RPCs
If the RPC endpoint is not in the primary source:

1. Add the RPC to `override-rpc.json` using the chain ID as the key:
   ```json
   {
     "1": [
       "https://new-ethereum-rpc.com",
       "https://another-ethereum-rpc.com"
     ]
   }
   ```

2. Run the refresh script:
   ```bash
   node refresh-data.ts
   ```

3. Commit the updated `chains.generated.json` file

### For Networks without Chain IDs

1. Add the RPC endpoints directly to the network configuration in `override-networks.json`:

```json
{
  "chain": "blockchain-name",
  "rpc": [
    "https://my-rpc.com"
  ]
}
```

2. Run the refresh script:
   ```bash
   node refresh-data.ts
   ```

3. Commit the updated `chains.generated.json` file

## Development

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch
```

### Data Validation
The system includes comprehensive tests to ensure data integrity and proper formatting. Always run tests after making changes to override files.

## Contributing

1. **Check existing data**: Always verify if the network/RPC already exists in the primary source
2. **Use override files**: Only add custom data when necessary
3. **Test changes**: Run the test suite before committing

## Troubleshooting

### Common Issues

- **Node.js version**: Ensure you're using Node.js 22.18.0+
- **Network connectivity**: The script requires internet access to fetch from chainid.network
- **JSON formatting**: Ensure all JSON files are properly formatted
- **Duplicate entries**: Check for existing entries before adding new ones
