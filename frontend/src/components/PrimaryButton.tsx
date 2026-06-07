import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii } from "@/src/lib/theme";

type Variant = "primary" | "accent" | "ghost" | "outline";

export const PrimaryButton: React.FC<{
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  small?: boolean;
}> = ({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  icon,
  style,
  testID,
  small,
}) => {
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "accent"
        ? colors.accent
        : "transparent";
  const fg =
    variant === "accent"
      ? "#04241B"
      : variant === "ghost" || variant === "outline"
        ? colors.text
        : "#fff";
  const borderC =
    variant === "outline" ? colors.borderStrong : "transparent";

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        if (disabled || loading) return;
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: borderC,
          paddingVertical: small ? 12 : 16,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        variant === "primary" && styles.glow,
        variant === "accent" && styles.glowAccent,
        style as any,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon && (
            <Ionicons
              name={icon}
              size={small ? 16 : 18}
              color={fg}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={{
              color: fg,
              fontFamily: fonts.bold,
              fontSize: small ? 14 : 16,
              letterSpacing: 0.2,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  row: { flexDirection: "row", alignItems: "center" },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  glowAccent: {
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
});
