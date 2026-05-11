import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, Clock, Bookmark } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import type { RecipeSummary } from "../types/api";
import { formatDuration } from "@forkmarked/utils";

type Props = {
  recipe: RecipeSummary;
  compact?: boolean;
  onLike?: () => void;
  onAddToCollection?: () => void;
};

export function RecipeCard({ recipe, compact = false, onLike, onAddToCollection }: Props) {
  const router = useRouter();

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike?.();
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCollection?.();
  };

  return (
    <Pressable
      onPress={() => router.push(`/(app)/recipe/${recipe.id}`)}
      className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm"
      style={{ shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
    >
      {recipe.coverImage ? (
        <Image
          source={{ uri: recipe.coverImage }}
          style={{ width: "100%", height: compact ? 140 : 200 }}
          contentFit="cover"
          placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }}
          transition={200}
        />
      ) : (
        <View className={`w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 ${compact ? "h-[140px]" : "h-[200px]"}`}>
          <Text className="text-4xl">🍽️</Text>
        </View>
      )}

      <View className="p-4">
        <Text className="text-lg font-bold text-gray-900" numberOfLines={compact ? 1 : 2}>
          {recipe.title}
        </Text>

        {!compact && recipe.description && (
          <Text className="mt-1 text-sm text-gray-500" numberOfLines={2}>
            {recipe.description}
          </Text>
        )}

        <Pressable
          onPress={() => router.push(`/(app)/user/${recipe.author.id}`)}
          className="mt-2 flex-row items-center"
        >
          <Image
            source={
              recipe.author.avatarUrl
                ? { uri: recipe.author.avatarUrl }
                : require("../../assets/default-avatar.png")
            }
            style={{ width: 24, height: 24, borderRadius: 12 }}
            contentFit="cover"
          />
          <Text className="ml-2 text-sm font-medium text-gray-600">
            {recipe.author.username}
          </Text>
        </Pressable>

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            {totalTime > 0 && (
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#9ca3af" />
                <Text className="text-xs text-gray-500">{formatDuration(totalTime)}</Text>
              </View>
            )}
            <Pressable onPress={handleLike} className="flex-row items-center gap-1" hitSlop={8}>
              <Heart size={14} color="#9ca3af" />
              <Text className="text-xs text-gray-500">{recipe._count.likes}</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleBookmark} hitSlop={8}>
            <Bookmark size={18} color="#9ca3af" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
