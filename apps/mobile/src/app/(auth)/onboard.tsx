import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useOnboard } from "../../hooks/use-me";
import { useRouter } from "expo-router";

export default function OnboardScreen() {
  const router = useRouter();
  const onboard = useOnboard();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = () => {
    if (username.length < 3) {
      Alert.alert("Username must be at least 3 characters");
      return;
    }

    onboard.mutate(
      { username, name: name || undefined, bio: bio || undefined },
      {
        onSuccess: () => router.replace("/(auth)/home"),
        onError: (err) => Alert.alert("Error", err.message),
      },
    );
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-bold text-gray-900">Welcome!</Text>
      <Text className="mb-8 mt-2 text-base text-gray-500">
        Let&apos;s set up your Forkmarked profile.
      </Text>

      <View className="gap-4">
        <View>
          <Text className="mb-1 text-sm font-medium text-gray-700">Username *</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. chefmike"
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-xl border border-gray-300 px-4 py-3 text-base"
          />
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-gray-700">Display Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Mike Johnson"
            className="rounded-xl border border-gray-300 px-4 py-3 text-base"
          />
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-gray-700">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about your cooking style..."
            multiline
            numberOfLines={3}
            className="rounded-xl border border-gray-300 px-4 py-3 text-base"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={onboard.isPending}
          className="mt-4 rounded-xl bg-brand-500 px-6 py-4 active:bg-brand-600 disabled:opacity-50"
        >
          {onboard.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-lg font-semibold text-white">
              Create Profile
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
