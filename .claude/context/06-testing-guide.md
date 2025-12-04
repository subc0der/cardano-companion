# Testing Guide

## Test Device
- **Primary**: Google Pixel 9 Pro
- **Platform**: Android only
- **Connection**: USB debugging or Expo Go app

## Running the App

### Development Mode
```bash
cd C:\Users\mkhal\dev\cardano-companion
npx expo start
```
Then press `a` for Android or scan QR with Expo Go.

### Production Build Test
```bash
npx expo start --no-dev --minify
```

## Pre-Commit Checklist

### Code Quality
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No unused imports or variables
- [ ] All functions have proper types
- [ ] No console.log statements
- [ ] Comments explain complex logic

### UI/UX
- [ ] Colors match cyberpunk theme
- [ ] Text is readable on dark backgrounds
- [ ] Touch targets are at least 44x44 points
- [ ] Animations are smooth (60fps)
- [ ] Safe area insets respected

### Functionality
- [ ] All screens load without errors
- [ ] Navigation works correctly
- [ ] Data displays properly
- [ ] Error states handled gracefully
- [ ] Loading states shown

## Code Review Process

### Preparing for Review
- Keep PRs small and focused
- Include description of changes
- List any manual testing performed
- Note any areas of concern

### Responding to Feedback
1. Read all comments before making changes
2. Look for patterns - fix ALL similar issues
3. Search codebase: `grep -r "pattern" .`
4. Explain reasoning if disagreeing
5. Request re-review after fixes

### Review Tools
- **Gemini CLI**: For code review within context window
- **GitHub Copilot**: Inline suggestions
- Keep changes atomic for easier review

## Common Issues

### Metro Bundler
- Clear cache: `npx expo start --clear`
- Restart: Kill terminal and restart

### Android Connection
- Enable USB debugging in developer options
- Run `adb devices` to verify connection
- Check device is on same WiFi for Expo Go

### TypeScript Errors
- Run `npx tsc --noEmit` for full check
- Check tsconfig.json for strict settings
