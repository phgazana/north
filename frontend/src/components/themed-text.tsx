import { colors, typography } from '@/theme'; // Certifique-se de que o caminho aponta para o seu index.ts do tema
import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  variant?: keyof typeof typography;
  color?: string;
};

export function ThemedText({
  style,
  variant = 'body',
  color = colors.textPrimary,
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        typography[variant],
        { color },
        style,
      ]}
      {...rest}
    />
  );
}