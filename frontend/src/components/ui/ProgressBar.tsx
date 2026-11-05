import React from 'react'; import {View,StyleSheet} from 'react-native'; import {colors} from '@/theme';
export function ProgressBar({value,track='#D7DEE8',fill=colors.orange,height=7}:{value:number;track?:string;fill?:string;height?:number}){const pct=Math.max(0,Math.min(100,value));return <View style={[styles.track,{height,backgroundColor:track,borderRadius:height/2}]}><View style={{width:`${pct}%`,height,backgroundColor:fill,borderRadius:height/2}}/></View>}
const styles=StyleSheet.create({track:{overflow:'hidden',width:'100%'}});
