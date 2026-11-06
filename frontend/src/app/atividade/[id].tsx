import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { Icon, ActivityIcon } from '@/components/ui/Icon';
import { StatusChip } from '@/components/ui/StatusChip';
import { Button } from '@/components/ui/Button';
import { AppDialog } from '@/components/feedback/AppDialog';
import { ActivityActionSheet } from '@/components/feedback/ActivityActionSheet';
import { useApp } from '@/context';
import { money } from '@/utils/format';

export default function ActivityDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activities, deleteActivity, cancelActivity, toggleFavorite, togglePriority, reopenActivity, duplicateActivity } = useApp();
  const a = activities.find(x => x.id === id);
  const [dialog,setDialog]=useState<'delete'|'cancel'|null>(null);
  const [menu,setMenu]=useState(false);
  if (!a) return <SafeAreaView style={styles.safe}><Text style={styles.missing}>Atividade não encontrada.</Text></SafeAreaView>;
  const pending=a.status==='PENDENTE';
  const done=a.status==='CONCLUIDA';
  const statusLabel = pending ? 'PENDENTE' : done ? 'CONCLUÍDA' : 'CANCELADA';
  const statusTone = done ? 'success' : a.status==='CANCELADA' ? 'error' : 'neutral';
  const shownValue = done ? a.realizedValue : a.plannedValue;
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.top}>
        <Pressable onPress={()=>router.back()} hitSlop={8}><Icon name="arrow-left" size={24}/></Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={()=>toggleFavorite(a.id)} hitSlop={8}><Icon name={a.favorite?'star-filled':'star'} size={23} color={a.favorite?colors.orange:colors.navy}/></Pressable>
          <Pressable onPress={()=>setMenu(true)} hitSlop={8}><Icon name="dots" size={22}/></Pressable>
        </View>
      </View>
      <View style={styles.head}>
        <View style={styles.headRow}><ActivityIcon icon={a.icon} size={22}/><Text style={styles.title}>{a.title}</Text></View>
        <View style={styles.statusRow}><StatusChip label={statusLabel} tone={statusTone}/><Text style={styles.created}>• Criada em {a.date ?? 'Sem data'}</Text></View>
      </View>
      <View style={styles.infoCard}>
        <Info icon="calendar" label="Data" value={a.date??'Sem data'}/><Info icon="clock" label="Horário" value={a.time??'Sem horário'}/><Info icon="cash" label="Valor" value={shownValue!==undefined?money(shownValue):'Sem valor'}/>
      </View>
      {a.description && <View style={styles.section}><Text style={styles.sectionTitle}>Descrição</Text><Text style={styles.body}>{a.description}</Text></View>}
      {a.observation && <View style={styles.section}><Text style={styles.sectionTitle}>Observações</Text><Text style={styles.body}>{a.observation}</Text></View>}
      {pending && <View style={styles.actions}><Button title="Concluir" variant="dark" size="large" onPress={()=>router.push(`/atividade/concluir?id=${a.id}` as any)}/><Button title="Editar" variant="secondary" size="medium" icon="edit" onPress={()=>router.push(`/atividade/editar?id=${a.id}` as any)}/></View>}
      {done && <View style={styles.actions}><Button title="Reabrir atividade" variant="secondary" size="medium" icon="undo" onPress={()=>reopenActivity(a.id)}/><Button title="Mover para a lixeira" variant="dangerOutline" size="medium" icon="delete" onPress={()=>setDialog('delete')} style={styles.deleteBtn}/></View>}
      {a.status==='CANCELADA' && <View style={styles.actions}><Button title="Reabrir atividade" variant="secondary" size="medium" icon="undo" onPress={()=>reopenActivity(a.id)}/><Button title="Mover para a lixeira" variant="dangerOutline" size="medium" icon="delete" onPress={()=>setDialog('delete')} style={styles.deleteBtn}/></View>}
    </ScrollView>
    <ActivityActionSheet visible={menu} activity={a} onClose={()=>setMenu(false)} onFavorite={()=>{toggleFavorite(a.id);setMenu(false)}} onTogglePriority={()=>{togglePriority(a.id);setMenu(false)}} onDuplicate={async()=>{const n=await duplicateActivity(a.id);setMenu(false);if(n)router.replace(`/atividade/${n.id}` as any)}} onEdit={()=>{setMenu(false);router.push(`/atividade/editar?id=${a.id}` as any)}} onDelete={()=>{setMenu(false);setDialog('delete')}} onCancel={()=>{setMenu(false);setDialog('cancel')}} onReopen={()=>{reopenActivity(a.id);setMenu(false)}}/>
    <AppDialog visible={dialog==='cancel'} title="Cancelar atividade?" description="A atividade ficará como cancelada. Você poderá reabri-la depois." confirmLabel="Cancelar atividade" tone="info" onCancel={()=>setDialog(null)} onConfirm={()=>{cancelActivity(a.id);setDialog(null)}}/>
    <AppDialog visible={dialog==='delete'} title="Mover para a lixeira?" description="A atividade será removida das listas e poderá ser restaurada dentro do prazo de retenção." onCancel={()=>setDialog(null)} confirmLabel="Mover para a lixeira" onConfirm={()=>{deleteActivity(a.id);setDialog(null);router.replace('/atividades' as any)}}/>
  </SafeAreaView>
}
function Info({icon,label,value}:{icon:any;label:string;value:string}){return <View style={styles.info}><Icon name={icon} size={20}/><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.white},page:{width:'100%',maxWidth:720,alignSelf:'center',padding:20,paddingBottom:35},top:{height:42,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},topActions:{flexDirection:'row',gap:18},head:{marginTop:10},headRow:{flexDirection:'row',alignItems:'center',gap:9},title:{...typography.h1,color:colors.navy,flex:1},statusRow:{flexDirection:'row',alignItems:'center',gap:6,marginTop:8},created:{...typography.caption,color:colors.gray500},infoCard:{borderWidth:1,borderColor:colors.gray200,borderRadius:8,paddingHorizontal:12,marginTop:18},info:{height:48,borderBottomWidth:1,borderBottomColor:colors.gray200,flexDirection:'row',alignItems:'center',gap:10},infoLabel:{...typography.body2,color:colors.navy,flex:1},infoValue:{...typography.body2Medium,color:colors.navy},section:{marginTop:20},sectionTitle:{...typography.label,color:colors.navy,marginBottom:5},body:{...typography.body2,color:colors.gray700,lineHeight:21},actions:{marginTop:26,gap:9},rowBtns:{flexDirection:'row',gap:8},flex:{flex:1},deleteBtn:{borderColor:colors.error},missing:{padding:24,color:colors.gray700}});
