# Copilot Code Review Instructions

## Project Context
This is a React Native Expo app for Cardano blockchain. Android only, tested on Pixel 9 Pro.

## Review Preferences

### Skip These Patterns
- **Small fixed-size lists**: Lists with ≤5 items using `View` + `map()` are intentional. Don't suggest FlatList/ScrollView.
- **Formatting functions with varied precision**: Different decimal places for different magnitude ranges (e.g., 1M vs 1k vs 100) is intentional UX design.
- **Unused union type members**: If a type has extra members for future use, check if there's a comment. Don't flag as dead code.

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
