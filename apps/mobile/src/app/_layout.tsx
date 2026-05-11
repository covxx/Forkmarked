import "../../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { QueryClientProvider } from "@tanstack/react-query";
import { tokenCache } from "../lib/clerk-token-cache";
import { setTokenGetter } from "../lib/auth";
import { queryClient } from "../lib/query-client";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function AuthGate() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && getToken) {
      setTokenGetter(() => getToken());
    }
  }, [isLoaded, getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && inAuthGroup) {
      router.replace("/(public)/sign-in");
    } else if (isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/home");
    }
  }, [isLoaded, isSignedIn, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <AuthGate />
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
