import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppDialog } from '@/components/feedback/AppDialog';
import { Button } from '@/components/ui/Button';
import { Icon, ActivityIcon } from '@/components/ui/Icon';
import { useApp } from '@/context';
import { colors, typography } from '@/theme';
import { money } from '@/utils/format';

type TrashAction = 'restore' | 'delete' | null;

export default function Trash() {
  const router = useRouter();
  const { trash, refreshTrash, trashLoading, trashError, restoreActivity, deletePermanently } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<TrashAction>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [operationError, setOperationError] = useState('');
  const item = trash.find(activity => activity.id === selectedId);

  useEffect(() => { void refreshTrash(); }, []);

  async function confirmAction() {
    if (!selectedId || !action) return;
    const id = selectedId;
    const selectedAction = action;
    setSelectedId(null);
    setAction(null);
    setOperationError('');
    setBusyId(id);
    try {
      if (selectedAction === 'restore') await restoreActivity(id);
      else await deletePermanently(id);
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Não foi possível concluir a operação.');
    } finally { setBusyId(null); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar"><Icon name="arrow-left" size={24} /></Pressable>
        <Text style={styles.title}>Lixeira</Text>
        <Text style={styles.sub}>Restaure uma atividade ou exclua-a definitivamente.</Text>
        {operationError ? <Text style={styles.error}>{operationError}</Text> : null}
        {trashLoading ? <View style={styles.state}><ActivityIndicator color={colors.blue} /><Text style={styles.stateText}>Carregando lixeira...</Text></View> : null}
        {!trashLoading && trashError ? <View style={styles.state}><Text style={styles.error}>{trashError}</Text><Button title="Tentar novamente" variant="secondary" size="small" onPress={() => void refreshTrash()} /></View> : null}
        {!trashLoading && !trashError && trash.length === 0 ? <View style={styles.empty}><Icon name="delete" size={28} color={colors.gray400} /><Text style={styles.emptyTitle}>A lixeira está vazia</Text><Text style={styles.stateText}>Atividades excluídas aparecerão aqui por até 30 dias.</Text></View> : null}

        {!trashLoading && !trashError && <View style={styles.list}>{trash.map(activity => (
          <View key={activity.id} style={styles.card}>
            <View style={styles.iconBox}><ActivityIcon icon={activity.icon} size={20} /></View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{activity.title}</Text>
              <Text style={styles.meta}>{activity.date ?? 'Sem data'} · {activity.time ?? 'Sem horário'}</Text>
              <Text style={styles.deleted}>Excluída recentemente</Text>
              <View style={styles.actions}>
                <Pressable disabled={busyId === activity.id} onPress={() => { setSelectedId(activity.id); setAction('restore'); }} style={styles.restore} accessibilityRole="button"><Icon name="restore" size={15} color={colors.blue} /><Text style={styles.restoreText}>Restaurar</Text></Pressable>
                <Pressable disabled={busyId === activity.id} onPress={() => { setSelectedId(activity.id); setAction('delete'); }} style={styles.remove} accessibilityRole="button"><Text style={styles.removeText}>Excluir</Text></Pressable>
                {busyId === activity.id ? <ActivityIndicator size="small" color={colors.blue} /> : null}
              </View>
            </View>
            <Text style={styles.value}>{activity.plannedValue !== undefined ? money(activity.plannedValue) : '—'}</Text>
          </View>
        ))}</View>}

        <View style={styles.banner}><Icon name="information" size={20} color={colors.blue} /><Text style={styles.bannerText}>Atividades na lixeira são removidas automaticamente após 30 dias. A exclusão definitiva não pode ser desfeita.</Text></View>
      </ScrollView>
      <AppDialog visible={!!item && !!action} title={action === 'restore' ? 'Restaurar atividade?' : 'Excluir definitivamente?'} description={action === 'restore' ? `“${item?.title ?? ''}” voltará para suas atividades.` : `“${item?.title ?? ''}” será apagada sem possibilidade de recuperação.`} onCancel={() => { setSelectedId(null); setAction(null); }} confirmLabel={action === 'restore' ? 'Restaurar' : 'Excluir'} tone={action === 'restore' ? 'info' : 'danger'} onConfirm={() => void confirmAction()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, paddingBottom: 36 },
  back: { width: 40, height: 42, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.navy, marginTop: 5 },
  sub: { ...typography.body2, color: colors.gray700, marginTop: 3, marginBottom: 16 },
  list: { gap: 8 },
  card: { minHeight: 94, borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  name: { ...typography.body2Medium, color: colors.navy },
  meta: { ...typography.caption, color: colors.gray700, marginTop: 2 },
  deleted: { ...typography.caption, color: colors.gray500, marginTop: 2 },
  value: { ...typography.body2Medium, color: colors.navy },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  restore: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3 },
  restoreText: { ...typography.caption, color: colors.blue, fontFamily: 'Inter-SemiBold' },
  remove: { paddingVertical: 3 },
  removeText: { ...typography.caption, color: colors.error, fontFamily: 'Inter-SemiBold' },
  state: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateText: { ...typography.caption, color: colors.gray500, textAlign: 'center', lineHeight: 18 },
  empty: { minHeight: 190, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gray200, borderRadius: 12, padding: 22, gap: 7 },
  emptyTitle: { ...typography.body2Medium, color: colors.navy },
  banner: { marginTop: 16, borderRadius: 10, backgroundColor: colors.infoSoft, padding: 14, flexDirection: 'row', gap: 9 },
  bannerText: { ...typography.caption, color: colors.gray700, flex: 1, lineHeight: 18 },
  error: { ...typography.caption, color: colors.error, marginBottom: 8 },
});
