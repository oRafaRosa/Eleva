import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Page, Body, Title, Button, s } from "../src/components/ui";
import { colors, fonts } from "../src/theme";
import { Illustration } from "../src/components/Illustration";
import { MotionBlock } from "../src/components/MotionBlock";
export default function Welcome() {
  const wide = useWindowDimensions().width > 640;
  return (
    <Page>
      <View style={[styles.hero, wide && { padding: 48 }]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Text style={styles.wordmark}>ELEVA</Text>
          <MotionBlock illustration>
            <Illustration kind="flower" size={wide ? 112 : 76} />
          </MotionBlock>
        </View>
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
            label="Entrar na ELEVA"
            onPress={() => {
              router.push("/login");
            }}
          />
        </View>
      </View>
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
