import { useState } from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import { Page, Body, Button } from "../ui";
import { BrandLogo } from "../BrandLogo";
import { colors, fonts } from "../../theme";
import { invitation } from "./motion";

/** Native builds retain the accessible invitation; the 3D scroll scene is web-only. */
export default function Invitation() {
  const [error, setError] = useState(false);
  return (
    <Page back backHref="/" showBrand={false}>
      <View style={s.letter}>
        <Body style={s.date}>{invitation.date}</Body>
        <Text style={s.title}>{invitation.title}</Text>
        <Text style={s.subtitle}>{invitation.subtitle}</Text>
        <Body style={s.copy}>{invitation.introduction}</Body>
        <Body style={s.copy}>
          Uma experiência presencial que une wellness, desenvolvimento pessoal,
          posicionamento e conexões.
        </Body>
        <Body style={s.copy}>E o lançamento oficial do</Body>
        <View style={s.signature}>
          <BrandLogo width={150} />
          <Text style={s.club}>the club</Text>
        </View>
        <Body style={s.copy}>{invitation.closing}</Body>
        <Text style={s.date}>24.10 | Vagas limitadas</Text>
        <Text style={s.subtitle}>Seu próximo nível começa aqui.</Text>
      </View>
      <Button
        label="Quero saber mais no Instagram"
        onPress={async () => {
          try {
            setError(false);
            await Linking.openURL(invitation.instagram);
          } catch {
            setError(true);
          }
        }}
      />
      {error && (
        <Body>Não foi possível abrir o Instagram. Tente novamente.</Body>
      )}
    </Page>
  );
}
const s = StyleSheet.create({
  letter: {
    backgroundColor: "#F4E6D2",
    padding: 26,
    marginVertical: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.pink,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 38,
    color: colors.burgundy,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.serif,
    fontSize: 23,
    color: colors.burgundy,
    textAlign: "center",
    fontStyle: "italic",
  },
  copy: { textAlign: "center", marginVertical: 10 },
  date: {
    textAlign: "center",
    color: colors.burgundy,
    fontSize: 17,
    marginVertical: 12,
  },
  signature: { alignItems: "center", gap: 4, marginBottom: 12 },
  club: {
    fontFamily: "Allura_400Regular",
    fontSize: 24,
    color: colors.burgundy,
  },
});
