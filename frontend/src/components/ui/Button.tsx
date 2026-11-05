import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '@/theme';
import { Icon, IconName } from './Icon';

export function Button({ title, onPress, variant='primary', size='large', icon, disabled=false, style }: { title:string; onPress?:()=>void; variant?:'primary'|'secondary'|'ghost'|'danger'|'dangerOutline'|'dark'; size?:'small'|'medium'|'large'; icon?:IconName; disabled?:boolean; style?:any }) {
  const height = size==='small' ? 40 : size==='medium' ? 48 : 56;
  const dark = variant==='dark' || variant==='primary';
  const fg = variant==='secondary' || variant==='ghost' ? colors.navy : variant==='dangerOutline' ? colors.error : colors.white;
  return <Pressable onPress={onPress} disabled={disabled} style={({pressed})=>[
    styles.base,{height,opacity:disabled?0.45:pressed?0.86:1},
    variant==='primary'&&styles.primary, variant==='dark'&&styles.dark, variant==='secondary'&&styles.secondary, variant==='ghost'&&styles.ghost, variant==='danger'&&styles.danger, variant==='dangerOutline'&&styles.dangerOutline, style
  ]}>
    {icon && <Icon name={icon} size={size==='small'?17:20} color={fg}/>}<Text style={[styles.text,{color:fg},size==='small'&&styles.small]}>{title}</Text>
  </Pressable>;
}
const styles=StyleSheet.create({base:{borderRadius:8,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,paddingHorizontal:16},primary:{backgroundColor:colors.orange},dark:{backgroundColor:colors.navy},secondary:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.navy},ghost:{backgroundColor:'transparent'},danger:{backgroundColor:colors.error},dangerOutline:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.error},text:{...typography.label,fontSize:13},small:{fontSize:12}});
