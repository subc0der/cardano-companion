# Copilot Code Review Instructions

## Project Context
This is a React Native Expo app for Cardano blockchain. Android only, tested on Pixel 9 Pro.

## Review Preferences

### Skip These Patterns
- **Small fixed-size lists**: Lists with ≤5 items using `View` + `map()` are intentional. Don't suggest FlatList/ScrollView.
- **Formatting functions with varied precision**: Different decimal places for different magnitude ranges (e.g., 1M vs 1k vs 100) is intentional UX design.
- **Unused union type members**: If a type has extra members for future use, check if there's a comment. Don't flag as dead code.
- **Accessibility enhancements on already-accessible components**: If a component has `accessibilityLabel` and `accessible={true}`, don't repeatedly suggest adding more props like `accessibilityRole`.

### Focus On
- Security vulnerabilities (injection, XSS, etc.)
- Accessibility missing entirely (not just enhancements)
- Actual bugs (logic errors, race conditions, null safety)
- TypeScript type safety issues
- BigInt precision loss in financial calculations

### Don't Flag
- Minor comment wording preferences
- Style/formatting (we use ESLint/Prettier)
- "Consider using X instead of Y" when Y works correctly
- Suggesting abstractions for small, one-off implementations
- Issues already fixed in previous commits (check the full diff, not just individual files)

## Intentional Design Decisions (Do NOT Flag These)

### Price Alert Comparison Operators
- Using `>=` and `<=` for price target alerts is **intentional UX design**
- "Alert when above $1" semantically means "at or above $1" for users
- Do NOT suggest changing to strict `>` or `<` operators

### Background Task Store Mutations
- `updateAlertStatus()` and `markNotificationSent()` calls in `backgroundAlertTask.ts` are **safe and intentional**
- Zustand handles concurrent updates atomically
- These operations are idempotent (triggering twice has same result)
- Do NOT suggest removing these mutations or making background tasks read-only

### Silent Catch Blocks for Fallbacks
- Empty `catch {}` blocks in these patterns are **intentional fallback handling**:
  - Hex decoding with fallback to truncated display
  - `crypto.randomUUID()` with fallback to timestamp-based ID
  - JSON parsing with fallback to default error message
  - Batch API operations tracking failure via null return
- Do NOT suggest adding console.warn/console.error to these - the fallback IS the handling

### KeyboardAvoidingView on Android
- Using `behavior="height"` on Android is **tested and working** on target device (Pixel 9 Pro)
- Do NOT suggest changing to `behavior="padding"` or removing for Android

### TextInput Without autoFocus
- We intentionally do NOT use `autoFocus` on TextInput fields (accessibility concern)
- This is already documented in coding standards

## Domain-Specific Context

### Cardano/ADA Calculations
- 1 ADA = 1,000,000 lovelace
- Typical stake pool ROA is 3-5% annually
- ROA calculation uses BigInt with PRECISION=10000n for 2 decimal places - this is correct
- A pool with 100M ADA stake earning ~68,493 ADA per epoch yields ~5% annual ROA
