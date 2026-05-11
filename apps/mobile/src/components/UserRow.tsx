import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import type { Author } from "../types/api";

type Props = {
  user: Author & { name?: string | null };
  followersCount?: number;
  showFollowButton?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
};

export function UserRow({
  user,
  followersCount,
  showFollowButton = false,
  isFollowing = false,
  onFollow,
  onUnfollow,
}: Props) {
  const router = useRouter();

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFollowing) {
      onUnfollow?.();
    } else {
      onFollow?.();
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/(app)/user/${user.id}`)}
      className="flex-row items-center px-4 py-3 active:bg-gray-50"
    >
      <Image
        source={user.avatarUrl ? { uri: user.avatarUrl } : require("../../assets/default-avatar.png")}
        style={{ width: 44, height: 44, borderRadius: 22 }}
        contentFit="cover"
        placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
      />
      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-gray-900">{user.name ?? user.username}</Text>
        <Text className="text-sm text-gray-500">
          @{user.username}
          {followersCount != null && ` · ${followersCount} followers`}
        </Text>
      </View>
      {showFollowButton && (
        <Pressable
          onPress={handleFollow}
          className={`rounded-full px-4 py-1.5 ${isFollowing ? "border border-gray-300" : "bg-brand-500"}`}
        >
          <Text className={`text-sm font-semibold ${isFollowing ? "text-gray-700" : "text-white"}`}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}
