import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useApp } from '@/context';
import { colors, typography } from '@/theme';
import { parseMoney } from '@/utils/format';

export default function ManageGoal() {
  const router = useRouter();
  const { goal, setGoal } = useApp();
  const [value, setValue] = useState(String(goal.value).replace('.', ','));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    const amount = parseMoney(value);
    if (amount === null || amount <= 0) { setError('Informe um valor maior que zero.'); return; }
    setSaving(true); setError('');
    try { await setGoal(amount); router.back(); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar a meta.'); }
    finally { setSaving(false); }
  }

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><View style={styles.top}><Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar"><Icon name="arrow-left" size={24} /></Pressable><Text style={styles.title}>Meta atual</Text><View style={{ width: 24 }} /></View><Text style={styles.month}>{goal.month}</Text><Field label="Valor da meta" value={value} onChangeText={setValue} prefix="R$" keyboardType="decimal-pad" error={error} /><Button title={saving ? 'Salvando...' : 'Salvar meta'} size="large" onPress={() => void save()} disabled={saving} style={styles.cta} /></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.white }, page: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20 }, top: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { ...typography.h2, color: colors.navy }, month: { ...typography.body2, color: colors.gray700, marginBottom: 24 }, cta: { marginTop: 26 } });
