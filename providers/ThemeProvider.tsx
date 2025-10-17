import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Appearance, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

export type AppTheme = {
  background: string;
  surface: string;
  primaryAccent: string;
  secondaryAccent: string;
  textPrimary: string;
  textSecondary: string;
  glowSoftA: string;
  glowSoftB: string;
  mode: "dark" | "light";
};

export const DEFAULT_THEME: AppTheme = {
  background: "#020202",
  surface: "#0A0A0A",
  primaryAccent: "#FF2E91",
  secondaryAccent: "#0FA3FF",
  textPrimary: "#FFFFFF",
  textSecondary: "#F0F0F0",
  glowSoftA: "#89CFF0",
  glowSoftB: "#F98DBF",
  mode: "dark",
};

const STORAGE_KEY = "standbyplus.theme.v1";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: AppTheme = JSON.parse(stored);
          if (parsed && parsed.background) setTheme(parsed);
        } else {
          const sys = Appearance.getColorScheme();
          if (sys === "light") setTheme((t) => ({ ...t, mode: "light" }));
        }
      } catch (e) {
        console.log("[ThemeProvider] load error", e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
      } catch (e) {
        console.log("[ThemeProvider] persist error", e);
      }
    })();
  }, [theme, isReady]);

  const update = useCallback((patch: Partial<AppTheme>) => {
    setTheme((t) => ({ ...t, ...patch }));
  }, []);

  const reset = useCallback(() => setTheme(DEFAULT_THEME), []);

  const value = useMemo(() => ({ theme, update, reset, isReady }), [theme, update, reset, isReady]);

  return value;
});

export type ThemeContextValue = ReturnType<typeof useTheme>;
