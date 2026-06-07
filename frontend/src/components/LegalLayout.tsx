import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Logo } from "@/src/components/Logo";
import { LegalFooter, LEGAL_TEXT } from "@/src/components/LegalFooter";
import { colors, fonts } from "@/src/lib/theme";

type Props = {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

export const LegalLayout: React.FC<Props> = ({ title, intro, sections }) => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          testID="legal-back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Logo size={24} />
        <View style={{ width: 32 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.intro}>{intro}</Text>
        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.heading}>{s.heading}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
        <Text style={styles.fine}>{LEGAL_TEXT}</Text>
        <LegalFooter compact />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  title: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 36,
    letterSpacing: -1.5,
    marginTop: 16,
    marginBottom: 12,
  },
  intro: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },
  section: { marginBottom: 22 },
  heading: {
    color: colors.text,
    fontFamily: fonts.extrabold,
    fontSize: 16,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  body: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  fine: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
});
