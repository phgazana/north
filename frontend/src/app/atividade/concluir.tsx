import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useApp } from '@/context';
import { colors, typography } from '@/theme';
import { parseBRDate, todayBR } from '@/utils/date';
import { money, parseMoney } from '@/utils/format';

export default function Complete() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities, completeActivity } = useApp();
  const activity = activities.find(item => item.id === id);
  const [realized, setRealized] = useState(activity?.plannedValue?.toFixed(2).replace('.', ',') ?? '');
  const [date, setDate] = useState(todayBR());
  const [observation, setObservation] = useState(activity?.observation ?? '');
  const [type, setType] = useState<'ENTRADA' | 'SAIDA'>(activity?.plannedType ?? 'SAIDA');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!activity) return <SafeAreaView style={styles.safe}><Text style={styles.error}>Atividade não encontrada.</Text></SafeAreaView>;

  async function finish() {
    if (!activity || saving) return;
    const amount = parseMoney(realized);
    if (!parseBRDate(date)) { setError('Informe uma data válida no formato DD/MM/AAAA.'); return; }
    if (realized.trim() && (amount === null || amount <= 0)) { setError('Informe um valor maior que zero ou deixe o campo vazio.'); return; }
    setSaving(true); setError('');
    try {
      await completeActivity(activity.id, {
        realizedValue: amount ?? undefined,
        completedAt: date,
        realizedType: amount !== null ? type : undefined,
        observation: observation.trim() || undefined,
      });
      router.replace(`/atividade/${activity.id}` as any);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível concluir a atividade. Tente novamente.');
    } finally { setSaving(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}><Pressable onPress={() => router.back()} disabled={saving}><Text style={styles.cancel}>Cancelar</Text></Pressable><Pressable onPress={() => void finish()} disabled={saving}><Text style={styles.save}>{saving ? 'Salvando...' : 'Concluir'}</Text></Pressable></View>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Concluir atividade</Text><Text style={styles.sub}>Confirme as informações e registre o resultado.</Text>
        <View style={styles.notice}><Icon name="check-circle" size={20} color={colors.success} /><Text style={styles.noticeText}>Ao concluir, a atividade será marcada como realizada e aparecerá no histórico.</Text></View>
        <View style={styles.activityCard}><View style={styles.checkBox} /><View style={{ flex: 1 }}><Text style={styles.aTitle}>{activity.title}</Text><Text style={styles.meta}>{activity.date ?? 'Sem data'} · {activity.time ?? 'Sem horário'}</Text><Text style={styles.meta}>Valor previsto: <Text style={styles.strong}>{activity.plannedValue !== undefined ? money(activity.plannedValue) : 'Sem valor'}</Text></Text></View></View>
        <View style={styles.form}>
          <Field label="Valor realizado (opcional)" value={realized} onChangeText={setRealized} prefix="R$" keyboardType="decimal-pad" helper="Deixe em branco se não houver valor." />
          {realized.trim().length > 0 && <View style={styles.typeWrap}><Text style={styles.label}>Tipo do valor</Text><View style={styles.typeRow}><Pressable style={[styles.typeBtn, type === 'ENTRADA' && styles.entryOn]} onPress={() => setType('ENTRADA')}><Icon name="arrow-up" size={17} color={type === 'ENTRADA' ? colors.success : colors.gray500} /><Text style={[styles.typeText, type === 'ENTRADA' && { color: colors.success }]}>Entrada</Text></Pressable><Pressable style={[styles.typeBtn, type === 'SAIDA' && styles.exitOn]} onPress={() => setType('SAIDA')}><Icon name="arrow-down" size={17} color={type === 'SAIDA' ? colors.error : colors.gray500} /><Text style={[styles.typeText, type === 'SAIDA' && { color: colors.error }]}>Saída</Text></Pressable></View></View>}
          <Field label="Data de realização" value={date} onChangeText={setDate} rightIcon="calendar" />
          <Field label="Observações (opcional)" placeholder="Adicione detalhes da realização." value={observation} onChangeText={setObservation} multiline maxLength={200} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title={saving ? 'Concluindo...' : 'Concluir atividade'} variant="dark" size="large" onPress={() => void finish()} disabled={saving} style={styles.bottom} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white }, top: { height: 52, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancel: { ...typography.body2, color: colors.navy }, save: { ...typography.label, color: colors.orange },
  page: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, paddingTop: 6, paddingBottom: 30 },
  title: { ...typography.h1, color: colors.navy }, sub: { ...typography.body2, color: colors.gray700, marginTop: 3, marginBottom: 17 },
  notice: { backgroundColor: colors.successSoft, borderRadius: 10, padding: 12, flexDirection: 'row', gap: 9, alignItems: 'center' },
  noticeText: { ...typography.caption, color: colors.gray700, flex: 1, lineHeight: 17 },
  activityCard: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 13, flexDirection: 'row', gap: 10, marginVertical: 15 }, checkBox: { width: 21, height: 21, borderWidth: 1.5, borderColor: colors.navy, borderRadius: 5 },
  aTitle: { ...typography.body2Medium, color: colors.navy }, meta: { ...typography.caption, color: colors.gray500, marginTop: 2 }, strong: { fontFamily: 'Inter-SemiBold', color: colors.navy },
  form: { gap: 15 }, typeWrap: { gap: 7 }, label: { ...typography.label, color: colors.navy }, typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, height: 48, borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  entryOn: { backgroundColor: colors.successSoft, borderColor: '#86D6AA' }, exitOn: { backgroundColor: colors.errorSoft, borderColor: '#F5AAAA' }, typeText: { ...typography.label, color: colors.gray500 },
  bottom: { marginTop: 20 }, error: { ...typography.caption, color: colors.error, padding: 20, textAlign: 'center' },
});
