import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { GlassCard } from "@/src/components/GlassCard";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Logo } from "@/src/components/Logo";
import { TxRow } from "@/src/components/TxRow";
import { useAuth } from "@/src/context/AuthContext";
import { api, Transaction } from "@/src/lib/api";
import { colors, fonts, radii } from "@/src/lib/theme";

export default function CardScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.cardStatus();
        setOnWaitlist(s.on_waitlist);
        const list = await api.listTransactions("card_spend");
        setTxs(list);
      } catch {}
    })();
  }, []);

  const join = async () => {
    setLoading(true);
    try {
      await api.cardWaitlist();
      setOnWaitlist(true);
      Alert.alert(
        "You're on the list",
        "We'll email you when your JATO card is ready.",
      );
    } catch (e: any) {
      Alert.alert("Failed", e?.message || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Logo size={26} />
          <View style={styles.pendingPill}>
            <View style={styles.pendingDot} />
            <Text style={styles.pendingText}>Coming soon</Text>
          </View>
        </View>

        <Text style={styles.h1}>JATO Card</Text>
        <Text style={styles.sub}>
          A Visa debit card powered by Gnosis Pay. Spend your USDC anywhere Visa
          is accepted — zero FX gouging.
        </Text>

        {/* Card mockup */}
        <View style={styles.cardWrap} testID="jato-card-mockup">
          <LinearGradient
            colors={["#0F1629", "#080C16"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* edge highlight */}
            <LinearGradient
              colors={["rgba(0,87,255,0.5)", "rgba(0,87,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardEdge}
            />
            <View style={styles.cardRow}>
              <Logo size={20} />
              <View style={styles.chip} />
            </View>
            <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardLabel}>CARDHOLDER</Text>
                <Text style={styles.cardValue}>
                  {(user?.name || "YOUR NAME").toUpperCase()}
                </Text>
              </View>
              <Text style={styles.visa}>VISA</Text>
            </View>
            <View style={styles.cardGlow} pointerEvents="none" />
          </LinearGradient>
        </View>

        {/* Balance summary */}
        <GlassCard style={styles.balanceCard} testID="card-balance">
          <View>
            <Text style={styles.balLabel}>SPENDABLE BALANCE</Text>
            <Text style={styles.balValue}>
              ${(user?.usdc_balance || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="time" size={14} color={colors.warn} />
            <Text style={styles.statusText}>Pending approval</Text>
          </View>
        </GlassCard>

        {/* Action */}
        {onWaitlist ? (
          <GlassCard style={styles.waitlistCard} testID="waitlist-confirmed">
            <Ionicons name="checkmark-circle" size={28} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.waitlistTitle}>You're on the list</Text>
              <Text style={styles.waitlistDesc}>
                We'll email {user?.email} when your card is ready to order.
              </Text>
            </View>
          </GlassCard>
        ) : (
          <PrimaryButton
            label="Order physical card"
            icon="card"
            onPress={join}
            loading={loading}
            testID="order-card-button"
          />
        )}

        {/* Card spend history */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>CARD ACTIVITY</Text>
        {txs.length === 0 ? (
          <GlassCard style={{ alignItems: "center", padding: 24 }}>
            <Ionicons name="card-outline" size={28} color={colors.textMute} />
            <Text style={styles.emptyTitle}>No card spend yet</Text>
            <Text style={styles.emptyBody}>
              Your card transactions will appear here once activated.
            </Text>
          </GlassCard>
        ) : (
          <View style={{ gap: 8 }}>
            {txs.map((t) => (
              <TxRow key={t.id} tx={t} showStatus />
            ))}
          </View>
        )}

        <Text style={styles.legal}>
          Card services by Gnosis Pay. Issued under license from Visa. JATO is
          operated by CarbonTide Inc, a Delaware corporation. Not available to
          US persons.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  pendingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,181,71,0.12)",
    borderColor: "rgba(255,181,71,0.3)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warn,
    marginRight: 6,
  },
  pendingText: {
    color: colors.warn,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  h1: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 30,
    letterSpacing: -1.2,
  },
  sub: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 26,
  },
  cardWrap: { marginBottom: 24 },
  card: {
    height: 210,
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,87,255,0.4)",
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  },
  cardEdge: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },
  cardGlow: {
    position: "absolute",
    bottom: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: "rgba(0,87,255,0.3)",
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chip: {
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#c9b070",
    opacity: 0.55,
  },
  cardNumber: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: 3,
    marginTop: 36,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
  },
  cardLabel: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 2,
    marginBottom: 4,
  },
  cardValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 1,
  },
  visa: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 22,
    letterSpacing: -0.5,
    fontStyle: "italic",
  },
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  balLabel: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  balValue: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 26,
    letterSpacing: -1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,181,71,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: colors.warn,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  waitlistCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(0,229,160,0.06)",
    borderColor: "rgba(0,229,160,0.25)",
  },
  waitlistTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  waitlistDesc: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  emptyTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, marginTop: 8 },
  emptyBody: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  legal: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 24,
    lineHeight: 16,
  },
});
