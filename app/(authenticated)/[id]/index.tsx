import { getGroupBalance } from "@database/getGroupBalance";
import { getGroupInfo } from "@database/getGroupInfo";
import { GroupInfo } from "@type/group";
import { Link, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";

export default function Group() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const groupId = typeof id === 'string' ? id : id[0];
    getGroupInfo(groupId).then(setGroupInfo);
    getGroupBalance(groupId).then(setBalance);
  }, [id]);

  useFocusEffect(() => {
    navigation.setOptions({ title: `Group ${groupInfo?.name}` });
  });

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20 }}>Split {groupInfo?.name} balance: {balance} {groupInfo?.currency}</Text>

      <Link href={`/${groupInfo?.id}/addUser`} asChild>
        <Button title='Add user' />
      </Link>

      <Link href={`/${groupInfo?.id}/addSplit`} asChild>
        <Button title='Add split' />
      </Link>
    </View>
  )
}