import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, Clock, Users, Bookmark, ArrowLeft, MessageCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useRecipeDetail, useLikeRecipe } from "../../../hooks/use-recipes";
import { useFollow, useUnfollow } from "../../../hooks/use-users";
import { useMe } from "../../../hooks/use-me";
import { StarRating } from "../../../components/StarRating";
import { TagChip } from "../../../components/TagChip";
import { CollectionPickerSheet } from "../../../components/CollectionPickerSheet";
import { EmptyState } from "../../../components/EmptyState";
import { apiClient } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDuration } from "@forkmarked/utils";
import type { Ingredient, Step } from "../../../types/api";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: recipe, isLoading, error } = useRecipeDetail(id);
  const { data: me } = useMe();
  const likeMutation = useLikeRecipe();
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const submitReview = useMutation({
    mutationFn: () =>
      apiClient(`/api/recipes/${id}/reviews`, {
        method: "POST",
        body: { rating: reviewRating, body: reviewBody || undefined },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      setReviewRating(0);
      setReviewBody("");
      Alert.alert("Review submitted!");
    },
  });

  const submitComment = useMutation({
    mutationFn: () =>
      apiClient(`/api/recipes/${id}/comments`, {
        method: "POST",
        body: { body: commentBody },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      setCommentBody("");
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 bg-white">
        <EmptyState icon={Heart} title="Not found" message="This recipe doesn't exist." />
      </View>
    );
  }

  const isOwn = me?.id === recipe.author.id;
  const ingredients = recipe.ingredients as Ingredient[];
  const steps = recipe.steps as Step[];

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View>
          {recipe.coverImage ? (
            <Image
              source={{ uri: recipe.coverImage }}
              style={{ width: "100%", aspectRatio: 16 / 9 }}
              contentFit="cover"
            />
          ) : (
            <View className="aspect-video w-full items-center justify-center bg-brand-50">
              <Text className="text-6xl">🍽️</Text>
            </View>
          )}
          <Pressable
            onPress={() => router.back()}
            className="absolute left-4 top-14 rounded-full bg-black/30 p-2"
          >
            <ArrowLeft size={22} color="white" />
          </Pressable>
        </View>

        <View className="px-4 py-5">
          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900">{recipe.title}</Text>

          {/* Author Row */}
          <Pressable
            onPress={() => router.push(`/(app)/user/${recipe.author.id}`)}
            className="mt-3 flex-row items-center"
          >
            <Image
              source={
                recipe.author.avatarUrl
                  ? { uri: recipe.author.avatarUrl }
                  : require("../../../../assets/default-avatar.png")
              }
              style={{ width: 36, height: 36, borderRadius: 18 }}
              contentFit="cover"
            />
            <Text className="ml-3 text-base font-medium text-gray-700">
              {recipe.author.username}
            </Text>
            {!isOwn && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  followMutation.mutate(recipe.author.id);
                }}
                className="ml-auto rounded-full bg-brand-500 px-4 py-1.5"
              >
                <Text className="text-sm font-semibold text-white">Follow</Text>
              </Pressable>
            )}
          </Pressable>

          {/* Stats Row */}
          <View className="mt-4 flex-row items-center gap-5">
            {recipe.prepTime != null && recipe.prepTime > 0 && (
              <View className="flex-row items-center gap-1.5">
                <Clock size={16} color="#6b7280" />
                <Text className="text-sm text-gray-600">Prep {formatDuration(recipe.prepTime)}</Text>
              </View>
            )}
            {recipe.cookTime != null && recipe.cookTime > 0 && (
              <View className="flex-row items-center gap-1.5">
                <Clock size={16} color="#6b7280" />
                <Text className="text-sm text-gray-600">Cook {formatDuration(recipe.cookTime)}</Text>
              </View>
            )}
            {recipe.servings != null && (
              <View className="flex-row items-center gap-1.5">
                <Users size={16} color="#6b7280" />
                <Text className="text-sm text-gray-600">{recipe.servings} servings</Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {recipe.recipeTags.length > 0 && (
            <View className="mt-4 flex-row flex-wrap">
              {recipe.recipeTags.map((rt) => (
                <TagChip key={rt.tagId} label={rt.tag.name} />
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                likeMutation.mutate(recipe.id);
              }}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 py-3"
            >
              <Heart size={18} color="#F97316" />
              <Text className="font-semibold text-gray-700">{recipe._count.likes}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowCollectionPicker(true);
              }}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-brand-500 py-3"
            >
              <Bookmark size={18} color="white" />
              <Text className="font-semibold text-white">Save</Text>
            </Pressable>
          </View>

          {/* Description */}
          {recipe.description && (
            <Text className="mt-5 text-base leading-6 text-gray-700">{recipe.description}</Text>
          )}

          {/* Ingredients */}
          <Text className="mt-6 text-xl font-bold text-gray-900">Ingredients</Text>
          <View className="mt-3 gap-2.5">
            {ingredients.map((ing, i) => (
              <View key={i} className="flex-row items-start">
                <View className="mr-3 mt-1.5 h-2 w-2 rounded-full bg-brand-400" />
                <Text className="flex-1 text-base text-gray-700">
                  {ing.amount && <Text className="font-semibold">{ing.amount} </Text>}
                  {ing.unit && <Text className="text-gray-500">{ing.unit} </Text>}
                  {ing.name}
                  {ing.notes && <Text className="text-gray-400"> ({ing.notes})</Text>}
                </Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <Text className="mt-6 text-xl font-bold text-gray-900">Steps</Text>
          <View className="mt-3 gap-4">
            {steps.map((step, i) => (
              <View key={i} className="flex-row gap-3">
                <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-brand-500">
                  <Text className="text-xs font-bold text-white">{step.order}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base leading-6 text-gray-700">{step.instruction}</Text>
                  {step.duration && (
                    <Text className="mt-1 text-xs text-gray-400">{formatDuration(step.duration)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Reviews Section */}
          <Text className="mt-8 text-xl font-bold text-gray-900">
            Reviews ({recipe._count.reviews})
          </Text>
          <View className="mt-3 rounded-xl bg-gray-50 p-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Write a Review</Text>
            <StarRating rating={reviewRating} interactive onRate={setReviewRating} size={24} />
            <TextInput
              value={reviewBody}
              onChangeText={setReviewBody}
              placeholder="Share your thoughts..."
              multiline
              className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
            />
            <Pressable
              onPress={() => {
                if (reviewRating === 0) {
                  Alert.alert("Please select a rating");
                  return;
                }
                submitReview.mutate();
              }}
              disabled={submitReview.isPending}
              className="mt-3 rounded-lg bg-brand-500 py-2.5 active:bg-brand-600"
            >
              <Text className="text-center text-sm font-semibold text-white">
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </Text>
            </Pressable>
          </View>

          {/* Comments Section */}
          <Text className="mt-8 text-xl font-bold text-gray-900">
            Comments ({recipe._count.comments})
          </Text>
          <View className="mt-3 flex-row gap-2">
            <TextInput
              value={commentBody}
              onChangeText={setCommentBody}
              placeholder="Add a comment..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
            />
            <Pressable
              onPress={() => {
                if (!commentBody.trim()) return;
                submitComment.mutate();
              }}
              disabled={submitComment.isPending}
              className="items-center justify-center rounded-xl bg-brand-500 px-4"
            >
              <MessageCircle size={18} color="white" />
            </Pressable>
          </View>

          <View className="h-24" />
        </View>
      </ScrollView>

      <CollectionPickerSheet
        recipeId={recipe.id}
        visible={showCollectionPicker}
        onClose={() => setShowCollectionPicker(false)}
      />
    </View>
  );
}
