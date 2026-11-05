import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { BottomNav } from '@/components/ui/BottomNav';
import { Donut } from '@/components/ui/Donut';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon } from '@/components/ui/Icon';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/context';
import { Button } from '@/components/ui/Button';
import { money } from '@/utils/format';
import { monthKey, monthKeyFromLabel, parseBRDate } from '@/utils/date';

export default function Home() {
  const router = useRouter();
  const { activities, goal, user, appDataLoading, appDataError, refreshAppData } = useApp();
  const selectedMonthLabel = goal.month || 'Setembro 2026';
  const selectedMonthKey = monthKeyFromLabel(selectedMonthLabel);
  const monthActivities = activities.filter(a => monthKey(a.date) === selectedMonthKey);
  const realizedActivities = activities.filter(a => a.status === 'CONCLUIDA' && monthKey(a.completedAt) === selectedMonthKey);
  const realizedEntries = realizedActivities.filter(a => a.realizedType === 'ENTRADA').reduce((sum, a) => sum + (a.realizedValue ?? 0), 0);
  const realizedExits = realizedActivities.filter(a => a.realizedType === 'SAIDA').reduce((sum, a) => sum + (a.realizedValue ?? 0), 0);
  const realized = realizedEntries - realizedExits;
  const pending = monthActivities.filter(a => a.status === 'PENDENTE');
  const plannedEntries = pending.filter(a => a.plannedType === 'ENTRADA').reduce((sum, a) => sum + (a.plannedValue ?? 0), 0);
  const plannedExits = pending.filter(a => a.plannedType === 'SAIDA').reduce((sum, a) => sum + (a.plannedValue ?? 0), 0);
  const projection = realized + plannedEntries - plannedExits;
  const percent = goal.value > 0 ? Math.max(0, Math.min(100, realized / goal.value * 100)) : 0;
  const distance = projection - goal.value;
  const upcoming = useMemo(() => pending
    .filter(a => a.date)
    .sort((a, b) => {
      const da = parseBRDate(a.date)?.getTime() ?? Infinity;
      const db = parseBRDate(b.date)?.getTime() ?? Infinity;
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const overdueA = da < now.getTime() ? 0 : 1;
      const overdueB = db < now.getTime() ? 0 : 1;
      return overdueA - overdueB || Number(b.priority) - Number(a.priority) || da - db || (a.time ?? '').localeCompare(b.time ?? '');
    }).slice(0, 3), [pending]);

  if (appDataLoading) return <SafeAreaView style={styles.safe}><View style={styles.loadState}><ActivityIndicator color={colors.blue} /><Text style={styles.loadText}>Carregando seu panorama...</Text></View><BottomNav/></SafeAreaView>;
  if (appDataError) return <SafeAreaView style={styles.safe}><View style={styles.loadState}><Icon name="alert" size={28} color={colors.error}/><Text style={styles.loadError}>{appDataError}</Text><Button title="Tentar novamente" variant="secondary" size="small" onPress={() => void refreshAppData()}/></View><BottomNav/></SafeAreaView>;

  return <SafeAreaView style={styles.safe}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Pressable style={styles.month} onPress={() => router.push(`/mes/${encodeURIComponent(selectedMonthLabel)}` as any)}>
        <Text style={styles.monthText}>{selectedMonthLabel}</Text><Icon name="chevron-down" size={18}/>
      </Pressable>
      <Text style={styles.greet}>Olá, {user?.name?.trim().split(/\\s+/)[0] || "por aqui"}</Text>
      <Text style={styles.subtitle}>Aqui está o seu panorama do mês.</Text>
      <Pressable onPress={() => router.push('/meta/atual' as any)}>
        <Card style={styles.overview}>
          <View style={styles.donutWrap}><Donut percent={percent} size={112}/></View>
          <View style={styles.overviewMetrics}>
            <Text style={styles.label}>Meta do mês</Text><Text style={styles.big}>{money(goal.value)}</Text>
            <Text style={styles.label}>Resultado realizado</Text><Text style={styles.big}>{money(realized)}</Text>
          </View><Icon name="chevron-right" size={20} color={colors.gray400} style={styles.chevron}/>
        </Card>
      </Pressable>
      <View style={styles.miniRow}>
        <Mini icon="arrow-up" title="Entradas previstas" value={money(plannedEntries)} tone="entry"/>
        <Mini icon="arrow-down" title="Saídas previstas" value={money(plannedExits)} tone="exit"/>
      </View>
      <View style={styles.projection}>
        <View style={styles.projTop}>
          <View style={styles.projMetric}><Text style={styles.projLabel}>Projeção do mês</Text><Text style={styles.projValue}>{money(projection)}</Text></View>
          <View style={styles.projMetric}><Text style={styles.projLabel}>Distância para a meta</Text><Text style={[styles.projValue, { color: distance < 0 ? colors.orange : colors.white }]}>{distance < 0 ? '−' : '+'}{money(Math.abs(distance))}</Text></View>
        </View>
        <ProgressBar value={goal.value > 0 ? Math.max(0, Math.min(100, projection / goal.value * 100)) : 0} track="#7B879A" fill={colors.orange} height={8}/>
        <Text style={styles.projContext}>{distance < 0 ? `Com o planejamento atual, você ficará ${money(Math.abs(distance))} abaixo da sua meta.` : distance > 0 ? `Com o planejamento atual, você ficará ${money(distance)} acima da sua meta.` : 'Com o planejamento atual, você alcançará sua meta.'}</Text>
      </View>
      <SectionTitle title="Próximas atividades" action="Ver todas" onPress={() => router.push('/atividades' as any)}/>
      <View style={styles.activityBox}>
        {upcoming.length ? upcoming.map(a => {
          const overdue = !!a.date && !!parseBRDate(a.date) && parseBRDate(a.date)!.getTime() < new Date(new Date().setHours(0,0,0,0)).getTime();
          const iconName = (['study','health','leisure','work','market','home','payment','other'].includes(a.icon) ? a.icon : 'other') as any;
          return <Pressable key={a.id} onPress={() => router.push(`/atividade/${a.id}` as any)} style={styles.next}>
            <View style={[styles.nextIcon, a.priority && styles.priorityIcon]}><Icon name={iconName} size={18} color={a.priority ? colors.blue : colors.navy}/></View>
            <View style={styles.nextInfo}><View style={styles.titleLine}><Text style={styles.nextTitle} numberOfLines={1}>{a.title}</Text>{a.favorite && <Icon name="star" size={14} color={colors.orange}/>}</View><Text style={[styles.nextMeta, overdue && {color: colors.error}]}>{overdue ? 'Atrasada' : a.date} · {a.time ?? 'Sem horário'}{a.priority ? ' · Prioritária' : ''}</Text></View>
            <Text style={[styles.nextValue, {color:a.plannedType==='ENTRADA'?colors.success:colors.navy}]}>{a.plannedValue !== undefined ? money(a.plannedValue) : '—'}</Text>
          </Pressable>;
        }) : <View style={styles.empty}><Text style={styles.emptyTitle}>Tudo em dia por aqui</Text><Text style={styles.emptyText}>Adicione uma atividade para organizar seu planejamento.</Text></View>}
      </View>
    </ScrollView><BottomNav/>
  </SafeAreaView>;
}

