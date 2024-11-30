import { TextInput as TextInputRN, TextInputProps } from "react-native";

interface Props extends TextInputProps {}

export function TextInput(props: Props) {
  return <TextInputRN {...props} />;

}