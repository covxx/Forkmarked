import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";

type Props = {
  imageUri: string | null;
  loading?: boolean;
  onPick: (result: ImagePicker.ImagePickerAsset) => void;
  aspectRatio?: [number, number];
  className?: string;
};

export function ImagePickerButton({
  imageUri,
  loading = false,
  onPick,
  aspectRatio = [16, 9],
  className = "",
}: Props) {
  const handlePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0]);
    }
  };

  return (
    <Pressable onPress={handlePick} className={`overflow-hidden rounded-2xl ${className}`}>
      {loading ? (
        <View className="h-48 items-center justify-center bg-gray-100">
          <ActivityIndicator size="small" color="#F97316" />
          <Text className="mt-2 text-xs text-gray-500">Uploading...</Text>
        </View>
      ) : imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: 192 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="h-48 items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50">
          <Camera size={32} color="#9ca3af" />
          <Text className="mt-2 text-sm text-gray-500">Add Cover Photo</Text>
        </View>
      )}
    </Pressable>
  );
}
