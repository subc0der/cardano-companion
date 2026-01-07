# Cardano Companion - Claude Code Instructions

## Project Context
See `.claude/context/` for detailed documentation:
- `01-project-overview.md` - App description, tech stack
- `02-coding-standards.md` - Code quality rules
- `03-ui-theme.md` - Cyberpunk color palette
- `04-project-structure.md` - Directory layout
- `05-cardano-integration.md` - Blockchain API
- `06-testing-guide.md` - Testing on Pixel 9 Pro
- `07-state-management.md` - Zustand & React Query
- `08-component-patterns.md` - Component templates

## Critical Rules

### Git Workflow
- NEVER merge to main without explicit approval
- NEVER push without being asked
- Keep commits small and atomic for code review

### Git Safety
- NEVER run `git reset --hard` without explicit user approval
- Before any destructive git operation, always `git stash` uncommitted work first
- If unsure, commit to a WIP branch: `git checkout -b wip/backup && git add -A && git commit -m "WIP backup"`

### Code Quality
- NO magic numbers - use named constants
- NO hardcoded paths - use environment variables
- NO unused code - delete it completely
- NO `any` types - define proper TypeScript types
- NO console.log - remove before commit

### When Receiving Feedback
- Fix ALL instances of the same issue, not just the one called out
- Search codebase proactively: `grep -r "pattern" .`
- This reduces iteration time with reviewers

### Incremental Development
- Small PRs that fit in context windows
- Test on Pixel 9 Pro before marking complete
- One feature at a time

## Quick Commands
```bash
# Start dev server
npx expo start

# Type check
npx tsc --noEmit

# Clear cache
npx expo start --clear
```

## Platform
- Android ONLY (no iOS)
- Test device: Google Pixel 9 Pro
