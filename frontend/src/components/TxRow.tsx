import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radii } from "@/src/lib/theme";
import { Transaction } from "@/src/lib/api";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const META: Record<
  Transaction["type"],
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; sign: "+" | "-" }
> = {
  funded: { icon: "arrow-down", color: colors.accent, label: "Funded via PIX", sign: "+" },
  sent: { icon: "arrow-up", color: colors.primary, label: "Sent", sign: "-" },
  card_spend: { icon: "card", color: "#9B7BFF", label: "Card", sign: "-" },
};

const STATUS_STYLE: Record<
  Transaction["status"],
  { bg: string; fg: string; label: string }
> = {
  completed: { bg: "rgba(0,229,160,0.12)", fg: colors.accent, label: "Completed" },
  pending: { bg: "rgba(255,181,71,0.12)", fg: colors.warn, label: "Pending" },
  failed: { bg: "rgba(255,84,112,0.12)", fg: colors.danger, label: "Failed" },
};

export const TxRow: React.FC<{ tx: Transaction; showStatus?: boolean }> = ({
  tx,
  showStatus,
}) => {
  const m = META[tx.type];
  const s = STATUS_STYLE[tx.status];
  const amount = `${m.sign}$${fmt(tx.amount_usdc)}`;
  return (
    <View style={styles.row} testID={`tx-row-${tx.id}`}>
      <View style={[styles.iconBox, { backgroundColor: `${m.color}1f` }]}>
        <Ionicons name={m.icon} size={18} color={m.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {tx.recipient_name || m.label}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{fmtDate(tx.created_at)}</Text>
          {showStatus && (
            <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
              <Text style={[styles.statusText, { color: s.fg }]}>{s.label}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={[
            styles.amount,
            tx.type === "funded" && { color: colors.accent },
          ]}
        >
          {amount}
        </Text>
        <Text style={styles.usdc}>USDC</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  meta: { color: colors.textMute, fontFamily: fonts.regular, fontSize: 12 },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusText: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.5 },
  amount: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  usdc: {
    color: colors.textMute,
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
});
