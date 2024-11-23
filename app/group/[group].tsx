import { useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { View, Text } from "react-native";

export default function Group() {
  const navigation = useNavigation();
  const { group } = useLocalSearchParams();

  useFocusEffect(() => {
    navigation.setOptions({ title: `Group ${group}` });
  });

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20 }}>Split {group}</Text>
    </View>
  )
}