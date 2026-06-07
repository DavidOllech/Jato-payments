import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { colors, radii } from "@/src/lib/theme";

export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  glow?: boolean;
  testID?: string;
}> = ({ children, style, glow, testID }) => {
  return (
    <View
      testID={testID}
      style={[styles.card, glow && styles.glow, style as any]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(15,22,41,0.85)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: 20,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    borderColor: "rgba(0,87,255,0.25)",
  },
});
