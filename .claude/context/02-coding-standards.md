# Coding Standards

## Code Quality Rules

### Naming Conventions
- Use descriptive variable names (no single letters except loop counters)
- Components: PascalCase (e.g., `CyberButton`, `PortfolioCard`)
- Functions/hooks: camelCase (e.g., `useWalletBalance`, `formatAdaAmount`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`, `API_TIMEOUT_MS`)
- Files: kebab-case for utilities, PascalCase for components

### Code Clarity
- Write clear comments explaining "why", not "what"
- Never compact code for brevity at the expense of readability
- One component per file
- Keep functions under 50 lines when possible
- Extract complex logic into named helper functions

### Avoid Common Mistakes
- NO hardcoded file paths - use constants or environment variables
- NO magic numbers - define named constants with units in name (e.g., `CACHE_TTL_MS = 30000`)
- NO redundant code - DRY principle, extract shared logic
- NO unused imports, variables, or dead code - destructure only what you use from stores/hooks
- NO console.log in production code - use `console.warn()` or `console.error()` for diagnostics
- NO any type - always define proper TypeScript types
- NO inline styles for repeated patterns - use StyleSheet
- NO autoFocus on TextInput fields - can be disruptive for accessibility and screen readers
- AVOID store mutations from background tasks - prefer read-only access. Exceptions allowed for idempotent status updates with clear documentation (e.g., marking alerts as triggered)

### Error Handling
- Always handle async errors with try/catch
- Provide meaningful error messages to users
- Log errors with context for debugging using `console.warn()` or `console.error()`
- Never swallow errors silently - at minimum log with `console.warn('[ComponentName] Message:', error)`
- Use prefixed log messages: `[ModuleName]` for easier debugging (e.g., `[BackgroundAlert]`, `[Notifications]`)
- Acceptable silent catches: parsing fallbacks where the fallback is the intended behavior

### Defensive Programming
- Guard against division by zero before any division operation
- Use `isFinite()` checks before displaying calculated numbers (prevents "Infinity" or "NaN" in UI)
- For numeric validation: use `!isFinite(value) || value <= 0` to catch zero, negative, NaN, and Infinity
- Validate hex string lengths are even before hex-to-ASCII decoding
- Provide fallbacks when string decoding produces no usable result (e.g., no printable chars)
- Use `e.stopPropagation()` on nested Pressable/TouchableOpacity to prevent event bubbling
- Add clear comments when calculations are approximations (e.g., "not true 24h change")
- Comments about rate limiting should reference where the actual limiting occurs

### Null/Undefined Checking
- Use loose equality (`== null`) to catch both null and undefined in a single check
- Avoid `=== null` when undefined is also a possible value (e.g., optional chaining results)
- Example: `if (value == null)` catches both `null` and `undefined`
- When checking for truthy numeric values, also check `> 0` (e.g., `value != null && value > 0`)

### Input Validation
- Always use `isFinite(value)` before numeric comparisons (catches NaN, Infinity, -Infinity)
- Check `value > 0` for values that must be positive (prices, percentages, amounts)
- Full validation pattern: `isFinite(value) && value > 0 && value >= MIN && value <= MAX`
- Use constants for validation bounds (e.g., `MAX_PERCENT_THRESHOLD = 1000`)
- For crypto prices: allow range from 1e-12 to 1e12 to handle both micro and macro values
- For percentages: typically 0.01% to 1000% is reasonable
- Show specific error messages: "Price must be positive" rather than generic "Invalid value"

### User Feedback
- Always inform users when permissions are denied (use `Alert.alert()` for critical feedback)
- Don't silently fail operations that require user action to fix
- Provide clear guidance on how to resolve permission issues

### ID Generation
- Prefer `crypto.randomUUID()` for unique identifiers (guaranteed uniqueness)
- In React Native: crypto.randomUUID() may not be available - implement fallback
- Fallback pattern: `${Date.now().toString(36)}_${counter}_${Math.random().toString(36).substring(2)}`
- Always check `typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'` before using
- Avoid plain `Math.random()` alone for IDs - not cryptographically secure and can collide

### Modal Accessibility
- Add `accessibilityRole="button"` and `accessibilityLabel` to dismissible overlay Pressables
- Example: `<Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close dialog" />`
- Add `accessibilityViewIsModal` to Modal components for proper screen reader announcements
- Buttons that perform actions should have descriptive accessibilityLabel (e.g., "Remove alert", "Add to watchlist")

### TextInput Accessibility
- Add `accessibilityLabel` to describe what the input is for (e.g., "Target rate for price alert")
- Add `accessibilityHint` to provide usage guidance (e.g., "Enter the exchange rate that will trigger this alert")
- Screen reader users rely on these properties to understand input purpose

### Background Task Best Practices
- Document that background task intervals are minimum/approximate, not guaranteed
- Mention that OS may delay or skip tasks based on battery state, power mode, etc.
- Keep background task comments accurate about what actually happens vs. what is intended
- Use `Promise.allSettled()` for parallel API fetching (background tasks have time limits)
- Avoid sequential loops with await for multiple API calls
- Handle partial failures gracefully (some requests may succeed while others fail)

### Native Build Workflow
- This project requires native builds (not Expo Go) for background task features
- Run `npx expo prebuild` before first build
- Use `npm run android` (not `expo start`) for development
- Ensure Android SDK and build tools are properly configured

### TypeScript
- Strict mode enabled
- Define interfaces for all props and state
- Use type inference where obvious
- Export types that are used across files

## Development Process

### Incremental Development
- Make small, focused commits
- Each PR should be reviewable in a single context window
- Test each feature before moving to the next
- Keep changes atomic and reversible

### Git Workflow
- NEVER merge to main without explicit instruction
- Use descriptive commit messages
- Keep commits focused on single changes

### Code Review Response
- When feedback identifies an issue, proactively fix ALL instances
- Search codebase for similar patterns before marking resolved
- Document fixes for future reference

## Intentional Design Decisions

These patterns are intentional and should NOT be changed despite automated review feedback:

### Price Alert Comparison Operators
- Price target alerts use `>=` and `<=` operators (not `>` and `<`)
- UX semantics: "Alert when above $1" means "at or above $1"
- This inclusive behavior is more intuitive for price alerts
- DO NOT change to strict comparison operators

### Background Task Store Mutations
- Alert store mutations in background tasks are ALLOWED for:
  - `updateAlertStatus()` - marking alerts as triggered
  - `markNotificationSent()` - tracking notification delivery
- These operations are safe because:
  1. Zustand handles concurrent updates atomically
  2. Operations are idempotent (triggering twice = same result)
  3. Worst case: user removes alert while triggering = no-op
- DO NOT remove these mutations or make background tasks read-only

### Silent Catches for Fallback Patterns
- Empty catch blocks are acceptable when the fallback IS the intended behavior:
  - Hex decoding with fallback to truncated display
  - crypto.randomUUID() with fallback to timestamp-based ID
  - JSON parsing with fallback to default error message
  - API call failure in batch operations (tracked via null return)
- These do NOT need console.warn/console.error as the fallback handles it
- DO NOT add logging to these fallback patterns

### KeyboardAvoidingView on Android
- Using `behavior="height"` on Android is intentional
- Tested and working on target device (Pixel 9 Pro)
- `behavior="padding"` causes issues with this UI layout
- DO NOT change to padding or remove for Android

### Parallel API Fetching for Fiat Prices
- `getAdaPrice()` uses `Promise.all()` to fetch USD/EUR/GBP prices in parallel
- This is intentional despite rate limiting concerns because:
  1. The external API (CoinGecko via TapTools) handles its own rate limiting
  2. Three concurrent requests is not excessive
  3. Sequential fetching would triple the latency (poor UX)
  4. Results are cached for 60 seconds, so bursts are infrequent
- DO NOT change to sequential fetching

### Internationalization (i18n) - Number Formatting
- All `toLocaleString()` calls use `undefined` for locale parameter
- This allows device locale to format numbers appropriately (e.g., "1.234,56" in Germany)
- DO NOT hardcode `'en-US'` or any specific locale
- Pattern: `value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })`

### Press-and-Hold Patterns
- Use `useRef` for timer IDs (setTimeout/setInterval) - not state, to avoid re-renders
- Always implement `useEffect` cleanup to clear timers on unmount (memory leak prevention)
- Add secondary `useEffect` to stop intervals when action limits are reached
- Pattern for bet controls: clear interval when `canIncrement` or `canDecrement` becomes false
- Example cleanup:
  ```tsx
  useEffect(() => {
    if (holdIntervalRef.current && (!canIncrement || !canDecrement)) {
      clearHoldTimers();
    }
  }, [canIncrement, canDecrement, clearHoldTimers]);
  ```

### Cyberpunk Color Theme - Semantic Usage
- `neonCyan` (#00FFFF): Primary data, active states, interactive elements, CTA components
- `electricBlue` (#0080FF): Labels, hints, secondary/supporting info
- `textMuted` and `textSecondary`: Legacy grey colors - replace with above when updating UI
- Visual hierarchy exceptions are intentional:
  - DeFi launcher card uses all `neonCyan` (title, icon, description) - it's a CTA element
  - Watchlist fiat rate uses `electricBlue` - it's secondary to the main crypto rate
- DO NOT "fix" these to match mechanical color mappings
