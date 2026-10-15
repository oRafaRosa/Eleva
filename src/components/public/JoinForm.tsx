import { Linking, View } from "react-native";
import { useState } from "react";
import { Body, Button } from "../ui";
import { clubLinks } from "./links";
export default function JoinForm() {
  const [error, setError] = useState(false);
  return (
    <View style={{ gap: 16 }}>
      <Body>Preencha o formulário e entre para a nossa lista prioritária.</Body>
      <Button
        label="Preencher formulário"
        onPress={() => {
          setError(false);
          void Linking.openURL(clubLinks.form).catch(() => setError(true));
        }}
      />
      {error && (
        <Body>Não foi possível abrir o formulário. Tente novamente.</Body>
      )}
    </View>
  );
}
