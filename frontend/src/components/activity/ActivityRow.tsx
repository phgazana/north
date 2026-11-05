import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, PanResponder, Animated } from 'react-native';
import { Activity } from '@/types/domain';
import { colors, typography } from '@/theme';
import { ActivityIcon, Icon } from '@/components/ui/Icon';
import { money } from '@/utils/format';
import { todayBR } from '@/utils/date';

export function ActivityRow({ item, onPress, onQuickComplete, onDelete, onMenu, swipeable = true, history = false }: {
  item: Activity; onPress?: () => void; onQuickComplete?: () => void; onDelete?: () => void; onMenu?: () => void; swipeable?: boolean; history?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const x = useRef(new Animated.Value(0)).current;
  const SWIPE = 124;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => swipeable && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderMove: (_, g) => { if (swipeable) x.setValue(Math.max(-SWIPE, Math.min(0, g.dx))); },
    onPanResponderRelease: (_, g) => {
      if (!swipeable) return;
      const shouldOpen = g.dx < -48;
      Animated.spring(x, { toValue: shouldOpen ? -SWIPE : 0, useNativeDriver: true, damping: 18, stiffness: 180 }).start();
      setOpen(shouldOpen);
    },
  })).current;

  const value = item.status === 'CONCLUIDA' ? item.realizedValue : item.plannedValue;
  const type = item.status === 'CONCLUIDA' ? item.realizedType : item.plannedType;
  return (
    <View style={styles.wrap}>
      {swipeable && (
        <View style={styles.deleteBg}>
          <Pressable style={styles.deleteAction} onPress={onDelete}>
            <Icon name="delete" size={18} color={colors.white} />
            <Text style={styles.deleteText}>Mover para a lixeira</Text>
          </Pressable>
        </View>
      )}
      <Animated.View {...pan.panHandlers} style={[styles.row, history && styles.history, { transform: [{ translateX: x }] }]}>
        <Pressable style={styles.check} onPress={onQuickComplete} disabled={!onQuickComplete || item.status !== 'PENDENTE'}>
          <View style={[styles.checkbox, item.status === 'CONCLUIDA' && styles.checked]}>{item.status === 'CONCLUIDA' && <Icon name="check" size={13} color={colors.white} />}</View>
        </Pressable>
        <Pressable style={styles.main} onPress={onPress}>
          <View style={styles.iconBox}><ActivityIcon icon={item.icon} size={18} color={colors.navy} /></View>
          <View style={styles.info}>
            <Text style={[styles.title, item.status === 'CONCLUIDA' && styles.strike]} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.meta}>{item.date === todayBR() ? 'Hoje' : item.date ?? 'Sem data'}{item.time ? ` • ${item.time}` : ''}</Text>
          </View>
          {value !== undefined && <Text style={[styles.value, { color: type === 'ENTRADA' ? colors.success : type === 'SAIDA' ? colors.error : colors.navy }]}>{money(value)}</Text>}
          {item.priority && <Icon name="flag" size={16} color={colors.blue} />}
          {item.favorite && <Icon name="star-filled" size={17} color={colors.orange} />}
          {onMenu && <Pressable hitSlop={8} onPress={onMenu}><Icon name="dots" size={20} color={colors.navy} /></Pressable>}
        </Pressable>
      </Animated.View>
      {open && <View style={styles.openHint}><Icon name="delete" size={14} color={colors.error}/><Text style={styles.openHintText}>Toque para mover para a lixeira</Text></View>}
    </View>
  );
}

const styles=StyleSheet.create({wrap:{position:'relative',marginBottom:4,overflow:'hidden',borderRadius:8},deleteBg:{...StyleSheet.absoluteFill,backgroundColor:colors.error,alignItems:'center',justifyContent:'center',borderRadius:8},deleteAction:{width:124,alignItems:'center',justifyContent:'center',alignSelf:'flex-end',gap:3},deleteText:{...typography.caption,color:colors.white,textAlign:'center'},row:{minHeight:64,backgroundColor:colors.white,borderWidth:1,borderColor:colors.gray200,borderRadius:8,flexDirection:'row',alignItems:'center',paddingVertical:8,paddingHorizontal:8},history:{backgroundColor:colors.white},check:{width:30,alignItems:'flex-start',justifyContent:'center'},checkbox:{width:20,height:20,borderWidth:1.5,borderColor:'#7A8BAA',borderRadius:5,alignItems:'center',justifyContent:'center'},checked:{backgroundColor:colors.navy,borderColor:colors.navy},main:{flex:1,flexDirection:'row',alignItems:'center',minWidth:0,gap:8},iconBox:{width:30,height:30,borderRadius:15,backgroundColor:colors.gray100,alignItems:'center',justifyContent:'center'},info:{flex:1,minWidth:0},title:{...typography.body2Medium,color:colors.navy},strike:{textDecorationLine:'line-through',color:colors.gray500},meta:{...typography.caption,color:colors.gray500,marginTop:1},value:{...typography.body2Medium,minWidth:52,textAlign:'right'},openHint:{backgroundColor:colors.errorSoft,minHeight:26,paddingHorizontal:10,flexDirection:'row',alignItems:'center',justifyContent:'flex-end',gap:4},openHintText:{...typography.caption,color:colors.error}});
