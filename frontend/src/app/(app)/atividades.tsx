import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { BottomNav } from '@/components/ui/BottomNav';
import { Icon } from '@/components/ui/Icon';
import { ActivityRow } from '@/components/activity/ActivityRow';
import { FilterSheet, Filters } from '@/components/feedback/FilterSheet';
import { ActivityActionSheet } from '@/components/feedback/ActivityActionSheet';
import { AppDialog } from '@/components/feedback/AppDialog';
import { useApp } from '@/context';
import { parseBRDate, monthKey, todayBR } from '@/utils/date';

const toDate = (s?: string) => parseBRDate(s)?.getTime();

export default function Activities() {
  const router = useRouter();
  const { activities, completeActivity, deleteActivity, toggleFavorite, togglePriority, duplicateActivity, reopenActivity, cancelActivity } = useApp();
  const [tab, setTab] = useState<'PENDENTE'|'CONCLUIDA'|'CANCELADA'>('PENDENTE');
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ period:'Todos os períodos', type:'Todas', priority:'Todas', status:'Todas' });
  const [completeId, setCompleteId] = useState<string|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [cancelId, setCancelId] = useState<string|null>(null);
  const [menuId, setMenuId] = useState<string|null>(null);

  const list = useMemo(() => {
    const nowDate = new Date(); nowDate.setHours(0, 0, 0, 0);
    const now = nowDate.getTime();
    const baseStatus = filters.status !== 'Todas'
      ? ({Pendentes:'PENDENTE',Concluídas:'CONCLUIDA',Canceladas:'CANCELADA'} as any)[filters.status] ?? tab
      : tab;
    let result = activities.filter(a => a.status === baseStatus);
    result = result.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
    if (filters.type !== 'Todas') result = result.filter(a => a.plannedType === (filters.type === 'Entrada' ? 'ENTRADA' : 'SAIDA'));
    if (filters.priority !== 'Todas') result = result.filter(a => filters.priority === 'Prioritárias' ? a.priority : !a.priority);
    if (filters.period === 'Este mês') { const currentKey = monthKey(todayBR()); result = result.filter(a => !!a.date && monthKey(a.date) === currentKey); }
    if (filters.period === 'Próximos 7 dias') result = result.filter(a => { const d=toDate(a.date); return d !== undefined && d>=now && d<=now+7*86400000; });
    if (filters.period === 'Esta semana') result = result.filter(a => { const d=toDate(a.date); return d !== undefined && d>=now && d<=now+6*86400000; });
    if (filters.period === 'Período personalizado') { const from=toDate(filters.from); const to=toDate(filters.to); result=result.filter(a=>{ const d=toDate(a.date); return d !== undefined && (!from||d>=from)&&(!to||d<=to); }); }
    return result;
  }, [activities, tab, query, filters]);

  const today = todayBR();
  const groups: Record<string, typeof list> = tab === 'PENDENTE' ? {
    Atrasadas: list.filter(a => { const d=toDate(a.date); return d !== undefined && d < toDate(today)!; }),
    Hoje: list.filter(a => a.date === today),
    Próximas: list.filter(a => { const d=toDate(a.date); return d !== undefined && d > toDate(today)!; }),
    'Sem data': list.filter(a => !a.date),
  } : tab === 'CONCLUIDA' ? { 'Concluídas': list.slice().sort((a,b)=>(toDate(b.completedAt)??0)-(toDate(a.completedAt)??0)) } : { 'Canceladas': list.slice().sort((a,b)=>(toDate(b.canceledAt)??0)-(toDate(a.canceledAt)??0)) };

  const menuItem = activities.find(a=>a.id===menuId);
  const completeItem = activities.find(a=>a.id===completeId);
  const deleteItem = activities.find(a=>a.id===deleteId);
  const cancelItem = activities.find(a=>a.id===cancelId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Atividades</Text>
        <View style={styles.searchRow}>
          <View style={styles.search}><Icon name="search" size={18} color={colors.gray500}/><TextInput value={query} onChangeText={setQuery} placeholder="Buscar atividades..." placeholderTextColor={colors.gray500} style={styles.searchInput}/>{query&&<Pressable onPress={()=>setQuery('')}><Icon name="close" size={17} color={colors.gray500}/></Pressable>}</View>
          <Pressable style={styles.filterBtn} onPress={()=>setFilterOpen(true)}><Icon name="filter" size={20}/></Pressable>
        </View>
        <View style={styles.tabs}>{(['PENDENTE','CONCLUIDA','CANCELADA'] as const).map(t=><Pressable key={t} onPress={()=>setTab(t)} style={styles.tab}><Text style={[styles.tabText,tab===t&&styles.tabActive]}>{t==='PENDENTE'?'Pendentes':t==='CONCLUIDA'?'Concluídas':'Canceladas'}</Text>{tab===t&&<View style={styles.underline}/>}</Pressable>)}</View>
        {Object.entries(groups).map(([label,items]) => items.length>0 && <View key={label} style={styles.group}><View style={styles.groupHead}><Text style={styles.groupTitle}>{label}</Text><Text style={styles.count}>{items.length}</Text></View>{items.map(a=><ActivityRow key={a.id} item={a} onPress={()=>router.push(`/atividade/${a.id}` as any)} onQuickComplete={()=>a.status==='PENDENTE'&&setCompleteId(a.id)} onDelete={()=>setDeleteId(a.id)} onMenu={()=>setMenuId(a.id)}/>)}</View>)}
        {list.length===0 && <View style={styles.empty}><Icon name="calendar" size={42} color={colors.blue}/><Text style={styles.emptyTitle}>Nenhuma atividade encontrada</Text><Text style={styles.emptyText}>Tente outra busca, ajuste os filtros ou crie uma nova atividade.</Text><Pressable style={styles.emptyBtn} onPress={()=>router.push('/atividade/nova' as any)}><Text style={styles.emptyBtnText}>Criar atividade</Text></Pressable></View>}
      </ScrollView>
      <Pressable style={styles.fab} onPress={()=>router.push('/atividade/nova' as any)}><Icon name="plus" size={24} color={colors.white}/></Pressable>
      <BottomNav/>
      <FilterSheet visible={filterOpen} onClose={()=>setFilterOpen(false)} initial={filters} onApply={f=>{setFilters(f);if(f.status!=='Todas'){setTab((({Pendentes:'PENDENTE',Concluídas:'CONCLUIDA',Canceladas:'CANCELADA'} as any)[f.status])??tab)}setFilterOpen(false)}}/>
      <ActivityActionSheet visible={!!menuItem} activity={menuItem} onClose={()=>setMenuId(null)} onFavorite={()=>{if(menuItem)toggleFavorite(menuItem.id);setMenuId(null)}} onTogglePriority={()=>{if(menuItem)togglePriority(menuItem.id);setMenuId(null)}} onDuplicate={async()=>{if(menuItem){const n=await duplicateActivity(menuItem.id);setMenuId(null);if(n)router.push(`/atividade/${n.id}` as any)}}} onEdit={()=>{if(menuItem)router.push(`/atividade/editar?id=${menuItem.id}` as any);setMenuId(null)}} onDelete={()=>{setDeleteId(menuItem?.id??null);setMenuId(null)}} onCancel={()=>{setCancelId(menuItem?.id??null);setMenuId(null)}} onReopen={menuItem?.status==='CANCELADA'?()=>{if(menuItem)reopenActivity(menuItem.id);setMenuId(null)}:undefined}/>
      <AppDialog visible={!!completeItem} title="Concluir atividade?" description="A atividade será marcada como realizada e seguirá para o histórico do mês." confirmLabel="Concluir" tone="info" onCancel={()=>setCompleteId(null)} onConfirm={()=>{if(completeItem) completeActivity(completeItem.id); setCompleteId(null)}}/>
      <AppDialog visible={!!cancelItem} title="Cancelar atividade?" description="A atividade continuará registrada como cancelada e poderá ser reaberta depois." confirmLabel="Cancelar atividade" tone="info" onCancel={()=>setCancelId(null)} onConfirm={()=>{if(cancelItem)cancelActivity(cancelItem.id);setCancelId(null) }}/>
      <AppDialog visible={!!deleteItem} title="Mover para a lixeira?" description="A atividade ficará fora das listas e poderá ser restaurada dentro do prazo de retenção." onCancel={()=>setDeleteId(null)} confirmLabel="Mover para a lixeira" onConfirm={()=>{if(deleteItem) deleteActivity(deleteItem.id); setDeleteId(null)}}/>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.white},content:{padding:20,paddingBottom:110},title:{...typography.h1,color:colors.navy,marginBottom:15},searchRow:{flexDirection:'row',gap:8},search:{height:44,borderRadius:8,backgroundColor:colors.gray100,flex:1,flexDirection:'row',alignItems:'center',paddingHorizontal:12,gap:8},searchInput:{flex:1,...typography.body2,color:colors.gray900,paddingVertical:0},filterBtn:{width:44,height:44,borderRadius:8,borderWidth:1,borderColor:colors.gray200,alignItems:'center',justifyContent:'center'},tabs:{flexDirection:'row',marginTop:13,borderBottomWidth:1,borderBottomColor:colors.gray200},tab:{flex:1,alignItems:'center',paddingVertical:12,position:'relative'},tabText:{...typography.body2Medium,color:colors.gray500},tabActive:{color:colors.navy},underline:{position:'absolute',left:12,right:12,bottom:-1,height:2,backgroundColor:colors.orange},group:{marginTop:16},groupHead:{flexDirection:'row',alignItems:'center',gap:6,marginBottom:7},groupTitle:{...typography.label,color:colors.navy},count:{...typography.caption,color:colors.white,backgroundColor:colors.orange,borderRadius:10,paddingHorizontal:6,paddingVertical:2},empty:{alignItems:'center',paddingTop:80,paddingHorizontal:35},emptyTitle:{...typography.h2,color:colors.navy,marginTop:14,fontSize:18},emptyText:{...typography.body2,color:colors.gray700,textAlign:'center',marginTop:5},emptyBtn:{marginTop:16,borderWidth:1,borderColor:colors.blue,borderRadius:8,paddingHorizontal:16,paddingVertical:10},emptyBtnText:{...typography.label,color:colors.blue},fab:{position:'absolute',right:22,bottom:82,width:54,height:54,borderRadius:27,backgroundColor:colors.orange,alignItems:'center',justifyContent:'center',zIndex:3}});
