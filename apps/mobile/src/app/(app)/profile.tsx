import {
  View, Text, FlatList, Pressable, TextInput,
  ActivityIndicator, Alert, Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Settings, ChefHat, Camera } from "lucide-react-native";
import { useState, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { ImagePickerAsset } from "expo-image-picker";
import { useMe, useOnboard } from "../../hooks/use-me";
import { useFeed } from "../../hooks/use-recipes";
import { usePresignUpload, uploadToPresignedUrl } from "../../hooks/use-uploads";
import { EmptyState } from "../../components/EmptyState";
import { ImagePickerButton } from "../../components/ImagePickerButton";
import { apiClient } from "../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecipeSummary } from "../../types/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();
  const presignUpload = usePresignUpload();

  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["55%"], []);

  const updateProfile = useMutation({
    mutationFn: (data: { name?: string; bio?: string; avatarUrl?: string }) =>
      apiClient("/api/me", { method: "PATCH", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setShowEditSheet(false);
      bottomSheetRef.current?.close();
    },
  });

  const handleAvatarPick = async (asset: ImagePickerAsset) => {
    try {
      const mimeType = asset.mimeType ?? "image/jpeg";
      const result = await presignUpload.mutateAsync({
        contentType: mimeType,
        folder: "avatars",
      });
      await uploadToPresignedUrl(result.presignedUrl, asset.uri, mimeType);
      updateProfile.mutate({ avatarUrl: result.publicUrl });
    } catch {
      Alert.alert("Upload failed");
    }
  };

  const openEditSheet = () => {
    setEditName(user?.name ?? "");
    setEditBio(user?.bio ?? "");
    setShowEditSheet(true);
  };

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pb-6 pt-14">
        {/* Avatar */}
        <View className="items-center">
          <View className="relative">
            <Image
              source={
                user.avatarUrl
                  ? { uri: user.avatarUrl }
                  : require("../../../assets/default-avatar.png")
              }
              style={{ width: 88, height: 88, borderRadius: 44 }}
              contentFit="cover"
            />
            <ImagePickerButton
              imageUri={null}
              onPick={handleAvatarPick}
              className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full bg-brand-500"
              aspectRatio={[1, 1]}
            />
          </View>

          <Text className="mt-3 text-xl font-bold text-gray-900">{user.name ?? user.username}</Text>
          <Text className="text-sm text-gray-500">@{user.username}</Text>
          {user.bio && (
            <Text className="mt-2 text-center text-sm text-gray-600">{user.bio}</Text>
          )}
        </View>

        {/* Stats */}
        <View className="mt-5 flex-row justify-center gap-8">
          <View className="items-center">
            <Text className="text-xl font-bold text-gray-900">{user._count.recipes}</Text>
            <Text className="text-xs text-gray-500">Recipes</Text>
          </View>
          <Pressable onPress={() => {}} className="items-center">
            <Text className="text-xl font-bold text-gray-900">{user._count.followers}</Text>
            <Text className="text-xs text-gray-500">Followers</Text>
          </Pressable>
          <Pressable onPress={() => {}} className="items-center">
            <Text className="text-xl font-bold text-gray-900">{user._count.following}</Text>
            <Text className="text-xs text-gray-500">Following</Text>
          </Pressable>
        </View>

        {/* Actions */}
        <View className="mt-5 flex-row gap-3">
          <Pressable
            onPress={openEditSheet}
            className="flex-1 rounded-xl border border-gray-200 py-2.5"
          >
            <Text className="text-center text-sm font-semibold text-gray-700">Edit Profile</Text>
          </Pressable>
          <Pressable
            onPress={() => signOut()}
            className="rounded-xl border border-gray-200 px-4 py-2.5"
          >
            <Settings size={18} color="#6b7280" />
          </Pressable>
        </View>
      </View>

      {/* Recipes (placeholder - will use user recipes endpoint) */}
      <View className="flex-1 px-4 pt-4">
        <Text className="mb-3 text-base font-semibold text-gray-700">My Recipes</Text>
        {user._count.recipes === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="No recipes yet"
            message="Share your first recipe with the world."
            actionLabel="Create Recipe"
            onAction={() => router.push("/(app)/create")}
          />
        ) : (
          <Text className="text-sm text-gray-500">
            {user._count.recipes} recipe{user._count.recipes !== 1 ? "s" : ""} published
          </Text>
        )}
      </View>

      {/* Edit Profile Sheet */}
      {showEditSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={() => setShowEditSheet(false)}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView className="px-4 pt-2">
            <Text className="mb-4 text-lg font-bold text-gray-900">Edit Profile</Text>
            <View className="gap-3">
              <View>
                <Text className="mb-1 text-sm text-gray-600">Display Name</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  className="rounded-xl border border-gray-300 px-4 py-3 text-base"
                />
              </View>
              <View>
                <Text className="mb-1 text-sm text-gray-600">Bio</Text>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Tell people about yourself..."
                  multiline
                  numberOfLines={3}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-base"
                />
              </View>
              <Pressable
                onPress={() =>
                  updateProfile.mutate({
                    name: editName || undefined,
                    bio: editBio || undefined,
                  })
                }
                disabled={updateProfile.isPending}
                className="mt-2 rounded-xl bg-brand-500 py-3 active:bg-brand-600"
              >
                <Text className="text-center font-semibold text-white">
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Text>
              </Pressable>
            </View>
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
}
