import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ChefHat } from "lucide-react-native";
import { useFeed, useLikeRecipe } from "../../hooks/use-recipes";
import { RecipeCard } from "../../components/RecipeCard";
import { EmptyState } from "../../components/EmptyState";
import { CollectionPickerSheet } from "../../components/CollectionPickerSheet";
import { useState, useCallback } from "react";
import type { RecipeSummary } from "../../types/api";

export default function FeedScreen() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
  const likeMutation = useLikeRecipe();
  const [pickerRecipeId, setPickerRecipeId] = useState<string | null>(null);

  const recipes = data?.pages.flat() ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: RecipeSummary }) => (
      <RecipeCard
        recipe={item}
        onLike={() => likeMutation.mutate(item.id)}
        onAddToCollection={() => setPickerRecipeId(item.id)}
      />
    ),
    [likeMutation],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pb-3 pt-14">
        <Text className="text-2xl font-bold text-gray-900">Feed</Text>
      </View>

      <FlatList
        data={recipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F97316" />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#F97316" className="py-4" />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={ChefHat}
            title="Your feed is empty"
            message="Follow people to see their recipes here, or discover new ones."
            actionLabel="Discover Recipes"
            onAction={() => router.push("/(app)/search")}
          />
        }
      />

      <CollectionPickerSheet
        recipeId={pickerRecipeId ?? ""}
        visible={!!pickerRecipeId}
        onClose={() => setPickerRecipeId(null)}
      />
    </View>
  );
}
