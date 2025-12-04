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
