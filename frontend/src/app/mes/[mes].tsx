import React,{useEffect,useState} from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';
import { BottomNav } from '@/components/ui/BottomNav';
import { ActivityRow } from '@/components/activity/ActivityRow';
import { useApp } from '@/context';
import { summariesService, MonthlySummary } from '@/services/summaries';
import { money } from '@/utils/format';
import { monthKey, monthKeyFromLabel, labelFromDate } from '@/utils/date';

export default function MonthDetail() {
  const router = useRouter();
  const { mes } = useLocalSearchParams();
  const name = decodeURIComponent(String(mes || labelFromDate(new Date())));
  const selectedKey = monthKeyFromLabel(name);
  const [summary,setSummary] = useState<MonthlySummary | null>(null);
  useEffect(() => { if (selectedKey === undefined) return; const [year,month] = selectedKey.split('-').map(Number); setSummary(null); summariesService.get(year,month).then(setSummary).catch(console.error); },[selectedKey]);
  const { activities } = useApp();
  const related = activities.filter(a => monthKey(a.date) === selectedKey && a.status !== 'CANCELADA')
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || (a.time ?? '').localeCompare(b.time ?? ''));
  const entries = summary?.realizedEntries ?? 0;
  const exits = summary?.realizedExits ?? 0;
  const result = summary?.realizedResult ?? 0;
  const goalValue = summary?.goalValue ?? 0;
  const projected = summary?.projection ?? 0;

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Icon name="arrow-left" size={24}/></Pressable>
        <Text style={styles.title}>{name}</Text>
        <View style={{width:24}}/>
      </View>
      <View style={styles.metricsRow}>
        <Metric label="Entradas realizadas" value={money(entries)} tone="entry"/>
        <Metric label="Saídas realizadas" value={money(exits)} tone="exit"/>
      </View>
      <View style={styles.metricsRow}>
        <Metric label="Resultado realizado" value={money(result)} tone="result"/>
        <Metric label="Meta do mês" value={money(goalValue)} tone="goal"/>
      </View>
      <View style={styles.projection}>
        <Text style={styles.projLabel}>Projeção do mês</Text>
        <Text style={styles.projValue}>{money(projected)}</Text>
      </View>
      <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Atividades relacionadas</Text><Pressable onPress={() => router.push('/atividades' as any)}><Text style={styles.link}>Ver todas</Text></Pressable></View>
      <View style={styles.list}>{related.length ? related.map(a => <ActivityRow key={a.id} item={a} history swipeable={false} onPress={() => router.push(`/atividade/${a.id}` as any)} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>Nenhuma atividade neste mês</Text><Text style={styles.emptyText}>As atividades com data prevista em {name} aparecerão aqui.</Text></View>}</View>
    </ScrollView>
    <BottomNav/>
  </SafeAreaView>;
}
function Metric({label,value,tone}:{label:string;value:string;tone:'entry'|'exit'|'result'|'goal'}){const color=tone==='entry'?colors.success:tone==='exit'?colors.error:colors.navy;return <View style={styles.metric}><Text style={styles.ml}>{label}</Text><Text style={[styles.mv,{color}]}>{value}</Text></View>}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.white},page:{padding:20,paddingBottom:105},top:{height:44,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10},title:{...typography.h2,color:colors.navy},metricsRow:{flexDirection:'row',gap:8,marginBottom:8},metric:{flex:1,borderWidth:1,borderColor:colors.gray200,borderRadius:8,padding:13},ml:{...typography.caption,color:colors.gray700},mv:{...typography.body2Medium,marginTop:4,fontSize:16},projection:{marginTop:2,borderRadius:8,backgroundColor:colors.navy,padding:14},projLabel:{...typography.caption,color:'#D8E0EA'},projValue:{...typography.h2,color:colors.white,marginTop:4},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:20,marginBottom:8},sectionTitle:{...typography.label,color:colors.navy},link:{...typography.label,color:colors.blue},list:{gap:2},empty:{paddingVertical:22,paddingHorizontal:14,alignItems:'center',borderWidth:1,borderColor:colors.gray200,borderRadius:8},emptyTitle:{...typography.body2Medium,color:colors.navy},emptyText:{...typography.caption,color:colors.gray500,textAlign:'center',marginTop:5}});
