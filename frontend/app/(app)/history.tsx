import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { TxRow } from "@/src/components/TxRow";
import { GlassCard } from "@/src/components/GlassCard";
import { api, Transaction } from "@/src/lib/api";
import { colors, fonts, radii } from "@/src/lib/theme";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "funded", label: "Funded" },
  { key: "card_spend", label: "Card spend" },
  { key: "sent", label: "Sent" },
] as const;

export default function History() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.listTransactions(filter === "all" ? undefined : filter);
      setTxs(list);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* Sticky header */}
      <View style={styles.header}>
        <Text style={styles.h1}>Transactions</Text>
        <Text style={styles.count}>{txs.length}</Text>
      </View>
      <View style={styles.filterRow}>
        <FlatList
          data={[...FILTERS]}
          keyExtractor={(i) => i.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => {
            const active = filter === item.key;
            return (
              <Pressable
                testID={`filter-${item.key}`}
                onPress={() => setFilter(item.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && { color: colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={txs}
        keyExtractor={(t) => t.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 100 + insets.bottom },
        ]}
        renderItem={({ item }) => <TxRow tx={item} showStatus />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          !loading ? (
            <GlassCard style={styles.empty} testID="history-empty">
              <Ionicons name="receipt-outline" size={32} color={colors.textMute} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyBody}>
                Fund your account to start your activity history.
              </Text>
            </GlassCard>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  h1: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 30,
    letterSpacing: -1.2,
  },
  count: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginBottom: 6,
  },
  filterRow: {
    height: 56,
    justifyContent: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,87,255,0.14)",
  },
  chipText: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  list: { paddingHorizontal: 20, paddingTop: 14 },
  empty: {
    alignItems: "center",
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: 12,
  },
  emptyBody: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
});
