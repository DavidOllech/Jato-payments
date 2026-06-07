import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Logo } from "@/src/components/Logo";
import { GlassCard } from "@/src/components/GlassCard";
import { RateTicker, useRate } from "@/src/components/RateTicker";
import { TxRow } from "@/src/components/TxRow";
import { useAuth } from "@/src/context/AuthContext";
import { api, Transaction } from "@/src/lib/api";
import { colors, fonts, radii, fmtBRL } from "@/src/lib/theme";

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rate = useRate();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await api.listTransactions();
      setTxs(list);
      await refresh();
    } catch {}
  }, [refresh]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const usdc = user?.usdc_balance ?? 0;
  const brl = rate ? usdc * rate.usdc_brl : 0;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Logo size={26} />
          <RateTicker compact />
        </View>

        {/* Greeting */}
        <Text style={styles.hi} testID="dashboard-greeting">
          Olá, {user?.name?.split(" ")[0] || "you"}.
        </Text>

        {/* Balance card */}
        <GlassCard glow style={styles.balanceCard} testID="balance-card">
          <LinearGradient
            colors={["rgba(0,87,255,0.2)", "rgba(0,87,255,0)"]}
            style={styles.balanceGlow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
          />
          <View style={styles.balanceHeaderRow}>
            <Text style={styles.balanceLabel}>USDC BALANCE</Text>
            <View style={styles.usdcChip}>
              <View style={styles.usdcDot} />
              <Text style={styles.usdcChipText}>Base</Text>
            </View>
          </View>
          <Text style={styles.balanceUsdc} testID="balance-usdc">
            $
            {usdc.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.balanceBrl} testID="balance-brl">
            ≈ {fmtBRL(brl)}
          </Text>
        </GlassCard>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <ActionButton
            icon="add"
            label="Fund"
            primary
            onPress={() => router.push("/fund")}
            testID="action-fund"
          />
          <ActionButton
            icon="card"
            label="Card"
            onPress={() => router.push("/(app)/card")}
            testID="action-card"
          />
          <ActionButton
            icon="time"
            label="History"
            onPress={() => router.push("/(app)/history")}
            testID="action-history"
          />
        </View>

        {/* Recent transactions */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable
            testID="see-all"
            onPress={() => router.push("/(app)/history")}
            hitSlop={10}
          >
            <Text style={styles.linkText}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.txList}>
          {txs.length === 0 ? (
            <GlassCard style={{ alignItems: "center", padding: 28 }}>
              <Ionicons name="sparkles" size={28} color={colors.primary} />
              <Text style={[styles.emptyTitle, { marginTop: 12 }]}>
                No transactions yet
              </Text>
              <Text style={styles.emptyBody}>
                Fund your account with PIX to get started.
              </Text>
            </GlassCard>
          ) : (
            txs.slice(0, 6).map((t) => <TxRow key={t.id} tx={t} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ActionButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  primary?: boolean;
  testID?: string;
}> = ({ icon, label, onPress, primary, testID }) => (
  <Pressable
    testID={testID}
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionBtn,
      primary && styles.actionBtnPrimary,
      pressed && { opacity: 0.85 },
    ]}
  >
    <View
      style={[
        styles.actionIcon,
        primary && { backgroundColor: "rgba(255,255,255,0.18)" },
      ]}
    >
      <Ionicons name={icon} size={22} color={primary ? "#fff" : colors.primary} />
    </View>
    <Text style={[styles.actionLabel, primary && { color: "#fff" }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  hi: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 24,
    letterSpacing: -1,
    marginBottom: 16,
  },
  balanceCard: {
    paddingTop: 22,
    paddingBottom: 24,
    overflow: "hidden",
  },
  balanceGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 240,
  },
  balanceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  balanceLabel: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
  },
  usdcChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,87,255,0.16)",
    borderColor: "rgba(0,87,255,0.3)",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  usdcDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  usdcChipText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
  },
  balanceUsdc: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 48,
    letterSpacing: -2.5,
    lineHeight: 52,
  },
  balanceBrl: {
    color: colors.textMute,
    fontFamily: fonts.semibold,
    fontSize: 15,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 28,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: "center",
    gap: 10,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,87,255,0.12)",
  },
  actionLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.extrabold,
    fontSize: 17,
    letterSpacing: -0.4,
  },
  linkText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  txList: { gap: 8 },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  emptyBody: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
});
