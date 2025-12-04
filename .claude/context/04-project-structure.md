# Project Structure

## Directory Layout

```
cardano-companion/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigator group
│   │   ├── _layout.tsx      # Tab bar configuration
│   │   ├── portfolio.tsx    # Wallet/holdings view
│   │   ├── tools.tsx        # Utility tools
│   │   ├── flip.tsx         # Coin flip feature
│   │   └── settings.tsx     # App settings
│   ├── _layout.tsx          # Root layout (fonts, theme)
│   └── index.tsx            # Entry/splash screen
│
├── components/              # Reusable UI components
│   ├── ui/                  # Core design system
│   │   ├── CyberButton.tsx
│   │   ├── CyberCard.tsx
│   │   └── GlowText.tsx
│   ├── portfolio/           # Portfolio-specific components
│   ├── tools/               # Tools-specific components
│   ├── flip/                # Flip-specific components
│   └── shared/              # Cross-feature components
│
├── lib/                     # Business logic & utilities
│   ├── cardano/             # Blockchain integration
│   │   └── wallet-bridge.ts
│   ├── api/                 # External API clients
│   │   └── blockfrost.ts
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state stores
│   │   └── privacy.ts
│   └── theme/               # Design tokens
│       ├── colors.ts
│       └── typography.ts
│
├── assets/                  # Static assets
│   └── fonts/
│       └── SpaceMono-Regular.ttf
│
├── .claude/                 # Claude Code context
│   └── context/             # Project documentation
│
├── app.json                 # Expo configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── .env.example             # Environment template
└── .gitignore               # Git ignore rules
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CyberButton.tsx` |
| Screens | lowercase | `portfolio.tsx` |
| Hooks | camelCase, use prefix | `useWalletBalance.ts` |
| Stores | camelCase | `privacy.ts` |
| Utils | camelCase | `formatters.ts` |
| Types | PascalCase | `WalletTypes.ts` |

## Import Aliases (Future)
Consider adding path aliases in tsconfig.json:
- `@/components` → `./components`
- `@/lib` → `./lib`
- `@/assets` → `./assets`
