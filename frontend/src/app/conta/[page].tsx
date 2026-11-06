import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useApp } from '@/context';
import { authService } from '@/services/auth';
import { PasswordChangeErrors, submitPasswordChange } from '@/utils/passwordChange';
import { colors, typography } from '@/theme';

const titles: Record<string, string> = {
  personal: 'Dados pessoais', password: 'Alterar senha', preferences: 'Preferências',
  terms: 'Termos de uso', privacy: 'Política de privacidade', help: 'Ajuda e suporte',
};

export default function AccountPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ page: string }>();
  const page = String(params.page ?? 'help');
  const title = titles[page] ?? titles.help;
  const { user, updateProfileName, landingScreen, setLandingScreen, logout } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<PasswordChangeErrors>({});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { setName(user?.name ?? ''); }, [user?.name]);

  async function saveName() {
    if (!name.trim()) { setError('Informe seu nome.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await updateProfileName(name.trim());
      setSuccess('Nome atualizado.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar as alterações.');
    } finally { setSaving(false); }
  }

  async function chooseLanding(screen: 'home' | 'activities') {
    setError(''); setSuccess('');
    try {
      await setLandingScreen(screen);
      setSuccess('Preferência salva na sua conta.');
    } catch {
      setError('Não foi possível salvar a preferência na sua conta.');
    }
  }

  async function changePassword() {
    setError(''); setSuccess(''); setPasswordErrors({}); setChangingPassword(true);
    try {
      const result = await submitPasswordChange(
        { currentPassword, newPassword, confirmation },
        {
          changePassword: authService.changePassword,
          endSession: async () => { await logout(); },
          redirectToLogin: () => router.replace({ pathname: '/login', params: { passwordChanged: '1' } } as any),
        },
      );
      if (!result.ok) {
        if (result.validation) setPasswordErrors(result.validation);
        else setError(result.error);
        return;
      }
      setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      if (result.cleanupFailed) {
        setSuccess('Senha alterada. Entre novamente; sua sessão anterior já foi invalidada.');
      }
    } finally { setChangingPassword(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.outer}>
        <View style={styles.page}>
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar">
            <Icon name="arrow-left" size={24} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{page === 'personal' ? 'Revise as informações associadas à sua conta.' : page === 'preferences' ? 'Ajuste como sua conta abre o NORTH.' : 'Informações claras sobre o uso do NORTH.'}</Text>

          {page === 'personal' && <>
            <View style={styles.card}>
              <Field label="Nome" value={name} onChangeText={setName} maxLength={120} />
              <Field label="E-mail da conta" value={user?.email ?? ''} helper="O e-mail é usado para entrar e não pode ser alterado nesta versão." />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {success ? <Text style={styles.success}>{success}</Text> : null}
              <Button title={saving ? 'Salvando...' : 'Salvar nome'} onPress={saveName} disabled={saving || !name.trim() || name.trim() === user?.name} style={styles.button} />
            </View>
            <Info text="As alterações de nome são enviadas e salvas pela API NORTH." />
          </>}

          {page === 'password' && <>
            <View style={styles.card}>
              <Field label="Senha atual" placeholder="Digite sua senha atual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry maxLength={72} error={passwordErrors.currentPassword} />
              <Field label="Nova senha" placeholder="Crie uma nova senha" value={newPassword} onChangeText={setNewPassword} secureTextEntry maxLength={72} helper="Use entre 8 e 72 caracteres e no máximo 72 bytes em UTF-8." error={passwordErrors.newPassword} />
              <Field label="Confirmar nova senha" placeholder="Digite novamente a nova senha" value={confirmation} onChangeText={setConfirmation} secureTextEntry maxLength={72} error={passwordErrors.confirmation} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {success ? <Text style={styles.success}>{success}</Text> : null}
              <Button title={changingPassword ? 'Alterando...' : 'Alterar senha'} onPress={() => void changePassword()} disabled={changingPassword} style={styles.button} />
            </View>
            <Info text="Por segurança, todas as sessões desta conta serão encerradas após a alteração." />
          </>}

          {page === 'preferences' && <>
            <Text style={styles.sectionLabel}>Ao entrar, abrir</Text>
            <View style={styles.card}>
              <Choice title="Panorama do mês" description="Resumo, meta e próximas atividades." selected={landingScreen === 'home'} onPress={() => void chooseLanding('home')} />
              <View style={styles.divider} />
              <Choice title="Atividades" description="Sua lista de atividades primeiro." selected={landingScreen === 'activities'} onPress={() => void chooseLanding('activities')} />
            </View>
            <Info text="Esta preferência é salva na sua conta e acompanha você em outros dispositivos." />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}
          </>}

          {page === 'terms' && <Document sections={[
            ['Sobre o NORTH', 'O NORTH é uma ferramenta de organização pessoal para atividades, planejamento de valores informados pelo usuário e metas mensais. Não é um banco, carteira, consultoria financeira ou serviço de pagamento.'],
            ['Uso da conta', 'Você é responsável por manter o acesso à sua conta e por inserir informações corretas. Não informe senhas bancárias, dados de cartão ou outras credenciais de terceiros.'],
            ['Disponibilidade e resultados', 'O aplicativo é um projeto acadêmico em evolução. A disponibilidade pode variar e os resumos dependem dos dados inseridos e das regras atuais do sistema. Confira informações importantes por outros meios.'],
            ['Esta versão', 'Este texto é demonstrativo e não constitui aconselhamento jurídico nem substitui termos formais de um serviço comercial.'],
          ]} />}

          {page === 'privacy' && <Document sections={[
            ['Dados utilizados', 'A conta usa nome, e-mail e senha para autenticação. O usuário também pode inserir atividades, datas, observações, metas e valores financeiros planejados ou realizados.'],
            ['Como os dados trafegam', 'Os dados da conta e do aplicativo são enviados à API NORTH e armazenados no banco configurado pelo projeto. O aplicativo não acessa contas bancárias nem importa transações automaticamente.'],
            ['Armazenamento de sessão', 'O token de acesso é guardado no armazenamento seguro do dispositivo móvel. Na versão Web, ele fica no armazenamento local do navegador; proteja o acesso ao seu dispositivo e encerre a sessão em aparelhos compartilhados.'],
            ['Limites desta demonstração', 'A tela não substitui uma política jurídica formal. Esta versão não oferece exclusão de conta pelo aplicativo, nem descreve prazos de retenção ou processos de solicitação de dados que não estejam implementados.'],
          ]} />}

          {page === 'help' && <>
            <View style={styles.card}>
              {[
                ['Como começo?', 'Crie uma conta, percorra as telas de apresentação e, se quiser, defina uma meta mensal. Depois você pode adicionar atividades pelo botão de criação.'],
                ['O NORTH movimenta dinheiro?', 'Não. Valores são registros informados manualmente para organização. O aplicativo não conecta a bancos, não paga contas e não realiza transferências.'],
                ['Como corrijo uma atividade concluída?', 'Abra a atividade e use a opção para reabrir. Em seguida, edite os dados e conclua novamente.'],
                ['Por que não recebi um e-mail para recuperar acesso?', 'O envio de e-mails e a redefinição de senha ainda não estão disponíveis nesta versão.'],
                ['Como envio uma dúvida ou relato?', 'Este projeto não tem um canal externo de suporte configurado. Para uma apresentação ou avaliação acadêmica, use o contato fornecido pelo responsável pelo projeto.'],
              ].map(([question, answer], index) => (
                <View key={question}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <Pressable style={styles.question} onPress={() => setOpenQuestion(openQuestion === index ? null : index)} accessibilityRole="button" accessibilityState={{ expanded: openQuestion === index }}>
                    <Text style={styles.questionTitle}>{question}</Text><Icon name={openQuestion === index ? 'chevron-down' : 'chevron-right'} size={18} color={colors.gray500} />
                  </Pressable>
                  {openQuestion === index ? <Text style={styles.answer}>{answer}</Text> : null}
                </View>
              ))}
            </View>
            <Info text="As telas de ajuda descrevem somente recursos existentes nesta versão." />
          </>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Choice({ title, description, selected, onPress }: { title: string; description: string; selected: boolean; onPress: () => void }) {
  return <Pressable style={styles.choice} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
    <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
    <View style={styles.choiceText}><Text style={styles.questionTitle}>{title}</Text><Text style={styles.answer}>{description}</Text></View>
  </Pressable>;
}

function Document({ sections }: { sections: [string, string][] }) {
  return <View style={styles.card}>{sections.map(([heading, body], index) => <View key={heading} style={index ? styles.documentSection : undefined}>
    <Text style={styles.sectionTitle}>{heading}</Text><Text style={styles.body}>{body}</Text>
  </View>)}</View>;
}

function Info({ text }: { text: string }) {
  return <View style={styles.info}><Icon name="information" size={18} color={colors.blue} /><Text style={styles.infoText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  outer: { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 },
  page: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  back: { width: 42, height: 42, justifyContent: 'center', marginBottom: 8 },
  title: { ...typography.h1, color: colors.navy },
  subtitle: { ...typography.body2, color: colors.gray700, marginTop: 3, marginBottom: 20 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: 12, padding: 16, gap: 14 },
  button: { marginTop: 3 },
  sectionLabel: { ...typography.label, color: colors.navy, marginBottom: 8 },
  sectionTitle: { ...typography.body2Medium, color: colors.navy, marginBottom: 5 },
  body: { ...typography.body2, color: colors.gray700, lineHeight: 21 },
  documentSection: { borderTopWidth: 1, borderTopColor: colors.gray200, paddingTop: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.gray200 },
  choice: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 3 },
  choiceText: { flex: 1, gap: 3 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.gray400, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioSelected: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  question: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 38 },
  questionTitle: { ...typography.body2Medium, color: colors.navy, flex: 1 },
  answer: { ...typography.caption, color: colors.gray700, lineHeight: 19, marginBottom: 10 },
  info: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', backgroundColor: colors.infoSoft, borderRadius: 10, padding: 13, marginTop: 14 },
  infoText: { ...typography.caption, color: colors.gray700, lineHeight: 18, flex: 1 },
  noticeIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  error: { ...typography.caption, color: colors.error },
  success: { ...typography.caption, color: colors.success },
});
