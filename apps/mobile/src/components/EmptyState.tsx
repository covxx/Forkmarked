import { View, Text, Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";

type Props = {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Icon size={48} color="#d4d4d8" strokeWidth={1.5} />
      <Text className="mt-4 text-lg font-semibold text-gray-800">{title}</Text>
      <Text className="mt-1 text-center text-sm text-gray-500">{message}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="mt-6 rounded-xl bg-brand-500 px-6 py-3 active:bg-brand-600"
        >
          <Text className="font-semibold text-white">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
