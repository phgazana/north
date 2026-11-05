import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context';
import { parseMoney } from '@/utils/format';

export default function Meta() {
  const router = useRouter();
  const { goal, setGoal } = useApp();
  const [value, setValue] = useState(goal.value ? goal.value.toFixed(2).replace('.', ',') : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function continueToConfirmation() {
    const amountText = value.trim();
    const amount = parseMoney(amountText);
    if (amountText && (amount === null || amount <= 0)) {
      setError('Informe um valor maior que zero ou escolha definir a meta depois.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (amountText && amount !== null) await setGoal(amount);
      router.replace('/confirmacao' as any);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar a meta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back}><Icon name="arrow-left" size={24} /></Pressable>
        <Text style={styles.title}>Qual é a sua meta mensal?</Text>
        <Text style={styles.sub}>Defina um valor para te guiar neste mês. Você pode alterar depois.</Text>
        <Field label="Valor da meta (opcional)" value={value} onChangeText={setValue} prefix="R$" keyboardType="decimal-pad" error={error} />
        <Text style={styles.helper}>A meta representa o resultado que você deseja alcançar ao final do mês. Você também pode continuar sem definir uma agora.</Text>
        <Button title={saving ? 'Salvando...' : 'Continuar'} size="large" onPress={continueToConfirmation} disabled={saving} style={styles.cta} />
        <Pressable onPress={() => router.replace('/confirmacao' as any)} style={styles.later} disabled={saving}>
          <Text style={styles.link}>Definir depois</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  page: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20, paddingBottom: 30 },
  back: { height: 42, width: 40, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.navy, marginTop: 12 },
  sub: { ...typography.body2, color: colors.gray700, marginTop: 4, marginBottom: 24 },
  helper: { ...typography.caption, color: colors.gray700, marginTop: 8, lineHeight: 18 },
  cta: { marginTop: 26 },
  later: { alignItems: 'center', marginTop: 18, padding: 10 },
  link: { color: colors.blue, fontFamily: 'Inter-SemiBold', fontSize: 12 },
});
