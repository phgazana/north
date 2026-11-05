import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography } from '@/theme';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { authService } from '@/services/auth';
import { useApp } from '@/context';

export default function Login() {
  const r = useRouter();
  const { activateSession } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Preencha seu e-mail e sua senha.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      });
      const onboardingPending = response.user.onboardingCompleted === false;
      let destination = response.user.landingScreen === 'activities' ? '/atividades' : '/home';
      if (onboardingPending) destination = '/onboarding/1';
      activateSession(response.user, onboardingPending);
      r.replace(destination as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => r.back()} style={styles.back}>
          <Icon name="arrow-left" size={24} />
        </Pressable>

        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.sub}>Acesse sua conta para continuar.</Text>

        <View style={styles.form}>
          <Field
            label="E-mail"
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable onPress={() => r.push('/recuperar-acesso' as any)} style={styles.forgot}>
          <Text style={styles.link}>Esqueceu sua senha?</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title={loading ? 'Entrando...' : 'Entrar'}
          size="large"
          onPress={handleLogin}
          disabled={loading}
        />

        <View style={styles.or}>
          <View style={styles.line} />
          <Text style={styles.orText}>ou</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.footer}>
          Não tem uma conta?{' '}
          <Text style={styles.link} onPress={() => r.push('/cadastro' as any)}>
            Criar agora
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  page: { padding: 20, paddingBottom: 30 },
  back: { height: 42, width: 40, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.navy, marginTop: 12 },
  sub: { ...typography.body2, color: colors.gray700, marginTop: 2, marginBottom: 20 },
  form: { gap: 15 },
  forgot: { alignItems: 'flex-end', marginTop: 7, marginBottom: 17 },
  link: { color: colors.blue, fontFamily: 'Inter-SemiBold' },
  error: { ...typography.caption, color: colors.error, marginBottom: 12 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 17 },
  line: { flex: 1, height: 1, backgroundColor: colors.gray200 },
  orText: { ...typography.caption, color: colors.gray500 },
  footer: { ...typography.caption, color: colors.gray700, textAlign: 'center' },
});
