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
- NO unused imports, variables, or dead code
- NO console.log in production code - use proper logging
- NO any type - always define proper TypeScript types
- NO inline styles for repeated patterns - use StyleSheet

### Error Handling
- Always handle async errors with try/catch
- Provide meaningful error messages to users
- Log errors with context for debugging
- Never swallow errors silently

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
