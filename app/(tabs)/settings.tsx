import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            App settings and preferences
          </Text>
        </View>
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
  placeholder: {
    backgroundColor: cyberpunk.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cyberpunk.bgTertiary,
    padding: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    color: cyberpunk.textSecondary,
    textAlign: 'center',
  },
});
