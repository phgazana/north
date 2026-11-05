import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export default function Recuperar() {
  const router = useRouter();
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar"><Icon name="arrow-left" size={24} /></Pressable>
    <View style={styles.icon}><Icon name="information" size={28} color={colors.blue} /></View>
    <Text style={styles.title}>Recuperação indisponível</Text>
    <Text style={styles.sub}>Esta versão da API ainda não oferece redefinição de senha nem envio de e-mail. Nenhuma solicitação foi enviada.</Text>
    <Button title="Voltar para o login" variant="dark" size="large" onPress={() => router.replace('/login' as any)} style={styles.cta} />
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white }, page: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20, paddingBottom: 30 },
  back: { height: 42, width: 40, justifyContent: 'center' }, icon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 52 },
  title: { ...typography.h1, color: colors.navy, marginTop: 18 }, sub: { ...typography.body2, color: colors.gray700, marginTop: 4, marginBottom: 26 }, cta: { marginTop: 20 },
});
