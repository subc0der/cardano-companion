/**
 * GameHeader - Game Title and Both Player Scores
 *
 * Displays the game title with both player and AI chip balances.
 * Includes a menu button for New Game option.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cyberpunk, adaRollz } from '../../../lib/theme/colors';
import { typography } from '../../../lib/theme/typography';

interface GameHeaderProps {
  /** Player's current chip balance */
  playerChips: number;
  /** AI's current chip balance */
  aiChips: number;
  /** Callback for new game */
  onNewGame: () => void;
}

export function GameHeader({
  playerChips,
  aiChips,
  onNewGame,
}: GameHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleNewGame = () => {
    setMenuVisible(false);
    onNewGame();
  };

  return (
    <View style={styles.container}>
      {/* Left: AI chips */}
      <View style={styles.chipDisplay}>
        <Text style={styles.chipLabel}>AI</Text>
        <Text style={styles.chipAmount}>{aiChips}</Text>
      </View>

      {/* Center: Title with menu button */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>ADA ROLLZ</Text>
        <Pressable
          onPress={() => setMenuVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Game menu"
          accessibilityHint="Open menu for game options"
          style={styles.menuButton}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={cyberpunk.textMuted}
          />
        </Pressable>
      </View>

      {/* Right: Player chips */}
      <View style={[styles.chipDisplay, styles.playerChips]}>
        <Text style={styles.chipLabel}>YOU</Text>
        <Text style={[styles.chipAmount, styles.playerAmount]}>
          {playerChips}
        </Text>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        accessibilityViewIsModal={true}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menu}>
            <Pressable
              onPress={handleNewGame}
              accessibilityRole="button"
              accessibilityLabel="New Game"
              accessibilityHint="Reset chips and start a fresh game"
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={cyberpunk.neonCyan}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>New Game</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    color: cyberpunk.neonYellow,
    textShadowColor: 'rgba(255, 255, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  menuButton: {
    padding: 4,
  },
  chipDisplay: {
    alignItems: 'center',
    backgroundColor: cyberpunk.bgSecondary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    minWidth: 60,
  },
  playerChips: {
    borderColor: adaRollz.chipGold,
  },
  chipLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: 9,
    color: cyberpunk.textMuted,
    letterSpacing: 1,
  },
  chipAmount: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.md,
    color: cyberpunk.textSecondary,
  },
  playerAmount: {
    color: adaRollz.chipGold,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  menu: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    minWidth: 160,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    backgroundColor: cyberpunk.bgTertiary,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
  },
});
