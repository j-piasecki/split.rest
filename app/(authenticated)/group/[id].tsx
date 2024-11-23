import { getGroupInfo } from "@database/getGroupInfo";
import { GroupInfo } from "@type/group";
import { useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function Group() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  useEffect(() => {
    const groupId = typeof id === 'string' ? id : id[0];
    getGroupInfo(groupId).then(setGroupInfo);
  }, [id]);

  useFocusEffect(() => {
    navigation.setOptions({ title: `Group ${groupInfo?.name}` });
  });

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20 }}>Split {groupInfo?.name}</Text>
    </View>
  )
}