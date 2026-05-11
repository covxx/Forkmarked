import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useMe } from "../../hooks/use-me";
import { useRouter } from "expo-router";
import { ApiError } from "../../lib/api";

export default function HomeScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { data: user, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (error instanceof ApiError && error.code === "NOT_ONBOARDED") {
    router.replace("/(auth)/onboard");
    return null;
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900">
          Hey, {user?.name ?? user?.username} 👋
        </Text>
        <Text className="mt-1 text-base text-gray-500">
          Welcome to Forkmarked
        </Text>
      </View>

      <View className="rounded-2xl bg-brand-50 p-6">
        <Text className="text-lg font-semibold text-brand-800">Your Profile</Text>
        <Text className="mt-2 text-gray-600">@{user?.username}</Text>
        {user?.bio && <Text className="mt-1 text-gray-500">{user.bio}</Text>}
        <View className="mt-4 flex-row gap-6">
          <View>
            <Text className="text-xl font-bold text-brand-600">{user?._count.recipes}</Text>
            <Text className="text-sm text-gray-500">Recipes</Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-brand-600">{user?._count.followers}</Text>
            <Text className="text-sm text-gray-500">Followers</Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-brand-600">{user?._count.following}</Text>
            <Text className="text-sm text-gray-500">Following</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => signOut()}
        className="mt-8 rounded-xl border border-gray-200 px-6 py-4 active:bg-gray-50"
      >
        <Text className="text-center text-base font-medium text-gray-700">Sign Out</Text>
      </Pressable>
    </View>
  );
}
