import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/src/components/Logo";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { GlassCard } from "@/src/components/GlassCard";
import { RateTicker } from "@/src/components/RateTicker";
import { LegalFooter } from "@/src/components/LegalFooter";
import { colors, fonts, radii, spacing } from "@/src/lib/theme";
import { useAuth } from "@/src/context/AuthContext";

const FEATURES = [
  {
    icon: "flash" as const,
    title: "Fund with PIX",
    desc: "Top up in seconds from any Brazilian bank. Direct to USDC.",
    accent: colors.accent,
  },
  {
    icon: "shield-checkmark" as const,
    title: "Hold USDC",
    desc: "Dollar-pegged stability. On-chain on Base. Yours, always.",
    accent: colors.primary,
  },
  {
    icon: "card" as const,
    title: "Spend abroad",
    desc: "JATO Visa card. Tap-to-pay anywhere. No FX gouging.",
    accent: "#9B7BFF",
  },
];

const STEPS = [
  { num: "01", title: "Fund with PIX", desc: "From any Brazilian bank in seconds." },
  { num: "02", title: "Convert to USDC", desc: "Auto-converted at live market rates." },
  { num: "03", title: "Send or spend anywhere", desc: "Card, wire, or USDC transfer." },
];

export default function Landing() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* Animated gradient backdrop */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={["#0B1B4D", "#080C16", "#080C16"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Logo size={28} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <RateTicker compact />
          {user ? (
            <PrimaryButton
              label="Dashboard"
              small
              onPress={() => router.push("/(app)/dashboard")}
              testID="header-dashboard-button"
            />
          ) : (
            <PrimaryButton
              label="Sign in"
              variant="outline"
              small
              onPress={() => router.push("/login")}
              testID="header-signin-button"
            />
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge} testID="hero-badge">
            <View style={styles.heroDot} />
            <Text style={styles.heroBadgeText}>USDC payments · Brazil → World</Text>
          </View>
          <Text style={styles.heroTitle} testID="hero-title">
            Send money.{"\n"}
            <Text style={{ color: colors.accent }}>De jato.</Text>
          </Text>
          <Text style={styles.heroSub}>
            Fund with PIX, hold USDC, spend abroad with a Visa card. The Brazilian
            cross-border account, built for speed.
          </Text>
          <View style={styles.heroCtas}>
            <PrimaryButton
              label="Open free account"
              icon="arrow-forward"
              onPress={() => router.push("/signup")}
              testID="hero-cta-signup"
            />
            <Pressable
              testID="hero-cta-login"
              onPress={() => router.push("/login")}
              style={styles.heroSecondary}
            >
              <Text style={styles.heroSecondaryText}>I have an account</Text>
            </Pressable>
          </View>
          <View style={styles.trust}>
            <Ionicons name="lock-closed" size={12} color={colors.textMute} />
            <Text style={styles.trustText}>
              Regulated by CarbonTide Inc · Delaware
            </Text>
          </View>
        </View>

        {/* Features */}
        <Text style={styles.sectionLabel}>WHY JATO</Text>
        <Text style={styles.sectionTitle}>One account. Global reach.</Text>
        <View style={[styles.featureRow, isWide && { flexDirection: "row" }]}>
          {FEATURES.map((f) => (
            <GlassCard
              key={f.title}
              style={[styles.featureCard, isWide && { flex: 1 }]}
              testID={`feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <View style={[styles.featureIcon, { backgroundColor: `${f.accent}20` }]}>
                <Ionicons name={f.icon} size={22} color={f.accent} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </GlassCard>
          ))}
        </View>

        {/* How it works */}
        <Text style={[styles.sectionLabel, { marginTop: 48 }]}>HOW IT WORKS</Text>
        <Text style={styles.sectionTitle}>Three steps. Two minutes.</Text>
        <View style={styles.stepsCol}>
          {STEPS.map((s, i) => (
            <View key={s.num} style={styles.stepRow} testID={`step-${i}`}>
              <Text style={styles.stepNum}>{s.num}</Text>
              <View style={styles.stepLine} />
              <View style={{ flex: 1, paddingBottom: i === STEPS.length - 1 ? 0 : 28 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <Text style={[styles.sectionLabel, { marginTop: 48 }]}>PRICING</Text>
        <Text style={styles.sectionTitle}>Honest, flat fees.</Text>
        <GlassCard style={styles.pricingCard} glow testID="pricing-card">
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>JATO fee</Text>
            <Text style={styles.priceVal}>0.5%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>PIX in (Transak)</Text>
            <Text style={styles.priceMuted}>3.5%</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Hold USDC</Text>
            <Text style={[styles.priceVal, { color: colors.accent }]}>Free</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Card spend abroad</Text>
            <Text style={[styles.priceVal, { color: colors.accent }]}>0%</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.pricingFine}>
            No monthly fees. No hidden FX spread. You see what you pay.
          </Text>
        </GlassCard>

        <View style={{ height: 32 }} />
        <PrimaryButton
          label="Get started — it's free"
          icon="rocket"
          onPress={() => router.push("/signup")}
          testID="footer-cta-signup"
        />

        <LegalFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  blob1: {
    position: "absolute",
    top: -80,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 360,
    backgroundColor: "#0057FF",
    opacity: 0.18,
  },
  blob2: {
    position: "absolute",
    top: 200,
    left: -150,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "#00E5A0",
    opacity: 0.07,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  hero: { paddingTop: 36, paddingBottom: 40 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,87,255,0.12)",
    borderColor: "rgba(0,87,255,0.3)",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 24,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  heroBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontFamily: fonts.semibold,
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -2.5,
    marginBottom: 18,
  },
  heroSub: {
    color: colors.textMute,
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 460,
  },
  heroCtas: { gap: 12, marginBottom: 18 },
  heroSecondary: {
    paddingVertical: 14,
    alignItems: "center",
  },
  heroSecondaryText: {
    color: colors.textMute,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  trust: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustText: { color: colors.textMute, fontSize: 11, fontFamily: fonts.medium },
  sectionLabel: {
    color: colors.primary,
    fontFamily: fonts.extrabold,
    fontSize: 11,
    letterSpacing: 2.4,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 28,
    letterSpacing: -1,
    marginBottom: 24,
    lineHeight: 32,
  },
  featureRow: { gap: 14 },
  featureCard: { padding: 22, gap: 12 },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  featureDesc: {
    color: colors.textMute,
    fontSize: 13.5,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  stepsCol: { gap: 0 },
  stepRow: { flexDirection: "row", alignItems: "flex-start" },
  stepNum: {
    color: colors.primary,
    fontFamily: fonts.black,
    fontSize: 20,
    letterSpacing: -0.5,
    width: 44,
  },
  stepLine: {
    width: 1,
    backgroundColor: colors.border,
    marginRight: 16,
    alignSelf: "stretch",
    marginLeft: -8,
  },
  stepTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    marginBottom: 4,
  },
  stepDesc: { color: colors.textMute, fontSize: 13.5, fontFamily: fonts.regular },
  pricingCard: { padding: 24 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  priceLabel: { color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
  priceVal: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 20,
    letterSpacing: -0.6,
  },
  priceMuted: { color: colors.textMute, fontFamily: fonts.semibold, fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  pricingFine: {
    color: colors.textMute,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 12,
    lineHeight: 18,
  },
});
