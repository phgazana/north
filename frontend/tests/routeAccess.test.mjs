import assert from 'node:assert/strict';
import test from 'node:test';
import { decideRouteAccess } from '../src/utils/routeAccess.ts';
import { pageTitleFromSegments } from '../src/utils/pageTitle.ts';

test('redirects unauthenticated users away from private routes', () => {
  assert.deepEqual(decideRouteAccess('home', false, false, 'home'), {
    action: 'redirect', destination: '/login',
  });
});

test('sends a signed-in root visit through onboarding or the chosen landing page', () => {
  assert.deepEqual(decideRouteAccess('', true, true, 'home'), {
    action: 'redirect', destination: '/onboarding/1',
  });
  assert.deepEqual(decideRouteAccess('', true, false, 'activities'), {
    action: 'redirect', destination: '/atividades',
  });
});

test('keeps login, registration and recovery routes public', () => {
  for (const route of ['login', 'cadastro', 'recuperar-acesso']) {
    assert.deepEqual(decideRouteAccess(route, false, false, 'home'), { action: 'allow' });
  }
});

test('sends pending users to onboarding and allows only its flow', () => {
  assert.deepEqual(decideRouteAccess('home', true, true, 'activities'), {
    action: 'redirect', destination: '/onboarding/1',
  });
  for (const route of ['onboarding/[step]', 'meta', 'confirmacao']) {
    assert.deepEqual(decideRouteAccess(route, true, true, 'home'), { action: 'allow' });
  }
  assert.deepEqual(decideRouteAccess('meta/gerenciar', true, true, 'home'), {
    action: 'redirect', destination: '/onboarding/1',
  });
});

test('sends completed users away from onboarding to their selected landing screen', () => {
  assert.deepEqual(decideRouteAccess('onboarding/[step]', true, false, 'activities'), {
    action: 'redirect', destination: '/atividades',
  });
  assert.deepEqual(decideRouteAccess('confirmacao', true, false, 'home'), {
    action: 'redirect', destination: '/home',
  });
});

test('allows authenticated users to use normal app routes', () => {
  assert.deepEqual(decideRouteAccess('home', true, false, 'home'), { action: 'allow' });
  assert.deepEqual(decideRouteAccess('meta/gerenciar', true, false, 'home'), { action: 'allow' });
});

test('maps direct Expo Router segments to NORTH section titles', () => {
  const cases = [
    [[], 'NORTH | Início'],
    [['login'], 'NORTH | Entrar'],
    [['cadastro'], 'NORTH | Criar conta'],
    [['recuperar-acesso'], 'NORTH | Recuperar acesso'],
    [['(app)', 'home'], 'NORTH | Início'],
    [['(app)', 'atividades'], 'NORTH | Atividades'],
    [['(app)', 'historico'], 'NORTH | Histórico'],
    [['(app)', 'conta'], 'NORTH | Conta'],
    [['(app)', 'conta', 'preferences'], 'NORTH | Conta'],
    [['(app)', 'mes', '[mes]'], 'NORTH | Histórico'],
  ];

  for (const [segments, title] of cases) {
    assert.equal(pageTitleFromSegments(segments), title);
  }
});

test('updates the section title as navigation segments change', () => {
  const navigation = [
    [['login'], 'NORTH | Entrar'],
    [['(app)', 'home'], 'NORTH | Início'],
    [['(app)', 'atividades'], 'NORTH | Atividades'],
    [['(app)', 'historico'], 'NORTH | Histórico'],
    [['(app)', 'conta'], 'NORTH | Conta'],
  ];

  assert.deepEqual(navigation.map(([segments]) => pageTitleFromSegments(segments)), navigation.map(([, title]) => title));
});
