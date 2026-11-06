export type PasswordChangeValues = {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
};

export type PasswordChangeErrors = Partial<Record<keyof PasswordChangeValues, string>>;

export function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    let point = value.charCodeAt(index);
    if (point >= 0xd800 && point <= 0xdbff) {
      const low = value.charCodeAt(index + 1);
      if (!(low >= 0xdc00 && low <= 0xdfff)) return Number.POSITIVE_INFINITY;
      point = 0x10000 + ((point - 0xd800) << 10) + (low - 0xdc00);
      index += 1;
    } else if (point >= 0xdc00 && point <= 0xdfff) {
      return Number.POSITIVE_INFINITY;
    }
    bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
  }
  return bytes;
}

export function passwordLengthError(value: string): string | null {
  if (value.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (value.length > 72) return 'A senha deve ter até 72 caracteres.';
  const bytes = utf8ByteLength(value);
  if (!Number.isFinite(bytes)) return 'A senha deve conter caracteres Unicode válidos.';
  if (bytes > 72) return 'A senha pode ter no máximo 72 bytes em UTF-8.';
  return null;
}

export function validatePasswordChange(values: PasswordChangeValues): PasswordChangeErrors {
  const errors: PasswordChangeErrors = {};
  if (!values.currentPassword) errors.currentPassword = 'Informe sua senha atual.';
  const lengthError = passwordLengthError(values.newPassword);
  if (lengthError) {
    errors.newPassword = lengthError.replace(/^A senha/, 'A nova senha');
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = 'A nova senha deve ser diferente da senha atual.';
  }
  if (values.confirmation !== values.newPassword) errors.confirmation = 'As senhas não coincidem.';
  return errors;
}

export async function submitPasswordChange(
  values: PasswordChangeValues,
  actions: {
    changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
    endSession: () => Promise<void>;
    redirectToLogin: () => void;
  },
): Promise<{ ok: true; cleanupFailed: boolean } | { ok: false; error: string; validation?: PasswordChangeErrors }> {
  const validation = validatePasswordChange(values);
  if (Object.keys(validation).length) return { ok: false, error: '', validation };

  try {
    await actions.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Não foi possível alterar a senha.' };
  }

  let cleanupFailed = false;
  try { await actions.endSession(); } catch { cleanupFailed = true; }
  actions.redirectToLogin();
  return { ok: true, cleanupFailed };
}
