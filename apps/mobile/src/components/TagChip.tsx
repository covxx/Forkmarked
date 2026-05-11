import { View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";

type Props = {
  label: string;
  onRemove?: () => void;
};

export function TagChip({ label, onRemove }: Props) {
  return (
    <View className="mr-2 mb-2 flex-row items-center rounded-full bg-brand-100 px-3 py-1.5">
      <Text className="text-sm font-medium text-brand-700">{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} className="ml-1.5" hitSlop={8}>
          <X size={14} color="#c2410c" />
        </Pressable>
      )}
    </View>
  );
}
