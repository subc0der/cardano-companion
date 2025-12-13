import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { searchTokens, COMMON_TOKENS, DEFI_CONFIG, type Token } from '../../lib/defi';

interface TokenSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeTokenId?: string;
  title?: string;
}

export function TokenSelector({
  visible,
  onClose,
  onSelect,
  excludeTokenId,
  title = 'SELECT TOKEN',
}: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setTokens([]);
      setError(null);
    }
  }, [visible]);

  // Debounced search
  useEffect(() => {
    if (!visible) return;

    const timeoutId = setTimeout(async () => {
      // Uses constant from DEFI_CONFIG for consistent debounce behavior
      if (searchQuery.length < 2) {
        setTokens([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await searchTokens(searchQuery, { limit: 20 });
        setTokens(result.tokens.filter((t) => t.id !== excludeTokenId));
      } catch (err) {
        setError('Failed to search tokens');
        setTokens([]);
      } finally {
        setLoading(false);
      }
    }, DEFI_CONFIG.TOKEN_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, visible, excludeTokenId]);

  const handleSelectToken = useCallback(
    (token: Token) => {
      onSelect(token);
      // Don't call onClose here - parent controls visibility via onSelect handler
    },
    [onSelect]
  );

  const filteredCommonTokens = COMMON_TOKENS.filter((t) => t.id !== excludeTokenId);

  const renderToken = useCallback(
    ({ item }: { item: Token }) => (
      <Pressable
        style={styles.tokenItem}
        onPress={() => handleSelectToken(item)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${item.ticker}`}
      >
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenTicker}>{item.ticker}</Text>
          <Text style={styles.tokenName} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
      </Pressable>
    ),
    [handleSelectToken]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ticker..."
            placeholderTextColor={cyberpunk.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Token search"
            accessibilityHint="Search for tokens by name or ticker symbol"
          />
        </View>

        {/* Common Tokens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMMON TOKENS</Text>
          <View style={styles.commonTokens}>
            {filteredCommonTokens.map((token) => (
              <Pressable
                key={token.id}
                style={styles.commonTokenChip}
                onPress={() => handleSelectToken(token)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${token.ticker}`}
              >
                <Text style={styles.commonTokenText}>{token.ticker}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Search Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.length >= 2 ? 'SEARCH RESULTS' : 'TYPE TO SEARCH'}
          </Text>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={cyberpunk.neonCyan} />
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {!loading && !error && tokens.length > 0 && (
            <FlatList
              data={tokens}
              keyExtractor={(item) => item.id}
              renderItem={renderToken}
              style={styles.tokenList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {!loading && !error && searchQuery.length >= 2 && tokens.length === 0 && (
            <Text style={styles.noResultsText}>No tokens found</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: cyberpunk.bgTertiary,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xl,
    color: cyberpunk.neonCyan,
    letterSpacing: 3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: cyberpunk.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.textMuted,
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    padding: 14,
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.base,
    color: cyberpunk.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  commonTokens: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commonTokenChip: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  commonTokenText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.neonCyan,
    letterSpacing: 1,
  },
  tokenList: {
    flex: 1,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenTicker: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.textPrimary,
    letterSpacing: 1,
  },
  tokenName: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    color: cyberpunk.success,
    fontSize: typography.sizes.md,
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.error,
    textAlign: 'center',
    padding: 20,
  },
  noResultsText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
    textAlign: 'center',
    padding: 20,
  },
});
