import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '@/theme';
import { Icon } from '@/components/ui/Icon';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth';
import { useApp } from '@/context';

export default function Cadastro() {
  const r = useRouter();
  const { activateSession } = useApp();

  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function handleRegister() {
    setFormError('');
    setNameError('');
    setEmailError('');
    setPasswordError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    let hasError = false;

    if (!cleanName) {
      setNameError('Informe seu nome completo.');
      hasError = true;
    } else if (cleanName.length > 120) {
      setNameError('O nome deve ter até 120 caracteres.');
      hasError = true;
    }

    if (!cleanEmail) {
      setEmailError('Informe seu e-mail.');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Informe um e-mail válido.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Informe uma senha.');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('A senha precisa ter pelo menos 8 caracteres.');
      hasError = true;
    } else if (password.length > 72) {
      setPasswordError('A senha deve ter até 72 caracteres.');
      hasError = true;
    }

    if (hasError) return;

    if (!accepted) {
      setFormError('É necessário aceitar os termos para continuar.');
      return;
    }

    try {
      setLoading(true);

      const response = await authService.register({
        name: cleanName,
        email: cleanEmail,
        password,
      });
      activateSession(response.user, true);

      r.replace('/onboarding/1' as any);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar sua conta. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => r.back()} style={styles.back}>
          <Icon name="arrow-left" size={24} />
        </Pressable>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.sub}>
          Preencha seus dados para começar.
        </Text>

        <View style={styles.form}>
          <Field
            label="Nome completo"
            placeholder="Digite seu nome"
            value={name}
            onChangeText={setName}
            maxLength={120}
            error={nameError}
          />

          <Field
            label="E-mail"
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={emailError}
          />

          <Field
            label="Senha"
            placeholder="Crie uma senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            helper="Mínimo de 8 caracteres."
            error={passwordError}
          />
        </View>

        <Pressable
          onPress={() => setAccepted(v => !v)}
          style={styles.terms}
        >
          <View style={[styles.box, accepted && styles.boxOn]}>
            {accepted && (
              <Icon name="check" size={13} color={colors.white} />
            )}
          </View>

          <Text style={styles.termText}>
            Li e concordo com os{' '}
            <Text style={styles.link} onPress={() => r.push('/conta/terms' as any)}>Termos de Uso</Text> e a{' '}
            <Text style={styles.link} onPress={() => r.push('/conta/privacy' as any)}>Política de Privacidade</Text>.
          </Text>
        </Pressable>

        {formError ? (
          <Text style={styles.formError}>{formError}</Text>
        ) : null}

        <Button
          title={loading ? 'Criando conta...' : 'Criar conta'}
          onPress={handleRegister}
          size="large"
          style={styles.cta}
          disabled={!accepted || loading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta? </Text>
          <Pressable onPress={() => r.push('/login' as any)}>
            <Text style={styles.link}>Entrar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  page: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  back: {
    width: 40,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.navy,
    marginTop: 6,
  },
  sub: {
    ...typography.body2,
    color: colors.gray700,
    marginTop: 2,
    marginBottom: 20,
  },
  form: {
    gap: 15,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 13,
  },
  box: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: colors.navy,
  },
  termText: {
    ...typography.caption,
    color: colors.gray700,
    flex: 1,
    lineHeight: 18,
  },
  link: {
    color: colors.blue,
    fontFamily: 'Inter-SemiBold',
  },
  cta: {
    marginTop: 19,
  },
  formError: {
    ...typography.caption,
    color: colors.error,
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 11,
  },
  footerText: {
    ...typography.caption,
    color: colors.gray700,
  },
});
