import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { CyberCard } from '../ui/CyberCard';
import { CyberButton } from '../ui/CyberButton';
import { useWalletStore } from '../../lib/stores/wallet';
import {
  isHandle,
  resolveHandle,
  HandleResolutionError,
} from '../../lib/cardano/handle-resolver';

interface WalletInputProps {
  onConnected?: () => void;
}

export function WalletInput({ onConnected }: WalletInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { setAddress, setStakeAddress } = useWalletStore();

  const validateAndSaveAddress = async () => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setError('Please enter a wallet address or $handle');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Check if input is an ADA Handle
      if (isHandle(trimmed)) {
        const resolution = await resolveHandle(trimmed);
        setAddress(resolution.address);
        setStakeAddress(resolution.stakeAddress);
        onConnected?.();
        return;
      }

      // Basic Cardano address validation
      const isValidFormat =
        (trimmed.startsWith('addr1') && trimmed.length >= 58) ||
        (trimmed.startsWith('stake1') && trimmed.length >= 54);

      if (!isValidFormat) {
        setError('Invalid Cardano address format');
        return;
      }

      // Determine if it's a stake address or regular address
      if (trimmed.startsWith('stake1')) {
        setStakeAddress(trimmed);
        setAddress(null);
      } else {
        setAddress(trimmed);
        setStakeAddress(null);
      }

      onConnected?.();
    } catch (err) {
      if (err instanceof HandleResolutionError) {
        setError(err.message);
      } else {
        setError('Failed to validate address');
      }
    } finally {
      // Cleanup: runs after try/catch completion, including early returns
      setIsValidating(false);
    }
  };

  return (
    <CyberCard glowColor="cyan">
      <Text style={styles.label}>WALLET ADDRESS</Text>
      <Text style={styles.hint}>
        Enter address (addr1...), stake address (stake1...), or $handle
      </Text>

      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={(text) => {
          setInputValue(text);
          setError(null);
        }}
        placeholder="addr1q... or $handle"
        placeholderTextColor={cyberpunk.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        numberOfLines={2}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.buttonContainer}>
        {isValidating ? (
          <ActivityIndicator color={cyberpunk.neonCyan} />
        ) : (
          <CyberButton
            title="CONNECT"
            onPress={validateAndSaveAddress}
            disabled={!inputValue.trim()}
          />
        )}
      </View>
    </CyberCard>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.neonCyan,
    letterSpacing: 2,
    marginBottom: 8,
  },
  hint: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    marginBottom: 16,
  },
  input: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
    backgroundColor: cyberpunk.bgTertiary,
    borderWidth: 1,
    borderColor: cyberpunk.bgElevated,
    borderRadius: 4,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.error,
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
});
