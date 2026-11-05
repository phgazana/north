import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '@/theme';
export function Card({children, style, tone='default'}:{children:React.ReactNode;style?:any;tone?:'default'|'dark'|'info'|'success'|'error'}){const bg=tone==='dark'?colors.navy:tone==='info'?colors.infoSoft:tone==='success'?colors.successSoft:tone==='error'?colors.errorSoft:colors.white; return <View style={[styles.card,{backgroundColor:bg},style]}>{children}</View>}
const styles=StyleSheet.create({card:{borderWidth:1,borderColor:colors.gray200,borderRadius:8,padding:14,backgroundColor:colors.white},});
