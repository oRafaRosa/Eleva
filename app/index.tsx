import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Page, Body, Title, Button, s } from "../src/components/ui";
import { colors, fonts } from "../src/theme";
import { useEleva } from "../src/state/AppProvider";
export default function Welcome() {
  const { enterDemo } = useEleva();
  const wide = useWindowDimensions().width > 640;
  return (
    <Page>
      <View style={[styles.hero, wide && { padding: 48 }]}>
        <Text style={styles.wordmark}>ELEVA</Text>
        <View style={styles.rule} />
        <Title style={styles.headline}>
          Um espaço para{wide ? " " : "\n"}cuidar de você.
        </Title>
        <Body style={styles.intro}>
          Devocionais, movimento e encontros entre mulheres. Corpo, mente e
          espírito fazem parte da mesma conversa.
        </Body>
        <View style={{ gap: 12, marginTop: 32 }}>
          <Button
            label="Conhecer a plataforma"
            onPress={() => {
              enterDemo();
              router.push("/(tabs)/home");
            }}
          />
          <Button
            secondary
            label="Já faço parte. Quero entrar"
            onPress={() => router.push("/login")}
          />
        </View>
      </View>
      <View style={styles.about}>
        <Title small>Encontros entre mulheres.</Title>
        <Body muted style={{ marginTop: 14 }}>
          A ELEVA reúne conteúdos para o dia a dia e experiências para estar
          perto. Você encontra leituras, aulas, treinos e atividades em um só
          lugar.
        </Body>
      </View>
      <View style={styles.pillars}>
        {[
          ["Corpo", "Movimento, treinos e cuidado com a saúde."],
          ["Mente", "Conversas, aprendizados e tempo para respirar."],
          ["Espírito", "Devocionais, oração e reflexão."],
        ].map(([title, text]) => (
          <View key={title} style={styles.pillar}>
            <Title small>{title}</Title>
            <Body muted>{text}</Body>
          </View>
        ))}
      </View>
      <Body muted style={{ fontSize: 13, marginTop: 28 }}>
        Esta primeira versão apresenta a experiência com conteúdos de exemplo. A
        programação oficial será publicada pela equipe ELEVA.
      </Body>
    </Page>
  );
}
const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.pink,
    padding: 28,
    paddingTop: 36,
    marginTop: 24,
    borderRadius: 3,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 78,
    lineHeight: 85,
    color: colors.burgundy,
    letterSpacing: 3,
  },
  rule: {
    width: 44,
    height: 1,
    backgroundColor: colors.rose,
    marginVertical: 23,
  },
  headline: { fontSize: 48, lineHeight: 48 },
  intro: { marginTop: 19, maxWidth: 440, color: colors.ink },
  about: {
    paddingVertical: 35,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  pillars: { gap: 25, marginTop: 29 },
  pillar: { gap: 6 },
});
