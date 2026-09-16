import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/theme';
import { StyleSheet } from 'react-native';

export default function WelcomeScreen() {
  return (
    <ThemedView style={styles.container} bgColor={colors.offWhite}>
      <ThemedText variant="display" color={colors.navy}>
        NORTH
      </ThemedText>
      <ThemedText variant="bodyMedium" color={colors.textSecondary} style={styles.subtitle}>
        Clareza e controle das suas atividades.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
});