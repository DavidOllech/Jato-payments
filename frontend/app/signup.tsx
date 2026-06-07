import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Logo } from "@/src/components/Logo";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Field } from "@/src/components/Field";
import { useAuth } from "@/src/context/AuthContext";
import { colors, fonts, radii } from "@/src/lib/theme";
import { api } from "@/src/lib/api";

type AccountType = "personal" | "business";

const stripDigits = (s: string) => s.replace(/\D+/g, "");

export default function Signup() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email";
    const digits = stripDigits(taxId);
    if (accountType === "personal" && digits.length !== 11)
      return "CPF must be 11 digits";
    if (accountType === "business" && digits.length !== 14)
      return "CNPJ must be 14 digits";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirm) return "Passwords do not match";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const digits = stripDigits(taxId);
      await signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        account_type: accountType,
        cpf: accountType === "personal" ? digits : undefined,
        cnpj: accountType === "business" ? digits : undefined,
      });
      router.replace("/verify-email");
    } catch (e: any) {
      setError(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#0B1B4D", "#080C16"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Take 60 seconds. Be paid in dollars worldwide.
          </Text>

          {/* Account type toggle */}
          <View style={styles.toggleRow} testID="account-type-toggle">
            {(["personal", "business"] as AccountType[]).map((t) => {
              const active = accountType === t;
              return (
                <Pressable
                  key={t}
                  testID={`account-type-${t}`}
                  onPress={() => setAccountType(t)}
                  style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                >
                  <Ionicons
                    name={t === "personal" ? "person" : "business"}
                    size={14}
                    color={active ? colors.text : colors.textMute}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      active && { color: colors.text },
                    ]}
                  >
                    {t === "personal" ? "Personal" : "Business"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Full name"
            placeholder="Maria Silva"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            testID="signup-name"
          />
          <Field
            label="Email"
            placeholder="[email protected]"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="signup-email"
          />
          <Field
            label={accountType === "personal" ? "CPF" : "CNPJ"}
            placeholder={
              accountType === "personal" ? "000.000.000-00" : "00.000.000/0000-00"
            }
            value={taxId}
            onChangeText={setTaxId}
            keyboardType="numeric"
            testID="signup-tax-id"
          />
          <Field
            label="Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!show}
            rightIcon={show ? "eye-off" : "eye"}
            onRightIconPress={() => setShow((s) => !s)}
            testID="signup-password"
          />
          <Field
            label="Confirm password"
            placeholder="Type it again"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!show}
            testID="signup-confirm"
          />

          {error && (
            <Text style={styles.error} testID="signup-error">
              {error}
            </Text>
          )}

          <View style={{ height: 12 }} />
          <PrimaryButton
            label="Create account"
            icon="arrow-forward"
            onPress={submit}
            loading={loading}
            testID="signup-submit"
          />

          <View style={styles.altRow}>
            <Text style={styles.altText}>Already have an account?</Text>
            <Link href="/login" asChild>
              <Pressable testID="link-login">
                <Text style={styles.altLink}> Sign in</Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.legal}>
            By continuing you agree to our Terms and acknowledge our Privacy and
            Risk disclosures. JATO is operated by CarbonTide Inc, a Delaware
            corporation. Not a bank. Not available to US persons.
          </Text>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  title: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 32,
    letterSpacing: -1.2,
    marginTop: 8,
  },
  subtitle: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radii.md,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.textMute,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 10,
  },
  altRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  altText: { color: colors.textMute, fontFamily: fonts.regular, fontSize: 13 },
  altLink: { color: colors.primary, fontFamily: fonts.bold, fontSize: 13 },
  legal: {
    color: colors.textFaint,
    fontSize: 11,
    fontFamily: fonts.regular,
    marginTop: 24,
    lineHeight: 16,
  },
});

// Re-export not used here; module-level
export {}; // ensure file is treated as module
// silence unused
void api;
