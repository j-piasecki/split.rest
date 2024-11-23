import ModalScreen from "@components/ModalScreen";
import { createSplit } from "@database/createSplit";
import { EntryData } from "@type/group";
import { useAuth } from "@utils/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button, ScrollView, TextInput, View, Text } from "react-native";

function Entry({ email, amount, update }: { email: string, amount: string, update: (data: EntryData) => void }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <TextInput placeholder='E-mail' value={email} onChangeText={(val) => {
        update({ email: val, amount });
      }} style={{
        flex: 2,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 8,
        padding: 8,
        margin: 4,
      }} />
      <TextInput placeholder='Amount' value={String(amount)} onChangeText={(val) => {
        update({ email, amount: Number.isNaN(Number(val)) ? amount : val });
      }} style={{
        flex: 1,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 8,
        padding: 8,
        margin: 4,
      }} />
    </View>
  )
}

function Form() {
  const { id } = useLocalSearchParams();
  const user = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<EntryData[]>([{ email: user!.email, amount: '' }, { email: '', amount: '' }]);
  const [error, setError] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [title, setTitle] = useState('');
  const [waiting, setWaiting] = useState(false);

  function save() {
    let toSave = entries.filter((entry) => entry.email !== '' && entry.amount !== '');

    if (toSave.length < 2) {
      setError('At least two entries are required');
      return;
    }

    const sum = toSave.reduce((acc, entry) => acc + Number(entry.amount), 0);
    const paid = Number(amountPaid);

    if (Math.abs(paid - sum) > 0.0001) {
      setError('Amound paid does not match sum of entries');
      return;
    }

    if (!title) {
      setError('Title is required');
      return;
    }

    toSave = toSave.map((entry) => {
      const amount = entry.email === user!.email ? paid - Number(entry.amount) : -Number(entry.amount);
      return {
        email: entry.email,
        amount: amount,
      }
    })

    setWaiting(true);
    setError('');

    createSplit(id as string, title, toSave).then(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(`/${id}`);
      }

      setWaiting(false);
    }).catch((error) => {
      setError(error.message);
      setWaiting(false);
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {entries.map((entry, index) => (
          <Entry key={index} email={entry.email} amount={String(entry.amount)} update={(data) => {
            let newEntries = [...entries];
            newEntries[index] = data;

            newEntries = newEntries.filter((entry) => entry.email !== '' || entry.amount !== '');

            if (newEntries.length === 0 || newEntries[newEntries.length - 1].email !== '' || newEntries[newEntries.length - 1].amount !== '') {
              newEntries.push({ email: '', amount: '' });
            }

            setEntries(newEntries);
          }} />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16 }}>
        <Text style={{flex: 1}}>Title:</Text>
        <TextInput placeholder='Title' value={title} onChangeText={setTitle} style={{ flex: 1, borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 8, margin: 4 }} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16 }}>
        <Text style={{flex: 1}}>Total paid:</Text>
        <TextInput placeholder='Amount' value={amountPaid} onChangeText={(a) => {
          if (Number.isNaN(Number(a))) {
            setAmountPaid(amountPaid);
          } else {
            setAmountPaid(a);
          }
        }} style={{ flex: 1, borderWidth: 1, borderColor: 'black', borderRadius: 8, padding: 8, margin: 4 }} />
      </View>

      <View style={{ margin: 16 }}>
        {waiting && <ActivityIndicator size="small" />}
        {!waiting && <Button title='Save' onPress={save} />}
        {error !== '' && <Text style={{ color: 'red' }}>{error}</Text>}
      </View>
    </View>
  )
}

export default function Modal() {
  const { id } = useLocalSearchParams();

  return (
    <ModalScreen returnPath={`/${id}`} title='Add split'>
      <Form />
    </ModalScreen>
  )
}