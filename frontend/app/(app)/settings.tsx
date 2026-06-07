import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { GlassCard } from "@/src/components/GlassCard";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useAuth } from "@/src/context/AuthContext";
import { colors, fonts, radii } from "@/src/lib/theme";
import { LegalFooter } from "@/src/components/LegalFooter";

const fmtTaxId = (digits: string | null | undefined) => {
  if (!digits) return "—";
  if (digits.length === 11)
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (digits.length === 14)
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return digits;
};

export default function Settings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifyDeposits, setNotifyDeposits] = useState(true);
  const [notifySpending, setNotifySpending] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>Settings</Text>

        {/* Profile */}
        <View style={styles.profileRow}>
          <View style={styles.avatar} testID="profile-avatar">
            <Text style={styles.avatarText}>
              {(user?.name?.[0] || "?").toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName} testID="profile-name">
              {user?.name}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          {user?.email_verified && (
            <View style={styles.verifiedPill}>
              <Ionicons name="shield-checkmark" size={11} color={colors.accent} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>PROFILE</Text>
        <GlassCard style={styles.section}>
          <SettingsRow label="Account type" value={user?.account_type === "business" ? "Business" : "Personal"} />
          <Divider />
          <SettingsRow
            label={user?.account_type === "business" ? "CNPJ" : "CPF"}
            value={fmtTaxId(user?.account_type === "business" ? user?.cnpj : user?.cpf)}
          />
          <Divider />
          <SettingsRow label="Member since" value={
            user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "—"
          } />
        </GlassCard>

        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <GlassCard style={styles.section}>
          <ToggleRow
            label="PIX deposits"
            description="When your funds arrive"
            value={notifyDeposits}
            onChange={setNotifyDeposits}
            testID="toggle-deposits"
          />
          <Divider />
          <ToggleRow
            label="Card spending"
            description="Per-transaction alerts"
            value={notifySpending}
            onChange={setNotifySpending}
            testID="toggle-spending"
          />
          <Divider />
          <ToggleRow
            label="Product updates"
            description="New features and offers"
            value={notifyMarketing}
            onChange={setNotifyMarketing}
            testID="toggle-marketing"
          />
        </GlassCard>

        <Text style={styles.sectionLabel}>LEGAL</Text>
        <GlassCard style={styles.section}>
          <LinkRow
            icon="document-text"
            label="Terms of Service"
            onPress={() => router.push("/legal/terms")}
            testID="settings-terms"
          />
          <Divider />
          <LinkRow
            icon="lock-closed"
            label="Privacy Policy"
            onPress={() => router.push("/legal/privacy")}
            testID="settings-privacy"
          />
          <Divider />
          <LinkRow
            icon="alert-circle"
            label="Risk Disclosures"
            onPress={() => router.push("/legal/risk")}
            testID="settings-risk"
          />
        </GlassCard>

        <View style={{ height: 16 }} />
        <PrimaryButton
          label="Logout"
          variant="outline"
          icon="log-out-outline"
          onPress={async () => {
            await signOut();
            router.replace("/");
          }}
          testID="settings-logout"
        />

        <LegalFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingsRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.kvRow}>
    <Text style={styles.kvLabel}>{label}</Text>
    <Text style={styles.kvValue}>{value}</Text>
  </View>
);

const ToggleRow: React.FC<{
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testID?: string;
}> = ({ label, description, value, onChange, testID }) => (
  <View style={styles.toggleRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleDesc}>{description}</Text>
    </View>
    <Switch
      testID={testID}
      value={value}
      onValueChange={onChange}
      trackColor={{ false: "#222", true: colors.primary }}
      thumbColor="#fff"
    />
  </View>
);

const LinkRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}> = ({ icon, label, onPress, testID }) => (
  <Pressable
    testID={testID}
    onPress={onPress}
    style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.6 }]}
  >
    <Ionicons name={icon} size={18} color={colors.textMute} />
    <Text style={styles.linkLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textMute} />
  </Pressable>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  h1: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 30,
    letterSpacing: -1.2,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarText: { color: "#fff", fontFamily: fonts.black, fontSize: 22 },
  profileName: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  profileEmail: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,229,160,0.1)",
    borderColor: "rgba(0,229,160,0.25)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    color: colors.textMute,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 4,
  },
  section: { padding: 0, marginBottom: 24 },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  kvLabel: { color: colors.textMute, fontFamily: fonts.medium, fontSize: 13 },
  kvValue: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  toggleLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  toggleDesc: {
    color: colors.textMute,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  linkLabel: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 18,
  },
});
