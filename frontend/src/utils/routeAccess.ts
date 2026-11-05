import type { LandingScreen } from '@/services/preferences';

export type RouteDecision = { action: 'allow' } | { action: 'redirect'; destination: string };

const PUBLIC_ROUTES = new Set(['', 'login', 'cadastro', 'recuperar-acesso']);

function isOnboardingRoute(route: string): boolean {
  return route === 'onboarding' || route.startsWith('onboarding/') || route === 'meta' || route === 'confirmacao';
}

function landingPath(screen: LandingScreen): string {
  return screen === 'activities' ? '/atividades' : '/home';
}

export function decideRouteAccess(
  route: string,
  authenticated: boolean,
  onboardingPending: boolean,
  landingScreen: LandingScreen,
): RouteDecision {
  if (!authenticated) {
    return PUBLIC_ROUTES.has(route) ? { action: 'allow' } : { action: 'redirect', destination: '/login' };
  }

  if (onboardingPending) {
    if (isOnboardingRoute(route) && route !== 'meta/gerenciar') return { action: 'allow' };
    return { action: 'redirect', destination: '/onboarding/1' };
  }

  if (PUBLIC_ROUTES.has(route) || isOnboardingRoute(route)) {
    return { action: 'redirect', destination: landingPath(landingScreen) };
  }

  return { action: 'allow' };
}
