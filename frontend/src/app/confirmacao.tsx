import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context';

export default function Confirmation() {
  const router = useRouter();
  const { completeOnboarding, landingScreen } = useApp();
  const [error, setError] = useState('');
  const [opening, setOpening] = useState(false);

  async function finish() {
    setOpening(true);
    setError('');
    try {
      await completeOnboarding();
      router.replace((landingScreen === 'activities' ? '/atividades' : '/home') as any);
    } catch {
      setError('Não foi possível concluir a configuração. Tente novamente.');
      setOpening(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.center}>
          <View style={styles.icon}><Icon name="check" size={31} color={colors.success} /></View>
          <Text style={styles.title}>Tudo pronto!</Text>
          <Text style={styles.text}>Sua conta está pronta para uso. Você pode definir ou alterar sua meta mensal a qualquer momento.</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={opening ? 'Abrindo...' : 'Ir para o app'} size="large" onPress={finish} disabled={opening} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  page: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20, justifyContent: 'space-between' },
  center: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  icon: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h1, color: colors.navy, marginTop: 18 },
  text: { ...typography.body2, color: colors.gray700, textAlign: 'center', lineHeight: 21, maxWidth: 340, marginTop: 6 },
  error: { ...typography.caption, color: colors.error, textAlign: 'center', marginBottom: 8 },
});
