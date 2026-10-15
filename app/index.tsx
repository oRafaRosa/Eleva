import { useState } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Page, Body, Title, Button } from "../src/components/ui";
import { colors, fonts } from "../src/theme";
import { BrandLogo } from "../src/components/BrandLogo";
import JoinForm from "../src/components/public/JoinForm";
import { clubLinks } from "../src/components/public/links";

const seal = require("../assets/brand/seal.png");
export default function Welcome() {
  const { width } = useWindowDimensions();
  const wide = width > 640;
  const [linkError, setLinkError] = useState(false);
  function open(url: string) {
    setLinkError(false);
    void Linking.openURL(url).catch(() => setLinkError(true));
  }
  return (
    <Page showBrand={false}>
      <View style={styles.header}>
        <BrandLogo width={wide ? 190 : 145} club />
        <View style={{ maxWidth: wide ? 220 : 150 }}>
          <Button
            secondary
            label="Entrar no app"
            onPress={() => router.push("/login")}
          />
        </View>
      </View>
      <View style={[styles.hero, wide && { flexDirection: "row" }]}>
        <ImageBackground
          source={require("../assets/brand/stationery.jpg")}
          imageStyle={{ opacity: 0.13, width: "100%", height: "100%" }}
          style={[styles.heroCopy, wide && { flex: 1 }]}
        >
          <Title
            style={{ fontSize: wide ? 54 : 43, lineHeight: wide ? 56 : 46 }}
          >
            Bem-vinda ao ELEVA the club.
          </Title>
          <Body style={{ marginTop: 20 }}>
            Experiências, conexões e desenvolvimento.
          </Body>
          <Body style={{ marginTop: 12 }}>
            Um ecossistema feminino que integra corpo, mente e espírito.
          </Body>
          <View style={{ gap: 12, marginTop: 28 }}>
            <Button
              label="Convite de lançamento · 24.10"
              onPress={() => router.push("/convite")}
            />
            <Button
              secondary
              label="Entrar no grupo VIP"
              onPress={() => open(clubLinks.whatsapp)}
            />
          </View>
        </ImageBackground>
        <Image
          source={require("../assets/brand/founders.jpg")}
          accessibilityLabel="As fundadoras do ELEVA the club"
          resizeMode="cover"
          style={
            wide
              ? { width: "44%", height: 560 }
              : { width: "100%", aspectRatio: 2 / 3 }
          }
        />
      </View>
      <ImageBackground
        source={require("../assets/brand/floral-paper.jpg")}
        resizeMode="cover"
        style={styles.about}
        imageStyle={{ opacity: 0.35, width: "100%", height: "100%" }}
      >
        <Image source={seal} accessible={false} style={styles.seal} />
        <Title small>Conheça o ELEVA</Title>
        <Body>
          A ELEVA é um ecossistema feminino de transformação, conexão e
          experiências, criado para mulheres que desejam viver, crescer e se
          conectar em outro nível.
        </Body>
        <Body>
          Mais do que um clube, somos um ambiente de pertencimento,
          desenvolvimento e novas possibilidades, onde cada encontro é uma
          oportunidade de aprender, criar conexões genuínas, viver experiências
          extraordinárias e descobrir novas versões de si mesma.
        </Body>
        <Body>
          Acreditamos que uma mulher se eleva por inteiro quando cuida do corpo,
          da mente e do espírito. Por isso, criamos experiências que inspiram,
          fortalecem e impulsionam mulheres a viver uma vida com mais propósito,
          equilíbrio e significado.
        </Body>
        <Body>
          Porque quando uma mulher se eleva, tudo ao seu redor também se
          transforma.
        </Body>
        <View style={[styles.pillars, wide && { flexDirection: "row" }]}>
          {["Corpo", "Mente", "Espírito"].map((label) => (
            <Text key={label} style={styles.pillar}>
              {label}
            </Text>
          ))}
        </View>
      </ImageBackground>
      <View style={styles.section}>
        <Title small>Nossos canais</Title>
        <Body>Entre no grupo VIP para acompanhar as novidades do clube.</Body>
        <Button
          label="Quero entrar no grupo VIP"
          onPress={() => open(clubLinks.whatsapp)}
        />
        <View style={styles.soon}>
          <Body>ELEVA em voz alta</Body>
          <Body muted>Em breve</Body>
        </View>
        <View style={styles.soon}>
          <Body>Baixe nosso aplicativo</Body>
          <Body muted>Em breve</Body>
        </View>
        {linkError && (
          <Body>Não foi possível abrir o link. Tente novamente.</Body>
        )}
      </View>
      <View style={styles.section}>
        <Image
          source={seal}
          accessible={false}
          style={{ width: 52, height: 52 }}
        />
        <Title small>Faça parte do clube</Title>
        <JoinForm />
      </View>
      <View style={styles.footer}>
        <BrandLogo width={140} club />
        <Button
          secondary
          label="@elevatheclub no Instagram"
          onPress={() => open(clubLinks.instagram)}
        />
        <Body muted style={{ fontSize: 14 }}>
          ELEVA the club · Corpo, mente e espírito
        </Body>
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 18,
    flexWrap: "wrap",
  },
  hero: { backgroundColor: colors.pink, overflow: "hidden", marginTop: 12 },
  heroCopy: { padding: 28, justifyContent: "center" },
  about: {
    overflow: "hidden",
    marginTop: 40,
    padding: 28,
    gap: 20,
    backgroundColor: "#F8EEE5",
  },
  seal: { width: 80, height: 80, marginBottom: 4 },
  pillars: { gap: 16, marginTop: 16, flexWrap: "wrap" },
  pillar: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.burgundy,
    flexGrow: 1,
  },
  section: {
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderColor: colors.line,
    gap: 20,
  },
  soon: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  footer: { gap: 22, paddingVertical: 32 },
});
