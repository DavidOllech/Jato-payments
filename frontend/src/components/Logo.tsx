import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "@/src/lib/theme";

export const Logo: React.FC<{ size?: number; showWord?: boolean; testID?: string }> = ({
  size = 28,
  showWord = true,
  testID = "jato-logo",
}) => {
  const sq = size;
  return (
    <View style={styles.row} testID={testID}>
      <View
        style={[
          styles.mark,
          {
            width: sq,
            height: sq,
            borderRadius: sq * 0.28,
          },
        ]}
      >
        <Text
          style={{
            color: "#fff",
            fontFamily: fonts.black,
            fontSize: sq * 0.62,
            lineHeight: sq * 0.92,
            letterSpacing: -1,
          }}
        >
          J
        </Text>
      </View>
      {showWord && (
        <Text
          style={{
            color: colors.text,
            fontFamily: fonts.black,
            fontSize: sq * 0.78,
            letterSpacing: -1,
            marginLeft: 10,
          }}
        >
          JATO
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  mark: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
