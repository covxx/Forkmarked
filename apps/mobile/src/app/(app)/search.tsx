import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from "react-native";
import { Search as SearchIcon, Users, ChefHat } from "lucide-react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchRecipes, useLikeRecipe } from "../../hooks/use-recipes";
import { RecipeCard } from "../../components/RecipeCard";
import { UserRow } from "../../components/UserRow";
import { EmptyState } from "../../components/EmptyState";
import { useAppStore } from "../../lib/store";
import type { RecipeSummary } from "../../types/api";
import { apiClient } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "../../types/api";

type Tab = "recipes" | "users";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("recipes");
  const inputRef = useRef<TextInput>(null);
  const likeMutation = useLikeRecipe();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const recipesQuery = useSearchRecipes(debouncedQuery);
  const recipes = recipesQuery.data?.pages.flat() ?? [];

  const usersQuery = useQuery<UserProfile[]>({
    queryKey: ["users", "search", debouncedQuery],
    queryFn: () =>
      apiClient<UserProfile[]>(`/api/users?search=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length > 0 && activeTab === "users",
  });

  const renderRecipe = useCallback(
    ({ item }: { item: RecipeSummary }) => (
      <RecipeCard recipe={item} compact onLike={() => likeMutation.mutate(item.id)} />
    ),
    [likeMutation],
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 pb-3 pt-14">
        <View className="flex-row items-center rounded-xl bg-gray-100 px-4 py-2.5">
          <SearchIcon size={18} color="#9ca3af" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes, users..."
            autoCorrect={false}
            className="ml-2 flex-1 text-base"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Text className="text-sm text-gray-400">Clear</Text>
            </Pressable>
          )}
        </View>

        {/* Segmented Control */}
        <View className="mt-3 flex-row rounded-lg bg-gray-100 p-1">
          <Pressable
            onPress={() => setActiveTab("recipes")}
            className={`flex-1 rounded-md py-2 ${activeTab === "recipes" ? "bg-white shadow-sm" : ""}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                activeTab === "recipes" ? "text-brand-600" : "text-gray-500"
              }`}
            >
              Recipes
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("users")}
            className={`flex-1 rounded-md py-2 ${activeTab === "users" ? "bg-white shadow-sm" : ""}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                activeTab === "users" ? "text-brand-600" : "text-gray-500"
              }`}
            >
              Users
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Results */}
      {!debouncedQuery ? (
        <EmptyState
          icon={SearchIcon}
          title="Search Forkmarked"
          message="Find recipes by name or discover new cooks."
        />
      ) : activeTab === "recipes" ? (
        recipesQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (recipesQuery.hasNextPage && !recipesQuery.isFetchingNextPage) {
                recipesQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <EmptyState
                icon={ChefHat}
                title="No recipes found"
                message={`No results for "${debouncedQuery}"`}
              />
            }
          />
        )
      ) : usersQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={usersQuery.data ?? []}
          renderItem={({ item }) => (
            <UserRow
              user={item}
              followersCount={item._count.followers}
              showFollowButton
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={Users}
              title="No users found"
              message={`No results for "${debouncedQuery}"`}
            />
          }
        />
      )}
    </View>
  );
}
