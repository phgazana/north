import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Activity } from '@/types/domain';
import { colors, radius, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';

export function ActivityActionSheet({ visible, activity, onClose, onFavorite, onDuplicate, onEdit, onDelete, onCancel, onReopen, onTogglePriority }: {
  visible: boolean; activity?: Activity; onClose: () => void; onFavorite: () => void; onDuplicate: () => void; onEdit: () => void; onDelete: () => void; onCancel?: () => void; onReopen?: () => void; onTogglePriority?: () => void;
}) {
  if (!activity) return null;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{activity.title}</Text>
          <Pressable style={styles.row} onPress={onFavorite}><Icon name={activity.favorite ? 'star-filled' : 'star'} size={21} color={activity.favorite ? colors.orange : colors.navy}/><Text style={styles.rowText}>{activity.favorite ? 'Remover dos favoritos' : 'Favoritar atividade'}</Text></Pressable>
          {activity.status === 'PENDENTE' && onTogglePriority && <Pressable style={styles.row} onPress={onTogglePriority}><Icon name="flag" size={21} color={activity.priority ? colors.blue : colors.navy}/><Text style={styles.rowText}>{activity.priority ? 'Remover prioridade' : 'Marcar como prioritária'}</Text></Pressable>}
          <Pressable style={styles.row} onPress={onDuplicate}><Icon name="plus" size={21}/><Text style={styles.rowText}>Duplicar atividade</Text></Pressable>
          <Pressable style={styles.row} onPress={onEdit}><Icon name="edit" size={21}/><Text style={styles.rowText}>Editar atividade</Text></Pressable>
          {activity.status === 'PENDENTE' && onCancel && <Pressable style={styles.row} onPress={onCancel}><Icon name="cancel" size={21} color={colors.warning}/><Text style={styles.rowText}>Cancelar atividade</Text></Pressable>}
          {activity.status === 'CANCELADA' && onReopen && <Pressable style={styles.row} onPress={onReopen}><Icon name="undo" size={21}/><Text style={styles.rowText}>Reabrir atividade</Text></Pressable>}
          <Pressable style={[styles.row, styles.dangerRow]} onPress={onDelete}><Icon name="delete" size={21} color={colors.error}/><Text style={[styles.rowText,{color:colors.error}]}>Mover para a lixeira</Text></Pressable>
          <Pressable style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}
const styles=StyleSheet.create({overlay:{flex:1,justifyContent:'flex-end'},scrim:{...StyleSheet.absoluteFill,backgroundColor:'rgba(5,14,29,0.44)'},sheet:{backgroundColor:colors.white,borderTopLeftRadius:radius.xl,borderTopRightRadius:radius.xl,padding:18,paddingBottom:28},handle:{width:42,height:4,borderRadius:4,backgroundColor:colors.gray400,alignSelf:'center',marginBottom:12},title:{...typography.h2,color:colors.navy,marginBottom:7},row:{height:52,flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1,borderBottomColor:colors.gray200},dangerRow:{borderBottomWidth:0},rowText:{...typography.body2Medium,color:colors.navy},cancel:{height:46,marginTop:4,alignItems:'center',justifyContent:'center',borderTopWidth:1,borderTopColor:colors.gray200},cancelText:{...typography.label,color:colors.gray700}});
