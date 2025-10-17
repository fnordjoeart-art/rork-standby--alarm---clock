import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { trpc, trpcClient } from "@/lib/trpc";
import { AlarmProvider } from "@/stores/AlarmStore";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="alarm" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}

declare function require(name: string): any;

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    let sub: any;
    (async () => {
      try {
        const Notifications = require("expo-notifications");
        await Notifications.requestPermissionsAsync();
        if (Notifications.setNotificationHandler) {
          Notifications.setNotificationHandler({
            handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
          });
        }
        sub = Notifications.addNotificationResponseReceivedListener((res: any) => {
          const data = res?.notification?.request?.content?.data as any;
          if (data?.type === "alarm") {
            router.push({ pathname: "/alarm", params: { alarmId: data.alarmId ?? "", sound: data.sound ?? "", time: res?.notification?.request?.content?.body ?? "" } });
          }
        });
        Notifications.addNotificationReceivedListener((res: any) => {
          const data = res?.request?.content?.data as any;
          if (data?.type === "alarm") {
            router.push({ pathname: "/alarm", params: { alarmId: data.alarmId ?? "", sound: data.sound ?? "", time: res?.request?.content?.body ?? "" } });
          }
        });
      } catch (e) {
        console.log("[RootLayout] Notifications unavailable", e);
      }
    })();
    return () => {
      try { sub?.remove?.(); } catch {}
    };
  }, [router]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AlarmProvider>
            <GestureHandlerRootView>
              <ErrorBoundary>
                <RootLayoutNav />
              </ErrorBoundary>
            </GestureHandlerRootView>
          </AlarmProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
