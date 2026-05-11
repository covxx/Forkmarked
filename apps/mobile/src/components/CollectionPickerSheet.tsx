import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useCallback, useMemo, useRef } from "react";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Check, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useCollections, useAddToCollection } from "../hooks/use-collections";

type Props = {
  recipeId: string;
  visible: boolean;
  onClose: () => void;
};

export function CollectionPickerSheet({ recipeId, visible, onClose }: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const { data: collections, isLoading } = useCollections();
  const addToCollection = useAddToCollection();

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const handleAdd = (collectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCollection.mutate(
      { recipeId, collectionId },
      { onSuccess: () => onClose() },
    );
  };

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView className="flex-1 px-4 pt-2">
        <Text className="mb-4 text-lg font-bold text-gray-900">Add to Collection</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#F97316" />
        ) : (
          collections?.map((collection) => (
            <Pressable
              key={collection.id}
              onPress={() => handleAdd(collection.id)}
              className="flex-row items-center justify-between rounded-xl px-3 py-3.5 active:bg-gray-50"
            >
              <View>
                <Text className="text-base font-medium text-gray-900">{collection.name}</Text>
                <Text className="text-xs text-gray-500">
                  {collection._count.entries} recipe{collection._count.entries !== 1 ? "s" : ""}
                </Text>
              </View>
              {collection.isDefault && (
                <View className="rounded-full bg-brand-100 px-2 py-0.5">
                  <Text className="text-xs text-brand-700">Default</Text>
                </View>
              )}
            </Pressable>
          ))
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
