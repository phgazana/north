import { Platform } from 'react-native';
import { tokenStorage } from './tokenStorage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://10.0.2.2:8080');

type ApiOptions = RequestInit & {
  authenticated?: boolean;
};

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { authenticated = true, headers, ...requestOptions } = options;

  const token = authenticated ? await tokenStorage.get() : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.detail ||
      `Erro na comunicação com o servidor (${response.status}).`,
    );
  }

  return data as T;
}
