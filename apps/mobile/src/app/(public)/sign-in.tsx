import { View, Text, Pressable } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useState } from "react";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="mb-8 items-center">
        <Text className="text-4xl font-bold text-brand-600">Forkmarked</Text>
        <Text className="mt-2 text-lg text-gray-500">Goodreads for recipes</Text>
      </View>

      <View className="w-full gap-4">
        <Text className="text-center text-base text-gray-600">
          Sign in to discover and share recipes with friends.
        </Text>

        {/* Clerk's hosted sign-in can be triggered here.
            For now, this is a placeholder — full OAuth/email flow 
            will be wired once Clerk keys are configured. */}
        <Pressable className="mt-4 rounded-xl bg-brand-500 px-6 py-4 active:bg-brand-600">
          <Text className="text-center text-lg font-semibold text-white">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
