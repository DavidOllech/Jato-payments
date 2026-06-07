// JATO design tokens
export const colors = {
  bg: "#080C16",
  bgElev: "#0B1120",
  card: "#0F1629",
  cardElev: "#141E36",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  primary: "#0057FF",
  primaryHover: "#004BE6",
  accent: "#00E5A0",
  warn: "#FFB547",
  danger: "#FF5470",
  text: "#FFFFFF",
  textMute: "#8A9CC2",
  textFaint: "#5C6B89",
};

export const radii = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const fonts = {
  display: "Inter_900Black",
  black: "Inter_900Black",
  extrabold: "Inter_800ExtraBold",
  bold: "Inter_700Bold",
  semibold: "Inter_600SemiBold",
  medium: "Inter_500Medium",
  regular: "Inter_400Regular",
};

export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  glowAccent: {
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

export const fmtUSD = (v: number) =>
  "$" +
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtBRL = (v: number) =>
  "R$ " +
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