function Mini({icon,title,value,tone}:{icon:any;title:string;value:string;tone:'entry'|'exit'}) {
  const c = tone === 'entry' ? colors.success : colors.error;
  return <Card style={styles.mini}><View style={[styles.miniIcon,{backgroundColor:tone==='entry'?colors.successSoft:colors.errorSoft}]}><Icon name={icon} size={18} color={c}/></View><View style={{flex:1}}><Text style={styles.miniLabel}>{title}</Text><Text style={styles.miniValue}>{value}</Text></View></Card>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.white},content:{width:'100%',maxWidth:820,alignSelf:'center',padding:20,paddingBottom:24},loadState:{flex:1,alignItems:'center',justifyContent:'center',gap:12,padding:24},loadText:{...typography.body2,color:colors.gray700},loadError:{...typography.body2,color:colors.error,textAlign:'center',maxWidth:420},month:{flexDirection:'row',alignItems:'center',gap:3},monthText:{...typography.caption,color:colors.navy,fontFamily:'Inter-SemiBold'},greet:{...typography.h1,color:colors.navy,marginTop:11},subtitle:{...typography.body2,color:colors.gray700,marginTop:1,marginBottom:14},overview:{padding:12,flexDirection:'row',alignItems:'center',minHeight:130},donutWrap:{width:122,alignItems:'center'},overviewMetrics:{flex:1,gap:1},label:{...typography.caption,color:colors.gray700},big:{...typography.body1,color:colors.navy,fontFamily:'Inter-SemiBold',fontSize:18,marginBottom:7},chevron:{marginLeft:2},miniRow:{flexDirection:'row',gap:8,marginTop:8},mini:{flex:1,padding:10,flexDirection:'row',alignItems:'center',gap:7,minHeight:58},miniIcon:{width:30,height:30,borderRadius:15,alignItems:'center',justifyContent:'center'},miniLabel:{...typography.caption,color:colors.gray700,fontSize:10},miniValue:{...typography.body2Medium,color:colors.navy,marginTop:1},projection:{marginTop:8,backgroundColor:colors.navy,borderRadius:8,padding:14},projTop:{flexDirection:'row',justifyContent:'space-between',gap:12,marginBottom:15},projMetric:{flex:1},projLabel:{...typography.caption,color:'#D8E0EA'},projValue:{...typography.body1,color:colors.white,fontFamily:'Inter-SemiBold',fontSize:17,marginTop:2},projContext:{...typography.caption,color:colors.white,lineHeight:17,marginTop:8},activityBox:{borderWidth:1,borderColor:colors.gray200,borderRadius:8,overflow:'hidden'},next:{minHeight:58,borderBottomWidth:1,borderBottomColor:colors.gray200,flexDirection:'row',alignItems:'center',paddingHorizontal:10,gap:8},nextIcon:{width:30,height:30,borderRadius:15,backgroundColor:colors.gray100,alignItems:'center',justifyContent:'center'},priorityIcon:{backgroundColor:colors.blueSoft,borderWidth:1,borderColor:colors.blue},nextInfo:{flex:1,minWidth:0},titleLine:{flexDirection:'row',alignItems:'center',gap:5},nextTitle:{...typography.body2Medium,color:colors.navy,flexShrink:1},nextMeta:{...typography.caption,color:colors.gray500,marginTop:1},nextValue:{...typography.body2Medium},empty:{padding:18,alignItems:'center'},emptyTitle:{...typography.body2Medium,color:colors.navy},emptyText:{...typography.caption,color:colors.gray500,textAlign:'center',marginTop:4}});
