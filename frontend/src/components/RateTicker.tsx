import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, RateResponse } from "@/src/lib/api";
import { colors, fonts, radii } from "@/src/lib/theme";

let cached: RateResponse | null = null;
let lastFetch = 0;

export const useRate = () => {
  const [rate, setRate] = useState<RateResponse | null>(cached);
  useEffect(() => {
    const now = Date.now();
    if (cached && now - lastFetch < 60_000) {
      setRate(cached);
      return;
    }
    let cancel = false;
    api
      .rate()
      .then((r) => {
        if (cancel) return;
        cached = r;
        lastFetch = Date.now();
        setRate(r);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);
  return rate;
};

export const RateTicker: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const rate = useRate();
  return (
    <View
      style={[styles.pill, compact && { paddingVertical: 4, paddingHorizontal: 10 }]}
      testID="rate-ticker"
    >
      <View style={styles.dot} />
      {rate ? (
        <Text style={styles.text}>
          <Text style={{ color: colors.textMute }}>1 USDC = </Text>
          R$ {rate.usdc_brl.toFixed(2)}
        </Text>
      ) : (
        <ActivityIndicator size="small" color={colors.accent} />
      )}
      <Ionicons
        name="trending-up"
        size={12}
        color={colors.accent}
        style={{ marginLeft: 6 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,229,160,0.08)",
    borderColor: "rgba(0,229,160,0.2)",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
