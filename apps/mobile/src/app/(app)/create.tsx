import {
  View, Text, ScrollView, TextInput, Pressable, Switch,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, X } from "lucide-react-native";
import { useState, useCallback } from "react";
import type { ImagePickerAsset } from "expo-image-picker";
import { useCreateRecipe } from "../../hooks/use-recipes";
import { usePresignUpload, uploadToPresignedUrl } from "../../hooks/use-uploads";
import { ImagePickerButton } from "../../components/ImagePickerButton";
import { IngredientRow } from "../../components/IngredientRow";
import { StepRow } from "../../components/StepRow";
import { TagChip } from "../../components/TagChip";
import type { Ingredient, Step } from "../../types/api";

export default function CreateRecipeScreen() {
  const router = useRouter();
  const createRecipe = useCreateRecipe();
  const presignUpload = usePresignUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [uploadingImage, setUploadingImage] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { order: 1, instruction: "" },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImagePick = useCallback(async (asset: ImagePickerAsset) => {
    setCoverImageUri(asset.uri);
    setUploadingImage(true);
    try {
      const mimeType = asset.mimeType ?? "image/jpeg";
      const result = await presignUpload.mutateAsync({
        contentType: mimeType,
        folder: "recipes",
      });
      await uploadToPresignedUrl(result.presignedUrl, asset.uri, mimeType);
      setCoverImageUrl(result.publicUrl);
    } catch {
      Alert.alert("Upload failed", "Could not upload the image. Please try again.");
      setCoverImageUri(null);
    } finally {
      setUploadingImage(false);
    }
  }, [presignUpload]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const updateIngredient = (index: number, updated: Ingredient) => {
    const next = [...ingredients];
    next[index] = updated;
    setIngredients(next);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, instruction: "" }]);
  };

  const updateStep = (index: number, updated: Step) => {
    const next = [...steps];
    next[index] = updated;
    setSteps(next);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const next = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(next);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.length >= 10 || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setTagInput("");
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    if (ingredients.every((i) => !i.name.trim())) next.ingredients = "At least 1 ingredient required";
    if (steps.every((s) => !s.instruction.trim())) next.steps = "At least 1 step required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const cleanedIngredients = ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({
        name: i.name.trim(),
        amount: i.amount?.trim() || undefined,
        unit: i.unit?.trim() || undefined,
      }));

    const cleanedSteps = steps
      .filter((s) => s.instruction.trim())
      .map((s, i) => ({
        order: i + 1,
        instruction: s.instruction.trim(),
        duration: s.duration,
      }));

    createRecipe.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        ingredients: cleanedIngredients,
        steps: cleanedSteps,
        servings: servings ? Number(servings) : undefined,
        prepTime: prepTime ? Number(prepTime) : undefined,
        cookTime: cookTime ? Number(cookTime) : undefined,
        coverImage: coverImageUrl,
        isPublic,
        tags: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: (recipe) => {
          router.dismiss();
          router.push(`/(app)/recipe/${recipe.id}`);
        },
        onError: (err) => Alert.alert("Error", err.message),
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3 pt-14">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <X size={24} color="#374151" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">New Recipe</Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4">
          {/* Cover Photo */}
          <ImagePickerButton
            imageUri={coverImageUri}
            loading={uploadingImage}
            onPick={handleImagePick}
          />

          {/* Basic Info */}
          <View className="mt-5 gap-3">
            <View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Recipe title"
                className="rounded-xl border border-gray-300 px-4 py-3 text-base font-semibold"
              />
              {errors.title && <Text className="mt-1 text-xs text-red-500">{errors.title}</Text>}
            </View>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description (optional)"
              multiline
              numberOfLines={3}
              className="rounded-xl border border-gray-300 px-4 py-3 text-base"
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">Servings</Text>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  placeholder="4"
                  keyboardType="numeric"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">Prep (min)</Text>
                <TextInput
                  value={prepTime}
                  onChangeText={setPrepTime}
                  placeholder="15"
                  keyboardType="numeric"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">Cook (min)</Text>
                <TextInput
                  value={cookTime}
                  onChangeText={setCookTime}
                  placeholder="30"
                  keyboardType="numeric"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <Text className="mt-6 text-lg font-bold text-gray-900">Ingredients</Text>
          {errors.ingredients && (
            <Text className="mt-1 text-xs text-red-500">{errors.ingredients}</Text>
          )}
          <View className="mt-3">
            {ingredients.map((ing, i) => (
              <IngredientRow
                key={i}
                ingredient={ing}
                onChange={(u) => updateIngredient(i, u)}
                onRemove={() => removeIngredient(i)}
              />
            ))}
            <Pressable
              onPress={addIngredient}
              className="mt-1 flex-row items-center gap-1.5 py-2"
            >
              <Plus size={16} color="#F97316" />
              <Text className="text-sm font-medium text-brand-600">Add Ingredient</Text>
            </Pressable>
          </View>

          {/* Steps */}
          <Text className="mt-6 text-lg font-bold text-gray-900">Steps</Text>
          {errors.steps && (
            <Text className="mt-1 text-xs text-red-500">{errors.steps}</Text>
          )}
          <View className="mt-3">
            {steps.map((step, i) => (
              <StepRow
                key={i}
                step={step}
                index={i}
                onChange={(u) => updateStep(i, u)}
                onRemove={() => removeStep(i)}
              />
            ))}
            <Pressable
              onPress={addStep}
              className="mt-1 flex-row items-center gap-1.5 py-2"
            >
              <Plus size={16} color="#F97316" />
              <Text className="text-sm font-medium text-brand-600">Add Step</Text>
            </Pressable>
          </View>

          {/* Tags */}
          <Text className="mt-6 text-lg font-bold text-gray-900">Tags</Text>
          <View className="mt-2 flex-row flex-wrap">
            {tags.map((tag) => (
              <TagChip key={tag} label={tag} onRemove={() => setTags(tags.filter((t) => t !== tag))} />
            ))}
          </View>
          {tags.length < 10 && (
            <TextInput
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Type a tag and press return"
              returnKeyType="done"
              onSubmitEditing={addTag}
              className="mt-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          )}

          {/* Visibility */}
          <View className="mt-6 flex-row items-center justify-between">
            <Text className="text-base font-medium text-gray-700">Public Recipe</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ true: "#F97316", false: "#d1d5db" }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="border-t border-gray-100 bg-white px-4 pb-10 pt-3">
        <Pressable
          onPress={handleSubmit}
          disabled={createRecipe.isPending}
          className="rounded-xl bg-brand-500 py-4 active:bg-brand-600 disabled:opacity-50"
        >
          {createRecipe.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-lg font-bold text-white">Publish Recipe</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
