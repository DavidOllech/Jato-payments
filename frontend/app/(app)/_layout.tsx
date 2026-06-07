import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { colors, fonts } from "@/src/lib/theme";

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMute,
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 11,
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: bottomPad,
          height: 64,
          borderRadius: 24,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: Platform.select({
            ios: "rgba(15,22,41,0.7)",
            default: "rgba(15,22,41,0.95)",
          }),
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 12,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={40}
              tint="dark"
              style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: "hidden" }]}
            />
          ) : null,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="card"
        options={{
          title: "Card",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="card" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="time" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings-sharp" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const TabIcon: React.FC<{
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}> = ({ name, focused, color }) => {
  return (
    <View style={[styles.icon, focused && styles.iconActive]}>
      <Ionicons name={name} size={20} color={focused ? colors.primary : color} />
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 36,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  iconActive: {
    backgroundColor: "rgba(0,87,255,0.16)",
  },
});
