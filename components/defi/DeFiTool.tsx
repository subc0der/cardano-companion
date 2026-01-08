import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { CyberButton } from '../ui/CyberButton';
import { TokenSelector } from './TokenSelector';
import { SwapQuoteCard } from './SwapQuoteCard';
import { DEXComparisonTable } from './DEXComparisonTable';
import { TokenWatchlist } from './TokenWatchlist';
import {
  type Token,
  type SwapQuote,
  type DEXComparison,
  ADA_TOKEN,
  COMMON_TOKENS,
  PRIMARY_DEXES,
  DEFI_CONFIG,
  getSwapEstimate,
  compareAllDexes,
  parseTokenAmount,
  formatTokenAmount,
} from '../../lib/defi';

type DeFiTab = 'swap' | 'watchlist';

/** Regex pattern for valid numeric input (positive numbers with optional decimals) */
const VALID_AMOUNT_PATTERN = /^\d+(\.\d+)?$/;

/**
 * Validates if the input amount string represents a positive value.
 * Uses BigInt for precision-safe validation.
 */
function isValidPositiveAmount(amount: string, decimals: number): boolean {
  // First check if it matches valid numeric format
  if (!VALID_AMOUNT_PATTERN.test(amount)) {
    return false;
  }

  try {
    const rawAmount = parseTokenAmount(amount, decimals);
    return BigInt(rawAmount) > BigInt(0);
  } catch (error) {
    // Invalid amount string that can't be parsed
    console.error('[DeFi] Invalid amount format:', error);
    return false;
  }
}

