import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cyberpunk } from '../../lib/theme/colors';
import { typography } from '../../lib/theme/typography';
import { StakingTool } from '../../components/staking';
import { ExportTool } from '../../components/tools/ExportTool';
import { DeFiTool } from '../../components/defi';

export default function ToolsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>TOOLS</Text>
        <View style={styles.toolsList}>
          <DeFiTool />
          <StakingTool />
          <ExportTool />
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
    color: cyberpunk.neonCyan,
    textShadowColor: cyberpunk.glowCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 4,
    marginBottom: 24,
  },
  toolsList: {
    gap: 16,
  },
});
