import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChefHat } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useUserProfile, useFollow, useUnfollow } from "../../../hooks/use-users";
import { useMe } from "../../../hooks/use-me";
import { EmptyState } from "../../../components/EmptyState";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: profile, isLoading } = useUserProfile(id);
  const { data: me } = useMe();
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  const isOwn = me?.id === id;

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    followMutation.mutate(id);
  };

  const handleUnfollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    unfollowMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-white">
        <EmptyState icon={ChefHat} title="User not found" message="This user doesn't exist." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pb-6 pt-14">
        <Pressable onPress={() => router.back()} className="mb-4" hitSlop={12}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>

        <View className="items-center">
          <Image
            source={
              profile.avatarUrl
                ? { uri: profile.avatarUrl }
                : require("../../../../assets/default-avatar.png")
            }
            style={{ width: 88, height: 88, borderRadius: 44 }}
            contentFit="cover"
          />

          <Text className="mt-3 text-xl font-bold text-gray-900">
            {profile.name ?? profile.username}
          </Text>
          <Text className="text-sm text-gray-500">@{profile.username}</Text>
          {profile.bio && (
            <Text className="mt-2 text-center text-sm text-gray-600">{profile.bio}</Text>
          )}
        </View>

        {/* Stats */}
        <View className="mt-5 flex-row justify-center gap-8">
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{profile._count.recipes}</Text>
            <Text className="text-xs text-gray-500">Recipes</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{profile._count.followers}</Text>
            <Text className="text-xs text-gray-500">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{profile._count.following}</Text>
            <Text className="text-xs text-gray-500">Following</Text>
          </View>
        </View>

        {/* Follow/Unfollow */}
        {!isOwn && (
          <View className="mt-5">
            <Pressable
              onPress={handleFollow}
              className="rounded-xl bg-brand-500 py-3 active:bg-brand-600"
            >
              <Text className="text-center font-semibold text-white">Follow</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Recipes placeholder */}
      <View className="flex-1 px-4 pt-4">
        <Text className="mb-3 text-base font-semibold text-gray-700">Recipes</Text>
        {profile._count.recipes === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="No recipes yet"
            message="This user hasn't published any recipes."
          />
        ) : (
          <Text className="text-sm text-gray-500">
            {profile._count.recipes} recipe{profile._count.recipes !== 1 ? "s" : ""} published
          </Text>
        )}
      </View>
    </View>
  );
}