export function DeFiTool() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<DeFiTab>('swap');

  // Token selection
  const [tokenIn, setTokenIn] = useState<Token>(ADA_TOKEN);
  const [tokenOut, setTokenOut] = useState<Token>(COMMON_TOKENS[1]); // MIN
  const [selectingToken, setSelectingToken] = useState<'in' | 'out' | null>(null);

  // Amount input
  const [amountIn, setAmountIn] = useState('100');

  // Quote state
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Comparison state
  const [comparisons, setComparisons] = useState<DEXComparison[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch quote when inputs change
  useEffect(() => {
    if (!modalVisible) return;

    if (!isValidPositiveAmount(amountIn, tokenIn.decimals)) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    const rawAmount = parseTokenAmount(amountIn, tokenIn.decimals);

    const fetchQuote = async () => {
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const result = await getSwapEstimate({
          tokenIn: tokenIn.id,
          tokenOut: tokenOut.id,
          amountIn: rawAmount,
        });
        setQuote(result);
      } catch (err) {
        setQuoteError(err instanceof Error ? err.message : 'Failed to fetch quote');
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    // Debounce the request
    const timeoutId = setTimeout(fetchQuote, DEFI_CONFIG.TOKEN_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [modalVisible, tokenIn, tokenOut, amountIn]);

  // Fetch comparison when requested
  const fetchComparison = useCallback(async () => {
    if (!isValidPositiveAmount(amountIn, tokenIn.decimals)) return;

    const rawAmount = parseTokenAmount(amountIn, tokenIn.decimals);

    setComparisonLoading(true);
    setComparisonError(null);
    setShowComparison(true);

    try {
      const results = await compareAllDexes(
        tokenIn.id,
        tokenOut.id,
        rawAmount,
        PRIMARY_DEXES
      );

      const comparisonList: DEXComparison[] = [];
      for (const [protocol, dexQuote] of results) {
        if (dexQuote) {
          comparisonList.push({
            protocol,
            amountOut: dexQuote.amountOut,
            fee: dexQuote.totalFee,
            priceImpact: dexQuote.priceImpact,
            available: true,
          });
        } else {
          comparisonList.push({
            protocol,
            amountOut: '0',
            fee: '0',
            priceImpact: 0,
            available: false,
            reason: 'No liquidity',
          });
        }
      }

      setComparisons(comparisonList);
    } catch (err) {
      setComparisonError(err instanceof Error ? err.message : 'Failed to compare DEXes');
    } finally {
      setComparisonLoading(false);
    }
  }, [tokenIn, tokenOut, amountIn]);

  const handleOpenModal = () => {
    setModalVisible(true);
    setShowComparison(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSwapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setShowComparison(false);
  };

  const handleSelectToken = (token: Token) => {
    if (selectingToken === 'in') {
      // Don't allow same token for both
      if (token.id === tokenOut.id) {
        setTokenOut(tokenIn);
      }
      setTokenIn(token);
    } else if (selectingToken === 'out') {
      if (token.id === tokenIn.id) {
        setTokenIn(tokenOut);
      }
      setTokenOut(token);
    }
    setSelectingToken(null);
    setShowComparison(false);
  };

  // Handle watchlist pair selection - switch to swap tab with selected pair
  const handleWatchlistPairSelect = useCallback((pairTokenIn: Token, pairTokenOut: Token) => {
    setTokenIn(pairTokenIn);
    setTokenOut(pairTokenOut);
    setActiveTab('swap');
    setShowComparison(false);
  }, []);

  return (
    <>
      {/* Tool Card Button */}
      <Pressable
        onPress={handleOpenModal}
        style={styles.toolCard}
        accessibilityRole="button"
        accessibilityLabel="Open DeFi Aggregator"
        accessibilityHint="Compare swap rates across all Cardano DEXes"
      >
        <Text style={styles.toolIcon}>◇</Text>
        <View style={styles.toolInfo}>
          <Text style={styles.toolTitle}>DEFI AGGREGATOR</Text>
          <Text style={styles.toolDescription}>Compare rates across all DEXes</Text>
        </View>
      </Pressable>

      {/* Main Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
        accessibilityViewIsModal
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>DEFI AGGREGATOR</Text>
            <Pressable
              onPress={handleCloseModal}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === 'swap' && styles.tabActive]}
              onPress={() => setActiveTab('swap')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'swap' }}
            >
              <Text style={[styles.tabText, activeTab === 'swap' && styles.tabTextActive]}>
                SWAP
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'watchlist' && styles.tabActive]}
              onPress={() => setActiveTab('watchlist')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'watchlist' }}
            >
              <Text style={[styles.tabText, activeTab === 'watchlist' && styles.tabTextActive]}>
                WATCHLIST
              </Text>
            </Pressable>
          </View>

          {activeTab === 'watchlist' ? (
            <View style={styles.watchlistContainer}>
              <TokenWatchlist onSelectPair={handleWatchlistPairSelect} />
            </View>
          ) : (
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
          >
            {/* Token Swap Section */}
            <View style={styles.swapSection}>
              {/* From Token */}
              <View style={styles.tokenRow}>
                <Text style={styles.tokenLabel}>FROM</Text>
                <View style={styles.tokenInputRow}>
                  <Pressable
                    style={styles.tokenButton}
                    onPress={() => setSelectingToken('in')}
                    accessibilityRole="button"
                    accessibilityLabel={`Select input token, currently ${tokenIn.ticker}`}
                  >
                    <Text style={styles.tokenButtonText}>{tokenIn.ticker}</Text>
                    <Text style={styles.tokenDropdown}>▼</Text>
                  </Pressable>
                  <TextInput
                    style={styles.amountInput}
                    value={amountIn}
                    onChangeText={setAmountIn}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={cyberpunk.textMuted}
                    accessibilityLabel="Amount to swap"
                    accessibilityHint="Enter the amount of tokens you want to swap"
                  />
                </View>
              </View>

              {/* Swap Direction Button */}
              <Pressable
                style={styles.swapDirectionButton}
                onPress={handleSwapTokens}
                accessibilityRole="button"
                accessibilityLabel="Swap token direction"
              >
                <Text style={styles.swapDirectionText}>↑↓</Text>
              </Pressable>

              {/* To Token */}
              <View style={styles.tokenRow}>
                <Text style={styles.tokenLabel}>TO</Text>
                <View style={styles.tokenInputRow}>
                  <Pressable
                    style={styles.tokenButton}
                    onPress={() => setSelectingToken('out')}
                    accessibilityRole="button"
                    accessibilityLabel={`Select output token, currently ${tokenOut.ticker}`}
                  >
                    <Text style={styles.tokenButtonText}>{tokenOut.ticker}</Text>
                    <Text style={styles.tokenDropdown}>▼</Text>
                  </Pressable>
                  <View style={styles.amountOutput}>
                    <Text style={styles.amountOutputText}>
                      {quote ? formatTokenAmount(quote.amountOut, quote.tokenOut.decimals) : '—'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Best Quote Card */}
            <SwapQuoteCard
              quote={quote}
              loading={quoteLoading}
              error={quoteError}
            />

            {/* Compare All DEXes Button */}
            <CyberButton
              title={showComparison ? 'HIDE COMPARISON' : 'COMPARE ALL DEXES'}
              variant="secondary"
              onPress={() => {
                if (showComparison) {
                  setShowComparison(false);
                } else {
                  fetchComparison();
                }
              }}
              disabled={!quote}
            />

            {/* DEX Comparison Table */}
            {showComparison && (
              <DEXComparisonTable
                comparisons={comparisons}
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                loading={comparisonLoading}
                error={comparisonError}
              />
            )}
          </ScrollView>
          )}

          {/* Footer */}
          <View style={styles.modalFooter}>
            <CyberButton title="CLOSE" variant="secondary" onPress={handleCloseModal} />
          </View>
        </View>
      </Modal>

      {/* Token Selector Modal */}
      <TokenSelector
        visible={selectingToken !== null}
        onClose={() => setSelectingToken(null)}
        onSelect={handleSelectToken}
        excludeTokenId={selectingToken === 'in' ? tokenOut.id : tokenIn.id}
        title={selectingToken === 'in' ? 'SELECT INPUT TOKEN' : 'SELECT OUTPUT TOKEN'}
      />
    </>
  );
}

const styles = StyleSheet.create({
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    padding: 16,
    gap: 16,
  },
  toolIcon: {
    fontSize: 32,
    color: cyberpunk.neonCyan,
    fontFamily: typography.fonts.primary,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.neonCyan,
    letterSpacing: 2,
    marginBottom: 4,
  },
  toolDescription: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.neonCyan,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: cyberpunk.bgTertiary,
  },
  modalTitle: {
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
    borderColor: cyberpunk.electricBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.electricBlue,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: cyberpunk.bgTertiary,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: cyberpunk.neonCyan,
  },
  tabText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.electricBlue,
    letterSpacing: 2,
  },
  tabTextActive: {
    color: cyberpunk.neonCyan,
  },
  watchlistContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
    gap: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: cyberpunk.bgTertiary,
  },
  swapSection: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
  },
  tokenRow: {
    gap: 8,
  },
  tokenLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    color: cyberpunk.electricBlue,
    letterSpacing: 2,
  },
  tokenInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cyberpunk.bgPrimary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  tokenButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.neonCyan,
    letterSpacing: 1,
  },
  tokenDropdown: {
    fontSize: 10,
    color: cyberpunk.textMuted,
  },
  amountInput: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    padding: 12,
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.lg,
    color: cyberpunk.textPrimary,
    textAlign: 'right',
  },
  amountOutput: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  amountOutputText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.lg,
    color: cyberpunk.textMuted,
  },
  swapDirectionButton: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cyberpunk.bgPrimary,
    borderWidth: 1,
    borderColor: cyberpunk.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  swapDirectionText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.neonCyan,
  },
});
