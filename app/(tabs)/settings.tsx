/**
 * Settings screen with sections for Privacy, Display, Game, and About.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { CyberCard } from '../../components/ui/CyberCard';
import { usePrivacyStore } from '../../lib/stores/privacy';
import {
  useSettingsStore,
  REFRESH_INTERVALS,
  type RefreshIntervalKey,
  type CurrencyDisplay,
} from '../../lib/stores/settings';

/** Toggle switch component */
function ToggleSwitch({
  value,
  onToggle,
  accessibilityLabel,
}: {
  value: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.toggle, value && styles.toggleActive]}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
    >
      <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
    </Pressable>
  );
}

/** Setting row with toggle */
function SettingToggle({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <ToggleSwitch value={value} onToggle={onToggle} accessibilityLabel={label} />
    </View>
  );
}

/** Option selector component */
function OptionSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.optionButton, value === option.value && styles.optionButtonActive]}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: value === option.value }}
          >
            <Text
              style={[styles.optionText, value === option.value && styles.optionTextActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Section header */
function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

/** Link row for About section */
function LinkRow({ label, url }: { label: string; url: string }) {
  const handlePress = () => {
    Linking.openURL(url);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.linkRow}
      accessibilityRole="link"
      accessibilityLabel={`Open ${label}`}
    >
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkArrow}>&gt;</Text>
    </Pressable>
  );
}

const CURRENCY_OPTIONS: { value: CurrencyDisplay; label: string }[] = [
  { value: 'ADA', label: 'ADA' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const REFRESH_OPTIONS: { value: RefreshIntervalKey; label: string }[] = [
  { value: '30s', label: '30s' },
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
];

export default function SettingsScreen() {
  // Privacy store
  const {
    hideBalances,
    hideAddresses,
    toggleHideBalances,
    toggleHideAddresses,
  } = usePrivacyStore();

  // Settings store
  const {
    compactBalances,
    currencyDisplay,
    hapticsEnabled,
    refreshInterval,
    toggleCompactBalances,
    setCurrencyDisplay,
    toggleHapticsEnabled,
    setRefreshInterval,
    resetToDefaults,
  } = useSettingsStore();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>SETTINGS</Text>

        {/* Privacy Section */}
        <SectionTitle>PRIVACY</SectionTitle>
        <CyberCard glowColor="magenta">
          <SettingToggle
            label="Hide Balances"
            description="Replace balance values with asterisks"
            value={hideBalances}
            onToggle={toggleHideBalances}
          />
          <View style={styles.divider} />
          <SettingToggle
            label="Hide Addresses"
            description="Truncate wallet addresses in display"
            value={hideAddresses}
            onToggle={toggleHideAddresses}
          />
        </CyberCard>

        {/* Display Section */}
        <SectionTitle>DISPLAY</SectionTitle>
        <CyberCard glowColor="cyan">
          <SettingToggle
            label="Compact Balances"
            description="Show shortened numbers (e.g. 1.5K)"
            value={compactBalances}
            onToggle={toggleCompactBalances}
          />
          <View style={styles.divider} />
          <OptionSelector
            label="Currency Display"
            options={CURRENCY_OPTIONS}
            value={currencyDisplay}
            onChange={setCurrencyDisplay}
          />
          <Text style={styles.comingSoon}>Fiat conversion coming soon</Text>
        </CyberCard>

        {/* Data Section */}
        <SectionTitle>DATA</SectionTitle>
        <CyberCard glowColor="cyan">
          <OptionSelector
            label="Auto-Refresh"
            options={REFRESH_OPTIONS}
            value={refreshInterval}
            onChange={setRefreshInterval}
          />
        </CyberCard>

        {/* Game Section */}
        <SectionTitle>GAME</SectionTitle>
        <CyberCard glowColor="magenta">
          <SettingToggle
            label="Haptic Feedback"
            description="Vibration on dice rolls and actions"
            value={hapticsEnabled}
            onToggle={toggleHapticsEnabled}
          />
        </CyberCard>

        {/* About Section */}
        <SectionTitle>ABOUT</SectionTitle>
        <CyberCard glowColor="none">
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Version</Text>
            <Text style={styles.versionValue}>{appVersion}</Text>
          </View>
          <View style={styles.divider} />
          <LinkRow label="Cardano Documentation" url="https://docs.cardano.org" />
          <View style={styles.divider} />
          <LinkRow label="Privacy Policy" url="https://cardano.org/privacy" />
          <View style={styles.divider} />
          <LinkRow label="Terms of Service" url="https://cardano.org/terms" />
        </CyberCard>

        {/* Reset Button */}
        <Pressable
          onPress={resetToDefaults}
          style={styles.resetButton}
          accessibilityRole="button"
          accessibilityLabel="Reset settings to defaults"
        >
          <Text style={styles.resetButtonText}>RESET TO DEFAULTS</Text>
        </Pressable>

        {/* Footer spacer */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const TOGGLE_WIDTH = 50;
const TOGGLE_HEIGHT = 28;
const KNOB_SIZE = 22;
const KNOB_MARGIN = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cyberpunk.bgPrimary,
  },
  content: {
    padding: 20,
  },
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes['2xl'],
    color: cyberpunk.electricBlue,
    textShadowColor: 'rgba(0, 128, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 4,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
    letterSpacing: 1,
  },
  settingDescription: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: cyberpunk.bgTertiary,
    marginVertical: 12,
  },
  toggle: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: TOGGLE_HEIGHT / 2,
    backgroundColor: cyberpunk.bgTertiary,
    borderWidth: 1,
    borderColor: cyberpunk.textMuted,
    justifyContent: 'center',
    paddingHorizontal: KNOB_MARGIN,
  },
  toggleActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderColor: cyberpunk.neonCyan,
  },
  toggleKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: cyberpunk.textMuted,
  },
  toggleKnobActive: {
    backgroundColor: cyberpunk.neonCyan,
    alignSelf: 'flex-end',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    backgroundColor: cyberpunk.bgTertiary,
  },
  optionButtonActive: {
    borderColor: cyberpunk.neonCyan,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  optionText: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
  },
  optionTextActive: {
    color: cyberpunk.neonCyan,
  },
  comingSoon: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.xs,
    color: cyberpunk.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  versionLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
    letterSpacing: 1,
  },
  versionValue: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textSecondary,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  linkLabel: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textPrimary,
    letterSpacing: 1,
  },
  linkArrow: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textMuted,
  },
  resetButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.error,
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    alignItems: 'center',
  },
  resetButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.error,
    letterSpacing: 2,
  },
  footer: {
    height: 40,
  },
});
