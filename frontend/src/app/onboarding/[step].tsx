import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

const steps = [
  { icon: 'clipboard' as const, title: 'Suas atividades, em um só lugar.', text: 'Adicione compromissos, tarefas e planos, com ou sem valor. Tudo organizado por data.' },
  { icon: 'chart' as const, title: 'Acompanhe seu progresso.', text: 'Veja seu resultado realizado, projeção do mês e o quanto falta para alcançar sua meta.' },
  { icon: 'target' as const, title: 'Defina sua meta e mantenha o foco.', text: 'Estabeleça um valor para o mês e acompanhe sua evolução de forma simples e visual.' },
];

export default function Onboarding() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step: string }>();
  const rawStep = Array.isArray(step) ? step[0] : step;
  const parsedStep = Number((rawStep ?? '1').replace(/\.html$/, ''));
  const current = Number.isFinite(parsedStep) ? Math.min(3, Math.max(1, parsedStep)) : 1;
  const item = steps[current - 1];

  function next() {
    router.replace(current === 3 ? '/meta' as any : `/onboarding/${current + 1}` as any);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.progress} accessibilityLabel={`Etapa ${current} de 3`}>
          {steps.map((_, index) => <View key={index} style={[styles.bar, index < current && styles.active]} />)}
        </View>
        <View style={styles.main}>
          <View style={styles.iconCircle}><Icon name={item.icon} size={49} color={colors.navy} /></View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>
          <Text style={styles.counter}>Etapa {current} de 3</Text>
        </View>
        <View style={styles.nav}>
          {current > 1 && <Button title="Anterior" variant="secondary" size="medium" onPress={() => router.replace(`/onboarding/${current - 1}` as any)} style={styles.flex} />}
          <Button title={current === 3 ? 'Vamos começar' : 'Próximo'} size="medium" onPress={next} style={styles.flex} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  page: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20, paddingTop: 24, paddingBottom: 24 },
  progress: { flexDirection: 'row', gap: 8, justifyContent: 'center', paddingHorizontal: 40 },
  bar: { flex: 1, height: 4, borderRadius: 5, backgroundColor: '#C9D3E0' },
  active: { backgroundColor: colors.orange },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 25 },
  iconCircle: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#F3F7FB', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { ...typography.h2, color: colors.navy, fontSize: 20, textAlign: 'center', maxWidth: 320 },
  text: { ...typography.body2, color: colors.gray700, textAlign: 'center', maxWidth: 340, lineHeight: 21, marginTop: 10 },
  counter: { ...typography.caption, color: colors.gray500, marginTop: 20 },
  nav: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
