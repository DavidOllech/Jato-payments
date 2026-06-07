import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Logo } from "@/src/components/Logo";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Field } from "@/src/components/Field";
import { useAuth } from "@/src/context/AuthContext";
import { colors, fonts, radii } from "@/src/lib/theme";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemo = () => {
    setEmail("demo" + String.fromCharCode(64) + "jato.app");
    setPassword("Demo" + String.fromCharCode(64) + "1234");
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace("/(app)/dashboard");
    } catch (e: any) {
      if (e?.status === 403) {
        setError("Email not verified. Check your inbox.");
        router.replace("/verify-email");
      } else {
        setError(e?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#0B1B4D", "#080C16"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Logo size={24} />
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>Sign in to your JATO account.</Text>

          <Field
            label="Email"
            placeholder="[email protected]"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="login-email"
          />
          <Field
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!show}
            rightIcon={show ? "eye-off" : "eye"}
            onRightIconPress={() => setShow((s) => !s)}
            testID="login-password"
          />

          <Pressable
            testID="demo-fill"
            onPress={fillDemo}
            style={styles.demoChip}
          >
            <Ionicons name="flash" size={12} color={colors.accent} />
            <Text style={styles.demoText}>
              Tap to fill demo credentials
            </Text>
          </Pressable>

          {error && (
            <Text style={styles.error} testID="login-error">
              {error}
            </Text>
          )}

          <View style={{ height: 16 }} />
          <PrimaryButton
            label="Sign in"
            icon="arrow-forward"
            onPress={submit}
            loading={loading}
            testID="login-submit"
          />

          <View style={styles.altRow}>
            <Text style={styles.altText}>New to JATO?</Text>
            <Link href="/signup" asChild>
              <Pressable testID="link-signup">
                <Text style={styles.altLink}> Create account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  scroll: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 24 },
  title: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 36,
    letterSpacing: -1.5,
  },
  subtitle: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 28,
  },
  demoChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "rgba(0,229,160,0.08)",
    borderColor: "rgba(0,229,160,0.2)",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  demoText: { color: colors.accent, fontFamily: fonts.semibold, fontSize: 12 },
  error: {
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 14,
  },
  altRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  altText: { color: colors.textMute, fontFamily: fonts.regular, fontSize: 13 },
  altLink: { color: colors.primary, fontFamily: fonts.bold, fontSize: 13 },
});
