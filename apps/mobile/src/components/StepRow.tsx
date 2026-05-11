import { View, Text, TextInput, Pressable } from "react-native";
import { Trash2 } from "lucide-react-native";
import type { Step } from "../types/api";

type Props = {
  step: Step;
  index: number;
  onChange: (updated: Step) => void;
  onRemove: () => void;
};

export function StepRow({ step, index, onChange, onRemove }: Props) {
  return (
    <View className="mb-3 flex-row gap-3">
      <View className="mt-2.5 h-7 w-7 items-center justify-center rounded-full bg-brand-500">
        <Text className="text-xs font-bold text-white">{index + 1}</Text>
      </View>
      <View className="flex-1 gap-2">
        <TextInput
          value={step.instruction}
          onChangeText={(instruction) => onChange({ ...step, instruction })}
          placeholder="Describe this step..."
          multiline
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <View className="flex-row items-center gap-2">
          <TextInput
            value={step.duration?.toString() ?? ""}
            onChangeText={(v) => onChange({ ...step, duration: v ? Number(v) : undefined })}
            placeholder="Min"
            keyboardType="numeric"
            className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
          />
          <Text className="text-xs text-gray-400">min (optional)</Text>
        </View>
      </View>
      <Pressable onPress={onRemove} className="mt-2.5" hitSlop={8}>
        <Trash2 size={18} color="#ef4444" />
      </Pressable>
    </View>
  );
}
