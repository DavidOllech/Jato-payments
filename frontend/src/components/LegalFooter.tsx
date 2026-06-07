import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { colors, fonts } from "@/src/lib/theme";

export const LEGAL_TEXT =
  "JATO is operated by CarbonTide Inc, a Delaware corporation. Not a bank. USDC is not FDIC insured. Not available to US persons. Payment processing by Transak. Card services by Gnosis Pay.";

export const LegalFooter: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const router = useRouter();
  return (
    <View style={[styles.wrap, compact && { paddingVertical: 16 }]} testID="legal-footer">
      <Text style={styles.body}>{LEGAL_TEXT}</Text>
      <View style={styles.links}>
        <Pressable testID="link-terms" onPress={() => router.push("/legal/terms")}>
          <Text style={styles.link}>Terms</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable testID="link-privacy" onPress={() => router.push("/legal/privacy")}>
          <Text style={styles.link}>Privacy</Text>
        </Pressable>
        <Text style={styles.sep}>·</Text>
        <Pressable testID="link-risk" onPress={() => router.push("/legal/risk")}>
          <Text style={styles.link}>Risk</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 24,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderColor: colors.border,
    marginTop: 24,
  },
  body: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  links: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  link: {
    color: colors.textMute,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  sep: { color: colors.textFaint, marginHorizontal: 8 },
});
