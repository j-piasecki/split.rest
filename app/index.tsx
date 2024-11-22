import { login, logout, useAuth } from "@utils/auth";
import { View, Text, Button } from "react-native";

export default function Screen() {
  const user = useAuth();

  return (
    <View style={{flex: 1}}>
      {user === undefined && <Text>Loading...</Text>}
      {user === null && <Button title="Login" onPress={login} />}
      {user && <Button title="Logout" onPress={logout} />}
    </View>
  )
}