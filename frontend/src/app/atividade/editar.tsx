import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIcon, Icon, IconName } from '@/components/ui/Icon';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context';
import { ActivityIconName } from '@/types/domain';
import { colors, typography } from '@/theme';
import { parseBRDate, todayBR } from '@/utils/date';
import { parseMoney } from '@/utils/format';

const options: { key: ActivityIconName; label: string; icon: IconName }[] = [
  { key: 'market', label: 'Mercado', icon: 'market' }, { key: 'study', label: 'Faculdade', icon: 'study' },
  { key: 'work', label: 'Trabalho', icon: 'work' }, { key: 'health', label: 'Saúde', icon: 'health' },
  { key: 'home', label: 'Casa', icon: 'house' }, { key: 'payment', label: 'Pagamento', icon: 'payment' },
  { key: 'leisure', label: 'Lazer', icon: 'leisure' }, { key: 'other', label: 'Outros', icon: 'other' },
];

export default function EditActivity() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities, updateActivity, appDataLoading } = useApp();
  const activity = activities.find(item => item.id === id);
  const [title, setTitle] = useState(activity?.title ?? '');
  const [date, setDate] = useState(activity?.date ?? todayBR());
  const [time, setTime] = useState(activity?.time ?? '');
  const [value, setValue] = useState(activity?.plannedValue !== undefined ? String(activity.plannedValue).replace('.', ',') : '');
  const [type, setType] = useState<'ENTRADA' | 'SAIDA'>(activity?.plannedType ?? 'SAIDA');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [observation, setObservation] = useState(activity?.observation ?? '');
  const [icon, setIcon] = useState<ActivityIconName>(activity?.icon ?? 'other');
  const [iconModal, setIconModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activity) return;
    setTitle(activity.title); setDate(activity.date ?? todayBR()); setTime(activity.time ?? '');
    setValue(activity.plannedValue !== undefined ? String(activity.plannedValue).replace('.', ',') : '');
    setType(activity.plannedType ?? 'SAIDA'); setDescription(activity.description ?? '');
    setObservation(activity.observation ?? ''); setIcon(activity.icon);
  }, [activity?.id]);

  async function save() {
    if (!activity || saving || !title.trim()) return;
    if (!parseBRDate(date)) { setError('Informe uma data válida no formato DD/MM/AAAA.'); return; }
    const amount = parseMoney(value);
    if (value.trim() && (amount === null || amount <= 0)) { setError('Informe um valor maior que zero ou deixe o campo vazio.'); return; }
    if (time.trim() && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time.trim())) { setError('Informe o horário no formato HH:MM.'); return; }
    setSaving(true); setError('');
    try {
      await updateActivity(activity.id, {
        title: title.trim(), date, time: time.trim() || undefined,
        plannedValue: amount ?? undefined, plannedType: amount !== null ? type : undefined,
        description: description.trim() || undefined, observation: observation.trim() || undefined, icon,
      });
      router.replace(`/atividade/${activity.id}` as any);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar as alterações.');
    } finally { setSaving(false); }
  }

  if (!activity) return <SafeAreaView style={styles.safe}><Text style={styles.error}>{appDataLoading ? 'Carregando atividade...' : 'Atividade não encontrada.'}</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}><Pressable onPress={() => router.back()} disabled={saving}><Text style={styles.cancel}>Cancelar</Text></Pressable><Pressable disabled={saving || !title.trim()} onPress={() => void save()}><Text style={[styles.save, { opacity: saving || !title.trim() ? 0.45 : 1 }]}>{saving ? 'Salvando...' : 'Salvar'}</Text></Pressable></View>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><Text style={styles.title}>Editar atividade</Text><Text style={styles.sub}>Atualize as informações da sua atividade.</Text>{error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.form}>
          <View style={styles.titleWrap}><View style={{ flex: 1 }}><Field label="Título da atividade" value={title} onChangeText={setTitle} maxLength={120} /></View><Pressable style={styles.iconButton} onPress={() => setIconModal(true)} accessibilityRole="button" accessibilityLabel="Escolher ícone"><ActivityIcon icon={icon} size={19} /></Pressable></View>
          <Field label="Data" value={date} onChangeText={setDate} rightIcon="calendar" />
          <Field label="Horário (opcional)" value={time} onChangeText={setTime} rightIcon="clock" />
          <Field label="Valor (opcional)" value={value} onChangeText={setValue} prefix="R$" keyboardType="decimal-pad" helper="Deixe em branco se não houver valor." />
          {value.trim() ? <View style={styles.typeField}><Text style={styles.label}>Tipo do valor</Text><View style={styles.typeRow}><Pressable onPress={() => setType('ENTRADA')} style={[styles.typeBtn, type === 'ENTRADA' && styles.entryOn]}><Icon name="arrow-up" size={17} color={type === 'ENTRADA' ? colors.success : colors.gray500} /><Text style={styles.typeText}>Entrada</Text></Pressable><Pressable onPress={() => setType('SAIDA')} style={[styles.typeBtn, type === 'SAIDA' && styles.exitOn]}><Icon name="arrow-down" size={17} color={type === 'SAIDA' ? colors.error : colors.gray500} /><Text style={styles.typeText}>Saída</Text></Pressable></View></View> : null}
          <Field label="Descrição (opcional)" value={description} onChangeText={setDescription} maxLength={1000} />
          <Field label="Observações (opcional)" value={observation} onChangeText={setObservation} multiline maxLength={200} />
        </View>
        <Button title={saving ? 'Salvando...' : 'Salvar alterações'} size="large" onPress={() => void save()} disabled={saving || !title.trim()} style={styles.submit} />
      </ScrollView>
      <Modal transparent visible={iconModal} animationType="slide" onRequestClose={() => setIconModal(false)}><View style={styles.modalOverlay}><View style={styles.modal}><View style={styles.modalHead}><Text style={styles.modalTitle}>Selecionar ícone</Text><Pressable onPress={() => setIconModal(false)}><Icon name="close" size={21} /></Pressable></View><View style={styles.grid}>{options.map(option => <Pressable key={option.key} style={[styles.option, icon === option.key && styles.selected]} onPress={() => { setIcon(option.key); setIconModal(false); }}><View style={styles.optionCircle}><Icon name={option.icon} size={24} /></View><Text style={styles.optionText}>{option.label}</Text></Pressable>)}</View></View></View></Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white }, top: { height: 52, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancel: { ...typography.body2, color: colors.navy }, save: { ...typography.label, color: colors.blue }, page: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, paddingTop: 6, paddingBottom: 30 },
  title: { ...typography.h1, color: colors.navy }, sub: { ...typography.body2, color: colors.gray700, marginTop: 3, marginBottom: 20 }, error: { ...typography.caption, color: colors.error, padding: 20, textAlign: 'center' },
  form: { gap: 15 }, titleWrap: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' }, iconButton: { width: 48, height: 48, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.label, color: colors.navy }, typeField: { gap: 7 }, typeRow: { flexDirection: 'row', gap: 8 }, typeBtn: { flex: 1, height: 48, borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  entryOn: { backgroundColor: colors.successSoft, borderColor: '#86D6AA' }, exitOn: { backgroundColor: colors.errorSoft, borderColor: '#F5AAAA' }, typeText: { ...typography.label, color: colors.navy }, submit: { marginTop: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(5,14,29,0.42)', justifyContent: 'flex-end' }, modal: { backgroundColor: colors.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, paddingBottom: 26, width: '100%', maxWidth: 620, alignSelf: 'center' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, modalTitle: { ...typography.h2, color: colors.navy, fontSize: 18 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }, option: { width: '23%', alignItems: 'center', paddingVertical: 9, borderRadius: 8 }, selected: { backgroundColor: colors.infoSoft }, optionCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' }, optionText: { ...typography.caption, color: colors.navy, marginTop: 6 },
});
