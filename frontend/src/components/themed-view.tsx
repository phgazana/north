import { colors } from '@/theme';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  bgColor?: string;
};

export function ThemedView({ 
  style, 
  bgColor = colors.white, 
  ...otherProps 
}: ThemedViewProps) {
  return (
    <View 
      style={[{ backgroundColor: bgColor }, style]} 
      {...otherProps} 
    />
  );
}