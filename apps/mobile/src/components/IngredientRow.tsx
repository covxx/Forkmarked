import { View, TextInput, Pressable } from "react-native";
import { Trash2 } from "lucide-react-native";
import type { Ingredient } from "../types/api";

type Props = {
  ingredient: Ingredient;
  onChange: (updated: Ingredient) => void;
  onRemove: () => void;
};

export function IngredientRow({ ingredient, onChange, onRemove }: Props) {
  return (
    <View className="mb-2 flex-row items-center gap-2">
      <TextInput
        value={ingredient.amount ?? ""}
        onChangeText={(amount) => onChange({ ...ingredient, amount })}
        placeholder="Amt"
        className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-sm"
      />
      <TextInput
        value={ingredient.unit ?? ""}
        onChangeText={(unit) => onChange({ ...ingredient, unit })}
        placeholder="Unit"
        className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-sm"
      />
      <TextInput
        value={ingredient.name}
        onChangeText={(name) => onChange({ ...ingredient, name })}
        placeholder="Ingredient name"
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <Pressable onPress={onRemove} hitSlop={8}>
        <Trash2 size={18} color="#ef4444" />
      </Pressable>
    </View>
  );
}
