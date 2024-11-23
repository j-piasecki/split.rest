import { getEntries } from "@database/getEntries";
import { getGroupBalance } from "@database/getGroupBalance";
import { getGroupInfo } from "@database/getGroupInfo";
import { getMembers } from "@database/getMembers";
import { Entry, GroupInfo, Member } from "@type/group";
import { Link, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";

export default function Group() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    const groupId = typeof id === 'string' ? id : id[0];
    getGroupInfo(groupId).then(setGroupInfo);
    getGroupBalance(groupId).then(setBalance);
    getMembers(groupId).then(setMembers);
    getEntries(groupId).then(setEntries);
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

      {members && members.map((member) => {
        return (
          <View key={member.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{member.name}</Text>
            <Text>{member.email}</Text>
            <Text>{member.balance} {groupInfo?.currency}</Text>
          </View>
        )
      })}

      {entries && entries.map((entry) => {
        return (
          <View key={entry.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{entry.title}</Text>
            <Text>{new Date(entry.timestamp).toISOString()}</Text>
            <Text>{entry.total} {groupInfo?.currency}</Text>
          </View>
        )
      })}
    </View>
  )
}