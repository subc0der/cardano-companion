# CSV Export Feature

## Overview
Export Cardano transaction history to CSV for record-keeping, tax preparation, or portfolio analysis. File generated locally and shared via Android's native share sheet.

## Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| F1 | Export all transactions for connected wallet | Must | Pending |
| F2 | Include transaction type (send/receive/stake reward) | Must | Pending |
| F3 | Include timestamp, amount, asset, tx hash, fees | Must | Pending |
| F4 | Filter by date range | Should | Pending |
| F5 | Filter by asset type (ADA only, tokens, NFTs) | Should | Pending |
| F6 | Export staking rewards separately | Should | Deferred |
| F7 | Calculate cost basis for tax purposes | Could | Deferred (Premium) |
| F8 | Support multiple wallet addresses | Could | Deferred |

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NF1 | Process 1000+ transactions without UI freeze |
| NF2 | Show progress indicator during export |
| NF3 | Handle API rate limits gracefully |
| NF4 | Work offline for cached transaction data |
| NF5 | File size reasonable (<5MB for typical user) |

## CSV Schema

**Columns:**
| Column | Description | Format |
|--------|-------------|--------|
| Date | Transaction timestamp | ISO 8601 |
| Type | Classification | send/receive/stake_reward |
| Asset | Asset identifier | ADA or ticker |
| Amount | Net change | Decimal (see Type for direction) |
| Fee | Transaction fee | Decimal or empty |
| Transaction Hash | On-chain tx ID | 64 char hex |
| Block | Block height | Integer |
| Notes | Additional context | Free text |

**Example:**
```csv
Date,Type,Asset,Amount,Fee,Transaction Hash,Block,Notes
2024-01-15T10:30:00Z,receive,ADA,150.000000,,abc123...def,9876543,
2024-01-14T08:15:00Z,send,ADA,-50.000000,0.180000,def456...ghi,9876000,
```

## Blockfrost API Endpoints Needed

1. `GET /addresses/{address}/transactions` - Get tx hashes (paginated, 100/page)
2. `GET /txs/{hash}` - Get transaction details
3. `GET /txs/{hash}/utxos` - Get input/output breakdown
4. `GET /accounts/{stake_address}/rewards` - Get staking rewards

## Transaction Types

- `send` - Outgoing ADA/tokens
- `receive` - Incoming ADA/tokens
- `stake_reward` - Staking rewards (per epoch)
- `stake_delegate` - Delegation transaction
- `mint` - NFT/token mint
- `burn` - NFT/token burn
- `unknown` - Unclassified

## UI Location

Export tool card on Tools screen, accessible via the Tools tab navigation.

## Dependencies

- `expo-file-system` - Write CSV to device
- `expo-sharing` - Share via Android share sheet
