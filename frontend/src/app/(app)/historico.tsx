import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';
import { BottomNav } from '@/components/ui/BottomNav';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { summariesService, MonthlySummary } from '@/services/summaries';
import { labelFromDate } from '@/utils/date';
import { money } from '@/utils/format';
import { Button } from '@/components/ui/Button';

export default function History() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const selectedYearRef = useRef(year);
  selectedYearRef.current = year;
  const [dataYear, setDataYear] = useState<number | null>(null);

  async function loadHistory(selectedYear: number) {
    const request = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const data = await summariesService.history(selectedYear);
      if (request !== requestId.current || selectedYear !== selectedYearRef.current) return;
      setMonths(data.filter(month => month.activities.length > 0 || month.goalValue !== null));
      setDataYear(selectedYear);
    } catch (loadError) {
      if (request !== requestId.current || selectedYear !== selectedYearRef.current) return;
      setMonths([]);
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o histórico.');
      setDataYear(selectedYear);
    } finally {
      if (request === requestId.current && selectedYear === selectedYearRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory(year);
    return () => { requestId.current += 1; };
  }, [year]);

  const currentYearReady = dataYear === year && !loading;

  const list = useMemo(() => months.filter(month =>
    labelFromDate(new Date(month.year, month.month - 1, 1)).toLowerCase().includes(query.trim().toLowerCase())
  ), [months, query]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Voltar"><Icon name="arrow-left" size={24} /></Pressable>
          <Text style={styles.title}>Histórico</Text>
          <View style={styles.year}>
            <Pressable onPress={() => setYear(value => Math.max(2000, value - 1))} accessibilityRole="button" accessibilityLabel="Ano anterior"><Icon name="arrow-left" size={18} color={colors.blue} /></Pressable>
            <Text style={styles.yearText}>{year}</Text>
            <Pressable onPress={() => setYear(value => Math.min(2100, value + 1))} accessibilityRole="button" accessibilityLabel="Próximo ano"><Icon name="arrow-right" size={18} color={colors.blue} /></Pressable>
          </View>
        </View>

        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.gray500} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar no histórico..." placeholderTextColor={colors.gray500} style={styles.searchInput} accessibilityLabel="Buscar no histórico" />
          {!!query && <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Limpar busca"><Icon name="close" size={17} color={colors.gray500} /></Pressable>}
        </View>

        {!currentYearReady ? <View style={styles.state}><ActivityIndicator color={colors.blue} /><Text style={styles.stateText}>Carregando histórico...</Text></View> : null}
        {currentYearReady && error ? <View style={styles.state}><Text style={styles.error}>{error}</Text><Button title="Tentar novamente" variant="secondary" size="small" onPress={() => void loadHistory(year)} /></View> : null}
        {currentYearReady && !error && list.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>{query ? 'Nenhum mês encontrado' : 'Sem registros neste ano'}</Text><Text style={styles.stateText}>{query ? 'Tente outro termo de busca.' : 'Meses com atividades ou metas aparecerão aqui.'}</Text></View> : null}

        {currentYearReady && !error && list.map(month => {
          const label = labelFromDate(new Date(month.year, month.month - 1, 1));
          const percentage = month.realizedPercentage ?? 0;
          return (
            <Pressable key={`${month.year}-${month.month}`} style={styles.card} onPress={() => router.push(`/mes/${encodeURIComponent(label)}` as any)} accessibilityRole="button">
              <View style={styles.cardTop}>
                <View><Text style={styles.month}>{label}</Text><Text style={styles.value}>{money(month.realizedResult)}</Text></View>
                <Text style={styles.pct}>{Math.round(percentage)}%</Text>
                <Icon name="chevron-right" size={21} />
              </View>
              <ProgressBar value={percentage} fill={percentage >= 100 ? colors.success : colors.navy} track="#D7DEE8" height={6} />
            </Pressable>
          );
        })}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, paddingBottom: 24 },
  head: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  title: { ...typography.h1, color: colors.navy, flex: 1 },
  year: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  yearText: { ...typography.label, color: colors.navy },
  search: { minHeight: 44, borderRadius: 10, backgroundColor: colors.gray100, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  searchInput: { flex: 1, ...typography.body2, color: colors.gray900, paddingVertical: 8 },
  card: { borderBottomWidth: 1, borderBottomColor: colors.gray200, paddingVertical: 13, gap: 9 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  month: { ...typography.label, color: colors.navy, textTransform: 'capitalize' },
  value: { ...typography.body2Medium, color: colors.navy, marginTop: 2 },
  pct: { ...typography.label, color: colors.gray700, marginLeft: 'auto' },
  state: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20 },
  stateText: { ...typography.body2, color: colors.gray500, textAlign: 'center' },
  error: { ...typography.body2, color: colors.error, textAlign: 'center' },
  empty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gray200, borderRadius: 12, padding: 20, gap: 6 },
  emptyTitle: { ...typography.body2Medium, color: colors.navy },
});
