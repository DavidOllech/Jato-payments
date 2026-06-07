import React from "react";
import { View, Image, StyleSheet } from "react-native";

const LIGHT_WORDMARK = require("../../assets/brand/jato-light.png");
const DARK_WORDMARK = require("../../assets/brand/jato-dark.png");

// Source asset aspect ratio: 1093 x 324
const ASPECT = 1093 / 324;

export const Logo: React.FC<{
  size?: number;
  variant?: "light" | "dark";
  testID?: string;
}> = ({ size = 28, variant = "light", testID = "jato-logo" }) => {
  const height = size;
  const width = height * ASPECT;
  return (
    <View style={styles.row} testID={testID}>
      <Image
        source={variant === "light" ? LIGHT_WORDMARK : DARK_WORDMARK}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});
