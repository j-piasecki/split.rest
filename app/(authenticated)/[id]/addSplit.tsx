import ModalScreen from "@components/ModalScreen";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Modal() {
  const { id } = useLocalSearchParams();

  return (
    <ModalScreen returnPath={`/${id}`} title='Add split'>
      <View style={{ flex: 1, backgroundColor: 'red' }} />
    </ModalScreen>
  )
}