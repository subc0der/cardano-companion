# Component Patterns

## Component Structure Template

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';

// Define props interface
interface MyComponentProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

// Export named function component
export function MyComponent({
  title,
  onPress,
  variant = 'primary'
}: MyComponentProps) {
  // Hooks at the top

  // Event handlers
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  // Render
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

// Styles at the bottom
const styles = StyleSheet.create({
  container: {
    backgroundColor: cyberpunk.bgSecondary,
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.textPrimary,
  },
});
```

## UI Component Examples

### CyberButton Usage
```typescript
import { CyberButton } from '@/components/ui/CyberButton';

// Primary (gradient background)
<CyberButton
  title="CONNECT WALLET"
  onPress={handleConnect}
  variant="primary"
/>

// Secondary (outline)
<CyberButton
  title="CANCEL"
  onPress={handleCancel}
  variant="secondary"
/>

// Ghost (text only)
<CyberButton
  title="Skip"
  onPress={handleSkip}
  variant="ghost"
/>
```

### CyberCard Usage
```typescript
import { CyberCard } from '@/components/ui/CyberCard';

// With cyan glow accent
<CyberCard glowColor="cyan">
  <Text>Card content here</Text>
</CyberCard>

// With magenta glow
<CyberCard glowColor="magenta">
  <Text>Highlighted content</Text>
</CyberCard>

// No glow (subtle)
<CyberCard glowColor="none">
  <Text>Standard card</Text>
</CyberCard>
```

### GlowText Usage
```typescript
import { GlowText } from '@/components/ui/GlowText';

// Cyan heading
<GlowText color="cyan" size="2xl">
  PORTFOLIO
</GlowText>

// Magenta accent
<GlowText color="magenta" size="lg">
  Total Balance
</GlowText>

// Yellow warning
<GlowText color="yellow" size="base">
  Pending Transaction
</GlowText>
```

## Screen Layout Pattern

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet } from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';

export default function MyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Screen content */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
  },
  content: {
    padding: 20,
  },
});
```

## Props Best Practices
- Use TypeScript interfaces for all props
- Provide default values for optional props
- Destructure props in function signature
- Document complex props with comments

## Modal/Selector Pattern

When building modals or selectors that the user picks from, follow this pattern:

### Single Source of Truth for Visibility
The **parent** controls visibility via a prop. The child never closes itself directly.

```typescript
// GOOD: Parent controls visibility via state
// Parent component
const [showSelector, setShowSelector] = useState(false);

<TokenSelector
  visible={showSelector}
  onSelect={(token) => {
    // Handle selection
    doSomethingWith(token);
    // Parent decides when to close
    setShowSelector(false);
  }}
  onClose={() => setShowSelector(false)}
/>

// TokenSelector.tsx - Child only calls onSelect
const handleSelectToken = (token: Token) => {
  onSelect(token);  // Just notify parent, don't call onClose
};
```

### Don't Fire Both `onSelect` AND `onClose`

```typescript
// BAD: Firing both callbacks causes race conditions
const handleSelectToken = (token: Token) => {
  onSelect(token);
  onClose();  // DON'T DO THIS - parent already handles closing in onSelect
};

// GOOD: Only fire onSelect, let parent manage state
const handleSelectToken = (token: Token) => {
  onSelect(token);
};
```

### Why This Matters
If `onSelect` changes parent state that affects visibility, AND `onClose` also
changes parent state, they race against each other. This leads to:
- Needing refs to track "in-progress" states (code smell)
- Subtle bugs where state gets reset unexpectedly
- Confusing event flow that's hard to debug

### The Rule
**One action = one callback.** If selecting something closes the modal, that's
the parent's decision to make in response to `onSelect`. The child just reports
what happened.

## Nested Pressable Event Handling

When nesting Pressable or TouchableOpacity elements (e.g., a delete button inside a row), use `e.stopPropagation()` to prevent the outer handler from firing:

```typescript
// Row component with nested remove button
<Pressable onPress={() => onSelectRow(item)}>
  <View style={styles.rowContent}>
    <Text>{item.name}</Text>
  </View>

  {/* Nested button - MUST stop propagation */}
  <Pressable
    onPress={(e) => {
      e.stopPropagation();  // Prevents row's onPress from firing
      onRemove(item.id);
    }}
    hitSlop={8}
  >
    <Ionicons name="trash-outline" size={18} />
  </Pressable>
</Pressable>
```

### Why This Matters
Without `e.stopPropagation()`, clicking the remove button triggers BOTH:
1. The remove action (intended)
2. The row selection (unintended)

This causes confusing UX where removing an item also selects it.

## Displaying Calculated Numbers

Always guard against invalid numeric values before displaying:

```typescript
// BAD: Can display "Infinity%", "-Infinity%", or "NaN%"
const formatChange = (change: number | null): string => {
  if (change === null) return 'N/A';
  return `${change.toFixed(2)}%`;
};

// GOOD: Guards against non-finite values
const formatChange = (change: number | null): string => {
  if (change === null || !isFinite(change)) return 'N/A';
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change.toFixed(2)}%`;
};
```

Apply `isFinite()` checks to:
- Format functions that display percentages/numbers (including `toLocaleString` calls)
- Color getters based on numeric values
- Icon selectors based on numeric comparisons
- Rate/price formatters that depend on division results
