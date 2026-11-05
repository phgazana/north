import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityRow } from '@/components/activity/ActivityRow';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/ui/BottomNav';
import { Icon } from '@/components/ui/Icon';
import { summariesService, MonthlySummary } from '@/services/summaries';
import { colors, typography } from '@/theme';
import { labelFromDate, monthKeyFromLabel } from '@/utils/date';
import { money } from '@/utils/format';

export default function MonthDetail() {
  const router = useRouter();
  const { mes } = useLocalSearchParams<{ mes: string }>();
  const name = decodeURIComponent(String(mes || labelFromDate(new Date())));
  const selectedKey = monthKeyFromLabel(name);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const selectedKeyRef = useRef(selectedKey);
  selectedKeyRef.current = selectedKey;
  const [dataKey, setDataKey] = useState<string | undefined>();

  async function loadSummary(key = selectedKey) {
    const request = ++requestId.current;
    if (!key) {
      setSummary(null); setDataKey(key); setError('O mês informado não é válido.'); setLoading(false); return;
    }
    const [year, month] = key.split('-').map(Number);
    setSummary(null); setDataKey(undefined);
    setLoading(true); setError('');
    try {
      const result = await summariesService.get(year, month);
      if (request !== requestId.current || key !== selectedKeyRef.current) return;
      setSummary(result); setDataKey(key);
    } catch (loadError) {
      if (request !== requestId.current || key !== selectedKeyRef.current) return;
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar este mês.'); setDataKey(key);
    } finally {
      if (request === requestId.current && key === selectedKeyRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary(selectedKey);
    return () => { requestId.current += 1; };
  }, [selectedKey]);
  const related = (summary?.activities ?? []).slice()
    .sort((a, b) => ((a.status === 'CONCLUIDA' ? a.completedAt ?? a.date : a.date) ?? '').localeCompare((b.status === 'CONCLUIDA' ? b.completedAt ?? b.date : b.date) ?? '') || (a.time ?? '').localeCompare(b.time ?? ''));
  const currentMonthReady = !loading && dataKey === selectedKey;

  if (!currentMonthReady || error) return <SafeAreaView style={styles.safe}><View style={styles.state}><Pressable onPress={() => router.back()} style={styles.back}><Icon name="arrow-left" size={24} /></Pressable>{!currentMonthReady ? <><ActivityIndicator color={colors.blue} /><Text style={styles.emptyText}>Carregando {name}...</Text></> : <><Text style={styles.error}>{error}</Text><Button title="Tentar novamente" variant="secondary" size="small" onPress={() => void loadSummary(selectedKey)} /></>}</View><BottomNav /></SafeAreaView>;

  const entries = summary?.realizedEntries ?? 0;
  const exits = summary?.realizedExits ?? 0;
  const result = summary?.realizedResult ?? 0;
  const goalValue = summary?.goalValue ?? 0;
  const projected = summary?.projection ?? 0;

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.top}><Pressable onPress={() => router.back()} hitSlop={8}><Icon name="arrow-left" size={24} /></Pressable><Text style={styles.title}>{name}</Text><View style={{ width: 24 }} /></View>
      <View style={styles.metricsRow}><Metric label="Entradas realizadas" value={money(entries)} tone="entry" /><Metric label="Saídas realizadas" value={money(exits)} tone="exit" /></View>
      <View style={styles.metricsRow}><Metric label="Resultado realizado" value={money(result)} tone="result" /><Metric label="Meta do mês" value={money(goalValue)} tone="goal" /></View>
      <View style={styles.projection}><Text style={styles.projLabel}>Projeção do mês</Text><Text style={styles.projValue}>{money(projected)}</Text></View>
      <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Atividades relacionadas</Text><Pressable onPress={() => router.push('/atividades' as any)}><Text style={styles.link}>Ver todas</Text></Pressable></View>
      <View style={styles.list}>{related.length ? related.map(activity => <ActivityRow key={activity.id} item={activity} history swipeable={false} onPress={() => router.push(`/atividade/${activity.id}` as any)} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>Nenhuma atividade neste mês</Text><Text style={styles.emptyText}>Atividades com data prevista em {name} aparecerão aqui.</Text></View>}</View>
    </ScrollView>
    <BottomNav />
  </SafeAreaView>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'entry' | 'exit' | 'result' | 'goal' }) {
  const color = tone === 'entry' ? colors.success : tone === 'exit' ? colors.error : colors.navy;
  return <View style={styles.metric}><Text style={styles.ml}>{label}</Text><Text style={[styles.mv, { color }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white }, page: { width: '100%', maxWidth: 820, alignSelf: 'center', padding: 20, paddingBottom: 105 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }, back: { position: 'absolute', top: 16, left: 20 }, error: { ...typography.body2, color: colors.error, textAlign: 'center' },
  top: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }, title: { ...typography.h2, color: colors.navy }, metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  metric: { flex: 1, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 13 }, ml: { ...typography.caption, color: colors.gray700 }, mv: { ...typography.body2Medium, marginTop: 4, fontSize: 16 },
  projection: { marginTop: 2, borderRadius: 10, backgroundColor: colors.navy, padding: 14 }, projLabel: { ...typography.caption, color: '#D8E0EA' }, projValue: { ...typography.h2, color: colors.white, marginTop: 4 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }, sectionTitle: { ...typography.label, color: colors.navy }, link: { ...typography.label, color: colors.blue }, list: { gap: 2 },
  empty: { paddingVertical: 22, paddingHorizontal: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.gray200, borderRadius: 10 }, emptyTitle: { ...typography.body2Medium, color: colors.navy }, emptyText: { ...typography.caption, color: colors.gray500, textAlign: 'center', marginTop: 5 },
});
