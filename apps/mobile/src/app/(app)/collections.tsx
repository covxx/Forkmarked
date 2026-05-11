import { View, Text, FlatList, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Plus, Bookmark, ChevronRight } from "lucide-react-native";
import { useState, useCallback, useMemo, useRef } from "react";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useCollections, useCreateCollection, useCollectionDetail } from "../../hooks/use-collections";
import { EmptyState } from "../../components/EmptyState";
import type { CollectionSummary } from "../../types/api";

export default function CollectionsScreen() {
  const router = useRouter();
  const { data: collections, isLoading } = useCollections();
  const createCollection = useCreateCollection();
  const [showSheet, setShowSheet] = useState(false);
  const [newName, setNewName] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%"], []);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection.mutate(newName.trim(), {
      onSuccess: () => {
        setNewName("");
        setShowSheet(false);
        bottomSheetRef.current?.close();
      },
      onError: (err) => Alert.alert("Error", err.message),
    });
  };

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: CollectionSummary }) => (
      <Pressable
        onPress={() => setSelectedCollection(item.id)}
        className="mx-4 mb-3 flex-row items-center rounded-2xl bg-white p-4 shadow-sm"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <View className="h-14 w-14 items-center justify-center rounded-xl bg-brand-50">
          <Bookmark size={24} color="#F97316" />
        </View>
        <View className="ml-4 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
            {item.isDefault && (
              <View className="rounded-full bg-brand-100 px-2 py-0.5">
                <Text className="text-[10px] font-medium text-brand-700">Default</Text>
              </View>
            )}
          </View>
          <Text className="mt-0.5 text-sm text-gray-500">
            {item._count.entries} recipe{item._count.entries !== 1 ? "s" : ""}
          </Text>
        </View>
        <ChevronRight size={20} color="#9ca3af" />
      </Pressable>
    ),
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (selectedCollection) {
    return (
      <CollectionDetailView
        collectionId={selectedCollection}
        onBack={() => setSelectedCollection(null)}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between bg-white px-4 pb-3 pt-14">
        <Text className="text-2xl font-bold text-gray-900">My Collections</Text>
        <Pressable
          onPress={() => setShowSheet(true)}
          className="flex-row items-center gap-1 rounded-full bg-brand-500 px-4 py-2"
        >
          <Plus size={16} color="white" />
          <Text className="text-sm font-semibold text-white">New</Text>
        </Pressable>
      </View>

      <FlatList
        data={collections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={Bookmark}
            title="No collections yet"
            message="Your default shelves will appear after you sign up."
          />
        }
      />

      {showSheet && (
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={() => setShowSheet(false)}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView className="px-4 pt-2">
            <Text className="mb-4 text-lg font-bold text-gray-900">New Collection</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Collection name"
              autoFocus
              className="rounded-xl border border-gray-300 px-4 py-3 text-base"
            />
            <Pressable
              onPress={handleCreate}
              disabled={createCollection.isPending}
              className="mt-4 rounded-xl bg-brand-500 py-3 active:bg-brand-600"
            >
              <Text className="text-center font-semibold text-white">
                {createCollection.isPending ? "Creating..." : "Create Collection"}
              </Text>
            </Pressable>
          </BottomSheetView>
        </BottomSheet>
      )}
    </View>
  );
}

function CollectionDetailView({ collectionId, onBack }: { collectionId: string; onBack: () => void }) {
  const { data, isLoading } = useCollectionDetail(collectionId);
  const router = useRouter();

  if (isLoading || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center bg-white px-4 pb-3 pt-14">
        <Pressable onPress={onBack} hitSlop={12} className="mr-3">
          <Text className="text-base text-brand-600">Back</Text>
        </Pressable>
        <Text className="text-xl font-bold text-gray-900">{data.name}</Text>
      </View>

      <FlatList
        data={data.entries}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(app)/recipe/${item.recipe.id}`)}
            className="mx-4 mb-3 flex-row items-center rounded-2xl bg-white p-3"
          >
            {item.recipe.coverImage ? (
              <Image
                source={{ uri: item.recipe.coverImage }}
                style={{ width: 64, height: 64, borderRadius: 12 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-16 w-16 items-center justify-center rounded-xl bg-brand-50">
                <Text className="text-2xl">🍽️</Text>
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-900">{item.recipe.title}</Text>
              <Text className="text-sm text-gray-500">by {item.recipe.author.username}</Text>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState
            icon={Bookmark}
            title="Empty collection"
            message="Add recipes from the feed or recipe pages."
          />
        }
      />
    </View>
  );
}
