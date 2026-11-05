import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, typography } from '@/theme';
import { Brand } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context';

export default function Welcome() {
  const router = useRouter();
  const { user, sessionLoading } = useApp();

  useEffect(() => {
    if (!sessionLoading && user) router.replace('/home' as any);
  }, [sessionLoading, user]);

  if (sessionLoading) return null;
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ImageBackground source={require('../../assets/images/north-welcome-bg.png')} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.page}>
          <View style={styles.top}><Brand light /></View>
          <View style={styles.content}>
            <Text style={styles.title}>Organize hoje{`\n`}o seu amanhã.</Text>
            <Text style={styles.description}>Um jeito simples e objetivo{`\n`}de acompanhar suas atividades{`\n`}e alcançar sua meta todos os meses.</Text>
          </View>
          <View style={styles.bottom}>
            <Button title="Começar" size="large" onPress={() => router.push('/cadastro' as any)} style={styles.start} />
            <Pressable onPress={() => router.push('/login' as any)}><Text style={styles.login}>Já tenho uma conta? <Text style={styles.link}>Entrar</Text></Text></Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.navy},bg:{flex:1},overlay:{...StyleSheet.absoluteFill,backgroundColor:'rgba(5,18,40,0.22)'},page:{flex:1,paddingHorizontal:22,paddingTop:40,paddingBottom:25,justifyContent:'space-between'},top:{alignItems:'center'},content:{alignItems:'center',marginTop:40},title:{...typography.h1,color:colors.white,textAlign:'center',fontSize:22,lineHeight:28},description:{...typography.body2,color:colors.white,textAlign:'center',lineHeight:20,marginTop:26,maxWidth:320},bottom:{gap:14},start:{width:'100%'},login:{...typography.caption,color:colors.white,textAlign:'center'},link:{color:'#5A8DEE',fontFamily:'Inter-SemiBold'}});
