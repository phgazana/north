import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context';
import { money } from '@/utils/format';
import { todayBR } from '@/utils/date';

export default function Complete() {
  const router=useRouter(); const {id}=useLocalSearchParams(); const {activities,completeActivity}=useApp(); const a=activities.find(x=>x.id===id);
  const [realized,setRealized]=useState(a?.plannedValue?.toFixed(2).replace('.',',')??''); const [date,setDate]=useState(todayBR()); const [obs,setObs]=useState(a?.observation??''); const [type,setType]=useState<'ENTRADA'|'SAIDA'>(a?.plannedType??'SAIDA');
  if(!a) return null;
  const finish=()=>{ completeActivity(a.id,{realizedValue:realized.trim()?Number(realized.replace(',','.')):undefined,completedAt:date,realizedType:realized.trim()?type:undefined,observation:obs.trim()||undefined}); router.replace(`/atividade/${a.id}` as any); };
  return <SafeAreaView style={styles.safe}>
    <View style={styles.top}><Pressable onPress={()=>router.back()}><Text style={styles.cancel}>Cancelar</Text></Pressable><Pressable onPress={finish}><Text style={styles.save}>Concluir</Text></Pressable></View>
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Concluir atividade</Text><Text style={styles.sub}>Confirme as informações e registre o resultado.</Text>
      <View style={styles.notice}><Icon name="check-circle" size={20} color={colors.success}/><Text style={styles.noticeText}>Ao concluir esta atividade será marcada como realizada e passará para o histórico do mês.</Text></View>
      <View style={styles.activityCard}><View style={styles.checkBox}/><View style={{flex:1}}><Text style={styles.aTitle}>{a.title}</Text><Text style={styles.meta}>{a.date??'Sem data'} • {a.time??'Sem horário'}</Text><Text style={styles.meta}>Valor previsto: <Text style={styles.strong}>{a.plannedValue!==undefined?money(a.plannedValue):'Sem valor'}</Text></Text></View></View>
      <Field label="Valor realizado" value={realized} onChangeText={setRealized} prefix="R$" keyboardType="decimal-pad" helper="Deixe em branco se não houver valor."/>
      {realized.trim().length>0 && <View style={styles.typeWrap}><Text style={styles.label}>Tipo do valor</Text><View style={styles.typeRow}><Pressable style={[styles.typeBtn,type==='ENTRADA'&&styles.entryOn]} onPress={()=>setType('ENTRADA')}><Icon name="arrow-up" size={17} color={type==='ENTRADA'?colors.success:colors.gray500}/><Text style={[styles.typeText,type==='ENTRADA'&&{color:colors.success}]}>Entrada</Text></Pressable><Pressable style={[styles.typeBtn,type==='SAIDA'&&styles.exitOn]} onPress={()=>setType('SAIDA')}><Icon name="arrow-down" size={17} color={type==='SAIDA'?colors.error:colors.gray500}/><Text style={[styles.typeText,type==='SAIDA'&&{color:colors.error}]}>Saída</Text></Pressable></View></View>}
      <Field label="Data de realização" value={date} onChangeText={setDate} rightIcon="calendar"/>
      <Field label="Observações (opcional)" placeholder="Pagamento realizado pelo aplicativo." value={obs} onChangeText={setObs} multiline maxLength={200}/>
      <Button title="Concluir atividade" variant="dark" size="large" onPress={finish} style={styles.bottom}/>
    </ScrollView>
  </SafeAreaView>
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.white},top:{height:52,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},cancel:{...typography.body2,color:colors.navy},save:{...typography.label,color:colors.orange},page:{padding:20,paddingTop:6,paddingBottom:30},title:{...typography.h1,color:colors.navy},sub:{...typography.body2,color:colors.gray700,marginTop:3,marginBottom:17},notice:{backgroundColor:colors.successSoft,borderRadius:8,padding:12,flexDirection:'row',gap:9,alignItems:'center'},noticeText:{...typography.caption,color:colors.gray700,flex:1,lineHeight:17},activityCard:{borderWidth:1,borderColor:colors.gray200,borderRadius:8,padding:13,flexDirection:'row',gap:10,marginVertical:15},checkBox:{width:21,height:21,borderWidth:1.5,borderColor:colors.navy,borderRadius:5},aTitle:{...typography.body2Medium,color:colors.navy},meta:{...typography.caption,color:colors.gray500,marginTop:2},strong:{fontFamily:'Inter-SemiBold',color:colors.navy},typeWrap:{gap:7,marginBottom:15},label:{...typography.label,color:colors.navy},typeRow:{flexDirection:'row',gap:8},typeBtn:{flex:1,height:48,borderWidth:1,borderColor:colors.gray200,borderRadius:8,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},entryOn:{backgroundColor:colors.successSoft,borderColor:'#86D6AA'},exitOn:{backgroundColor:colors.errorSoft,borderColor:'#F5AAAA'},typeText:{...typography.label,color:colors.gray500},bottom:{marginTop:8}});
