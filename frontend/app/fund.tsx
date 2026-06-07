import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";

import { GlassCard } from "@/src/components/GlassCard";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useRate } from "@/src/components/RateTicker";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { colors, fonts, radii } from "@/src/lib/theme";

const TRANSAK_BASE = "https://global-stg.transak.com";
const TRANSAK_KEY = "1c338a51-655e-4d25-9c9b-9879fc0b767e";
const TRANSAK_FEE_PCT = 0.035; // 3.5%
const JATO_FEE_PCT = 0.005; // 0.5%

export default function Fund() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const rate = useRate();
  const [brl, setBrl] = useState("500");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const numeric = useMemo(() => {
    const n = parseFloat(brl.replace(/[^\d.]/g, "")) || 0;
    return n;
  }, [brl]);

  const rateVal = rate?.usdc_brl || 5.42;
  const transakFee = numeric * TRANSAK_FEE_PCT;
  const jatoFee = numeric * JATO_FEE_PCT;
  const totalFees = transakFee + jatoFee;
  const brlAfter = Math.max(0, numeric - totalFees);
  const usdcReceive = brlAfter / rateVal;

  const openTransak = useCallback(async () => {
    const url = new URL(TRANSAK_BASE);
    url.searchParams.set("apiKey", TRANSAK_KEY);
    url.searchParams.set("network", "base");
    url.searchParams.set("cryptoCurrencyCode", "USDC");
    url.searchParams.set("fiatCurrency", "BRL");
    url.searchParams.set("fiatAmount", String(Math.round(numeric)));
    url.searchParams.set("paymentMethod", "pix");
    if (user?.email) url.searchParams.set("email", user.email);
    try {
      await WebBrowser.openBrowserAsync(url.toString(), {
        toolbarColor: colors.bg,
        controlsColor: colors.primary,
      });
    } catch (e: any) {
      Alert.alert("Could not open Transak", e?.message || "");
    }
  }, [numeric, user?.email]);

  const submit = async () => {
    if (numeric < 10) {
      Alert.alert("Minimum fund amount is R$ 10");
      return;
    }
    setLoading(true);
    try {
      await api.createTransaction({
        type: "funded",
        amount_usdc: Number(usdcReceive.toFixed(2)),
        amount_brl: Number(numeric.toFixed(2)),
        note: "PIX fund via Transak",
        status: "completed",
      });
      await refresh();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setDone(true);
      await openTransak();
    } catch (e: any) {
      Alert.alert("Fund failed", e?.message || "");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.successBody}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={48} color="#04241B" />
          </View>
          <Text style={styles.successTitle}>Fund initiated</Text>
          <Text style={styles.successSub}>
            Your Transak PIX flow is open. Once payment is confirmed, USDC will
            land in your account on Base.
          </Text>
          <View style={{ height: 28 }} />
          <PrimaryButton
            label="Back to dashboard"
            onPress={() => router.replace("/(app)/dashboard")}
            testID="success-back"
          />
          <View style={{ height: 12 }} />
          <Pressable
            testID="open-transak-again"
            onPress={openTransak}
            style={styles.linkBtn}
          >
            <Text style={styles.linkText}>Re-open Transak</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          testID="fund-back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Fund account</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount input */}
          <View style={styles.amountWrap}>
            <Text style={styles.amountLabel}>YOU PAY (BRL)</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountCurrency}>R$</Text>
              <TextInput
                testID="fund-brl-input"
                value={brl}
                onChangeText={setBrl}
                keyboardType="decimal-pad"
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={colors.textFaint}
                selectionColor={colors.primary}
              />
            </View>
            <Text style={styles.amountConv} testID="fund-usdc-preview">
              You receive ≈{" "}
              <Text style={{ color: colors.accent }}>
                ${usdcReceive.toFixed(2)} USDC
              </Text>
            </Text>
            <Text style={styles.rateNote}>1 USDC = R$ {rateVal.toFixed(2)} (live)</Text>
          </View>

          {/* Quick amounts */}
          <View style={styles.chipsRow}>
            {[100, 500, 1000, 5000].map((v) => (
              <Pressable
                key={v}
                testID={`quick-${v}`}
                onPress={() => setBrl(String(v))}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && { opacity: 0.7 },
                  numeric === v && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    numeric === v && { color: colors.text },
                  ]}
                >
                  R$ {v}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Payment method */}
          <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
          <GlassCard style={styles.methodCard} testID="payment-method-pix">
            <View style={styles.pixIcon}>
              <Ionicons name="flash" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>PIX</Text>
              <Text style={styles.methodDesc}>
                Instant transfer · Any Brazilian bank
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
          </GlassCard>

          {/* Fee breakdown */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>FEE BREAKDOWN</Text>
          <GlassCard style={{ padding: 18 }} testID="fee-breakdown">
            <FeeRow label="Amount" value={`R$ ${numeric.toFixed(2)}`} />
            <FeeRow
              label="Transak (PIX)"
              value={`R$ ${transakFee.toFixed(2)}`}
              muted
              hint="3.5%"
            />
            <FeeRow
              label="JATO fee"
              value={`R$ ${jatoFee.toFixed(2)}`}
              muted
              hint="0.5%"
            />
            <View style={styles.divider} />
            <FeeRow
              label="You receive"
              value={`$${usdcReceive.toFixed(2)} USDC`}
              bold
              accent
            />
          </GlassCard>

          <View style={{ height: 24 }} />
          <PrimaryButton
            label="Open Transak"
            icon="open-outline"
            onPress={submit}
            loading={loading}
            testID="open-transak-button"
          />
          <Text style={styles.disclaimer}>
            You'll be redirected to Transak (staging) to complete PIX payment.
            USDC settles to your account on Base network.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const FeeRow: React.FC<{
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  accent?: boolean;
  hint?: string;
}> = ({ label, value, muted, bold, accent, hint }) => (
  <View style={styles.feeRow}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text
        style={[
          styles.feeLabel,
          muted && { color: colors.textMute },
          bold && { fontFamily: fonts.bold, color: colors.text },
        ]}
      >
        {label}
      </Text>
      {hint && (
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      )}
    </View>
    <Text
      style={[
        styles.feeValue,
        muted && { color: colors.textMute },
        bold && { fontFamily: fonts.black, fontSize: 18 },
        accent && { color: colors.accent },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    color: colors.text,
    fontFamily: fonts.extrabold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  amountWrap: {
    alignItems: "center",
    paddingVertical: 28,
  },
  amountLabel: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  amountRow: { flexDirection: "row", alignItems: "baseline" },
  amountCurrency: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 22,
    marginRight: 6,
  },
  amountInput: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 56,
    letterSpacing: -3,
    minWidth: 100,
    textAlign: "center",
    padding: 0,
  },
  amountConv: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginTop: 8,
  },
  rateNote: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 4,
  },
  chipsRow: { flexDirection: "row", gap: 8, marginBottom: 28 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,87,255,0.14)",
  },
  chipText: { color: colors.textMute, fontFamily: fonts.bold, fontSize: 13 },
  sectionLabel: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  pixIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0,229,160,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  methodDesc: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  feeLabel: { color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
  feeValue: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  hintPill: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hintText: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  disclaimer: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 16,
    lineHeight: 16,
    textAlign: "center",
  },
  successBody: { flex: 1, padding: 32, alignItems: "center", justifyContent: "center" },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: colors.accent,
    shadowOpacity: 0.55,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  successTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 32,
    letterSpacing: -1.5,
    textAlign: "center",
  },
  successSub: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    maxWidth: 320,
    lineHeight: 22,
  },
  linkBtn: { paddingVertical: 12 },
  linkText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 13 },
});
