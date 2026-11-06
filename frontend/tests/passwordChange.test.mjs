import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordLengthError, submitPasswordChange, utf8ByteLength } from '../src/utils/passwordChange.ts';

const valid = { currentPassword: 'current-pass', newPassword: 'new-pass-123', confirmation: 'new-pass-123' };

test('validates confirmation, minimum length, and difference from current password', async () => {
  const invalid = await submitPasswordChange({ ...valid, confirmation: 'different' }, {
    changePassword: async () => assert.fail('must not call API'),
    endSession: async () => assert.fail('must not end session'),
    redirectToLogin: () => assert.fail('must not redirect'),
  });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.validation.confirmation, 'As senhas não coincidem.');

  const tooShort = await submitPasswordChange({ ...valid, newPassword: 'short', confirmation: 'short' }, {
    changePassword: async () => assert.fail('must not call API'), endSession: async () => {}, redirectToLogin: () => {},
  });
  assert.equal(tooShort.validation.newPassword, 'A nova senha deve ter pelo menos 8 caracteres.');

  const same = await submitPasswordChange({ currentPassword: 'same-pass', newPassword: 'same-pass', confirmation: 'same-pass' }, {
    changePassword: async () => assert.fail('must not call API'), endSession: async () => {}, redirectToLogin: () => {},
  });
  assert.match(same.validation.newPassword, /diferente/);
});

test('aligns the character and UTF-8 byte limits with BCrypt', async () => {
  assert.equal(utf8ByteLength('a'.repeat(72)), 72);
  assert.equal(passwordLengthError('a'.repeat(72)), null);
  assert.equal(utf8ByteLength('é'.repeat(36)), 72);
  assert.equal(passwordLengthError('é'.repeat(36)), null);
  assert.equal(utf8ByteLength('é'.repeat(37)), 74);
  assert.match(passwordLengthError('é'.repeat(37)), /72 bytes em UTF-8/);
  assert.equal(utf8ByteLength('pass😀😀😀😀'), 20);
  assert.equal(passwordLengthError('pass😀😀😀😀'), null);
  assert.equal(utf8ByteLength(`1234567\uD800`), Number.POSITIVE_INFINITY);
  assert.equal(utf8ByteLength(`1234567\uDC00`), Number.POSITIVE_INFINITY);
  assert.match(passwordLengthError(`1234567\uD800`), /Unicode válidos/);

  let sent = false;
  const rejected = await submitPasswordChange({
    currentPassword: valid.currentPassword,
    newPassword: 'é'.repeat(37),
    confirmation: 'é'.repeat(37),
  }, {
    changePassword: async () => { sent = true; },
    endSession: async () => {},
    redirectToLogin: () => {},
  });
  assert.equal(rejected.ok, false);
  assert.equal(sent, false);
});

test('shows API errors and preserves the authenticated session on failure', async () => {
  let ended = false;
  let redirected = false;
  const result = await submitPasswordChange(valid, {
    changePassword: async () => { throw new Error('Senha atual incorreta.'); },
    endSession: async () => { ended = true; },
    redirectToLogin: () => { redirected = true; },
  });
  assert.deepEqual(result, { ok: false, error: 'Senha atual incorreta.' });
  assert.equal(ended, false);
  assert.equal(redirected, false);
});

test('ends the session and redirects only after the API accepts the change', async () => {
  const events = [];
  const result = await submitPasswordChange(valid, {
    changePassword: async (data) => { events.push(['api', data]); },
    endSession: async () => { events.push(['logout']); },
    redirectToLogin: () => { events.push(['redirect']); },
  });
  assert.deepEqual(result, { ok: true, cleanupFailed: false });
  assert.deepEqual(events.map(([event]) => event), ['api', 'logout', 'redirect']);
});

test('redirects even if local token cleanup fails after server-side revocation', async () => {
  let redirected = false;
  const result = await submitPasswordChange(valid, {
    changePassword: async () => {},
    endSession: async () => { throw new Error('storage unavailable'); },
    redirectToLogin: () => { redirected = true; },
  });
  assert.deepEqual(result, { ok: true, cleanupFailed: true });
  assert.equal(redirected, true);
});
