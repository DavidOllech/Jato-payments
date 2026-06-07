import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Logo } from "@/src/components/Logo";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { GlassCard } from "@/src/components/GlassCard";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { colors, fonts, radii } from "@/src/lib/theme";

export default function VerifyEmail() {
  const router = useRouter();
  const { user, signOut, verifyEmail, refresh } = useAuth();
  const params = useLocalSearchParams<{ token?: string }>();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resentToken, setResentToken] = useState<string | null>(null);

  // Auto-verify when token in URL
  useEffect(() => {
    if (typeof params.token === "string" && params.token.length > 0) {
      doVerify(params.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  // Redirect verified users
  useEffect(() => {
    if (user?.email_verified) {
      router.replace("/(app)/dashboard");
    }
  }, [user, router]);

  const doVerify = async (token: string) => {
    setStatus("loading");
    setError(null);
    try {
      await verifyEmail(token);
      setStatus("ok");
      setTimeout(() => router.replace("/(app)/dashboard"), 800);
    } catch (e: any) {
      setStatus("err");
      setError(e?.message || "Could not verify");
    }
  };

  const resend = async () => {
    if (!user) return;
    try {
      const res = await api.resendVerification(user.email);
      if (res.verification_token) {
        setResentToken(res.verification_token);
      }
    } catch (e: any) {
      setError(e?.message || "Could not resend");
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#0B1B4D", "#080C16"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <Logo size={24} />
        <Pressable testID="logout" onPress={signOut} hitSlop={12}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={status === "ok" ? "checkmark-circle" : "mail"}
            size={56}
            color={status === "ok" ? colors.accent : colors.primary}
          />
        </View>
        <Text style={styles.title}>
          {status === "ok" ? "Verified!" : "Check your inbox"}
        </Text>
        <Text style={styles.sub}>
          {status === "ok"
            ? "Redirecting to your dashboard…"
            : `We sent a verification link to ${user?.email || "your email"}. Click it to activate your account.`}
        </Text>

        {status === "loading" && (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        )}

        {error && status === "err" && (
          <Text style={styles.error} testID="verify-error">
            {error}
          </Text>
        )}

        {/* MOCK MODE: show one-tap verify button */}
        {(resentToken || (status === "idle" && user && !user.email_verified)) && (
          <GlassCard style={styles.devCard} testID="dev-verify-card">
            <Text style={styles.devLabel}>DEMO MODE</Text>
            <Text style={styles.devText}>
              Email sending is mocked. Tap below to simulate clicking the link.
            </Text>
            <View style={{ height: 12 }} />
            <PrimaryButton
              label={resentToken ? "Verify with resent link" : "Verify now (mock)"}
              variant="accent"
              icon="checkmark"
              onPress={async () => {
                if (resentToken) {
                  await doVerify(resentToken);
                  return;
                }
                // Trigger a resend to get a fresh token, then verify
                if (!user) return;
                try {
                  const res = await api.resendVerification(user.email);
                  if (res.verification_token) {
                    await doVerify(res.verification_token);
                  } else {
                    await refresh();
                  }
                } catch (e: any) {
                  setError(e?.message || "Verify failed");
                }
              }}
              testID="verify-now-button"
            />
          </GlassCard>
        )}

        <View style={{ height: 16 }} />
        <Pressable testID="resend-link" onPress={resend} hitSlop={10}>
          <Text style={styles.resend}>Resend verification email</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logout: { color: colors.textMute, fontFamily: fonts.semibold, fontSize: 13 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(0,87,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0,87,255,0.3)",
  },
  title: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 32,
    letterSpacing: -1.2,
    marginBottom: 8,
  },
  sub: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  error: { color: colors.danger, fontFamily: fonts.medium, marginTop: 16 },
  devCard: {
    marginTop: 32,
    borderColor: "rgba(0,229,160,0.25)",
    backgroundColor: "rgba(0,229,160,0.06)",
  },
  devLabel: {
    color: colors.accent,
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  devText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  resend: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
});
