import { View, Pressable } from "react-native";
import { Star } from "lucide-react-native";
import * as Haptics from "expo-haptics";

type Props = {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
};

export function StarRating({ rating, size = 18, interactive = false, onRate }: Props) {
  const handlePress = (star: number) => {
    if (!interactive || !onRate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRate(star);
  };

  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        const StarWrapper = interactive ? Pressable : View;
        return (
          <StarWrapper
            key={star}
            onPress={() => handlePress(star)}
            {...(interactive && { hitSlop: 4 })}
          >
            <Star
              size={size}
              color={filled ? "#F97316" : "#d4d4d8"}
              fill={filled ? "#F97316" : "transparent"}
            />
          </StarWrapper>
        );
      })}
    </View>
  );
}
