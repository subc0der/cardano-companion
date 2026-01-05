# Wallet Connection Research (December 2025)

## Purpose
Research for enabling swap execution - requires transaction signing.

## Current State
App uses read-only mode - user pastes address, fetches public data via Blockfrost.
No keys involved, zero security risk.

## Options for Transaction Signing

### Option 1: CIP-45 (WebRTC P2P)
- **What:** Decentralized standard using WebRTC for dApp-wallet communication
- **Spec:** https://cips.cardano.org/cip/CIP-45
- **Reference impl:** https://github.com/fabianbormann/cip-0045-demo-implementation
- **Pros:** No central server, works across devices, truly decentralized
- **Cons:** Low adoption, complex implementation, still maturing
- **Status:** Reference implementation exists but not widely supported by wallets

### Option 2: Deep Links (VESPR Standard - Emerging)
- **What:** Universal deep link standard for wallet communication
- **Project:** https://projectcatalyst.io/funds/13/cardano-open-developers/vespr-any-payment-mobile-deep-link-and-sdk-or-streamlining-cross-application-requests
- **How it works:**
  1. App sends payment/signing request via URI
  2. User's wallet app opens, shows request, user approves
  3. Wallet returns result back to app
- **Pros:** Simple, native mobile UX
- **Cons:** Still in development (as of Dec 2025), wallet support TBD
- **Watch:** VESPR wallet will be first to support

### Option 3: WalletConnect
- **SDK:** https://github.com/WalletConnect/modal-react-native
- **Compat package:** @walletconnect/react-native-compat (must import before other WalletConnect deps)
- **Dashboard:** https://dashboard.reown.com (for project ID)
- **Pros:** Industry standard, good React Native support
- **Cons:** Most Cardano wallets don't support WalletConnect protocol yet

### Option 4: In-App Browser Workaround
- **What:** Build web version, users access via wallet's dApp browser
- **Library:** https://github.com/cardano-foundation/cardano-connect-with-wallet
- **Supported wallets:** Eternl, Yoroi, Nami, Lace (all have built-in dApp browsers)
- **Pros:** CIP-30 is well-supported, proven approach
- **Cons:** Not native mobile UX, requires maintaining web app

### Option 5: In-App Wallet (NOT RECOMMENDED)
- **What:** User imports seed phrase, app handles signing
- **Pros:** Full control
- **Cons:** HIGH SECURITY RISK - responsible for key storage, backup, liability
- **Verdict:** Avoid unless building a dedicated wallet app

## Relevant Libraries

| Library | Purpose | Notes |
|---------|---------|-------|
| @cardano-foundation/cardano-connect-with-wallet | CIP-30 web connector | Web/browser only |
| react-native-cardano (Emurgo) | Rust bindings for Cardano | Requires Rust toolchain |
| meshjs.dev | TypeScript SDK | Primarily web-focused |
| @walletconnect/react-native-compat | WalletConnect RN polyfills | Required for RN |

## Network Fees
- Swap transactions: ~0.17-0.5 ADA per transaction
- Paid by user, not app developer

## Recommendation
Wait for VESPR deep link standard to mature, or build web companion for swap feature that users access through wallet's dApp browser.

## Next Steps (When Ready)
1. Monitor VESPR deep link SDK release
2. Check if major wallets add WalletConnect support
3. Consider hybrid approach: native app for read-only, web for swaps
