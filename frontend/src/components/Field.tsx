import React, { useState } from "react";
import { TextInput, View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radii } from "@/src/lib/theme";

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  testID?: string;
  hint?: string;
};

export const Field: React.FC<Props> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightIcon,
  onRightIconPress,
  testID,
  hint,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          { borderColor: focused ? colors.primary : colors.border },
        ]}
      >
        <TextInput
          testID={testID}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.primary}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={12} testID={`${testID}-icon`}>
            <Ionicons name={rightIcon} size={18} color={colors.textMute} />
          </Pressable>
        )}
      </View>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    color: colors.textMute,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
    paddingVertical: 14,
  },
  hint: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 6,
  },
});
