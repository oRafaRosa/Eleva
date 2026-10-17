import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  AccessibilityInfo,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Body, Title, Button } from "../src/components/ui";
import { colors, fonts } from "../src/theme";
import { BrandLogo } from "../src/components/BrandLogo";
import { FoundersPortrait } from "../src/components/public/FoundersPortrait";
import JoinForm from "../src/components/public/JoinForm";
import { clubLinks } from "../src/components/public/links";

import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACKGROUND_TRAVEL = 120;
const seal = require("../assets/brand/seal.png");
export default function Welcome() {
  const { width } = useWindowDimensions();
  const wide = width > 900;
  const insets = useSafeAreaInsets();
  const panelWidth = Math.min(width - 40, 760);
  const systemReducedMotion = useReducedMotion();
  const [reducedMotion, setReducedMotion] = useState(systemReducedMotion);
  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(1);
  const viewportHeight = useSharedValue(1);

  useEffect(() => {
    let active = true;
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReducedMotion(enabled);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(Math.max(0, event.contentOffset.y));
  });
  const backgroundMotion = useAnimatedStyle(() => {
    // Travel spans the whole page, with overscan to keep every edge covered.
    const range = Math.max(1, contentHeight.get() - viewportHeight.get());
    const progress = Math.min(1, scrollY.get() / range);
    return {
      transform: [
        { translateY: reducedMotion ? 0 : -progress * BACKGROUND_TRAVEL },
      ],
    };
  });
  const portraitMotion = useAnimatedStyle(() => ({
    // A small extra movement makes the portrait independent of the stationery.
    transform: [
      { translateY: reducedMotion ? 0 : -Math.min(scrollY.get() * 0.055, 42) },
    ],
  }));
  const [linkError, setLinkError] = useState(false);
  function open(url: string) {
    setLinkError(false);
    void Linking.openURL(url).catch(() => setLinkError(true));
  }
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled={Platform.OS !== "web"}
      onLayout={(event) => viewportHeight.set(event.nativeEvent.layout.height)}
    >
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID="landing-background"
        style={[styles.background, backgroundMotion]}
      >
        <Image
          source={require("../assets/brand/stationery-fullpage.jpg")}
          resizeMode="cover"
          accessible={false}
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        />
        <View style={styles.backgroundTint} />
      </Animated.View>
      <Animated.ScrollView
        testID="landing-scroll"
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(_, height) => contentHeight.set(height)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <BrandLogo width={wide ? 190 : width < 360 ? 120 : 145} club />
            <View style={{ maxWidth: wide ? 220 : 150 }}>
              <Button
                secondary
                label="Entrar no app"
                onPress={() => router.push("/login")}
              />
            </View>
          </View>
          <View style={[styles.hero, wide && styles.heroWide]}>
            <View style={[styles.portraitFrame, wide && styles.portraitWide]}>
              <Animated.View
                testID="landing-portrait"
                style={[styles.portrait, portraitMotion]}
              >
                <FoundersPortrait />
              </Animated.View>
            </View>
            <View style={[styles.heroCopy, wide && styles.heroCopyWide]}>
              <Title
                style={{ fontSize: wide ? 54 : 43, lineHeight: wide ? 56 : 46 }}
              >
                Bem-vinda ao ELEVA
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
            </View>
          </View>
          <View style={[styles.about, { width: panelWidth }]}>
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
              oportunidade de aprender, criar conexões genuínas, viver
              experiências extraordinárias e descobrir novas versões de si
              mesma.
            </Body>
            <Body>
              Acreditamos que uma mulher se eleva por inteiro quando cuida do
              corpo, da mente e do espírito. Por isso, criamos experiências que
              inspiram, fortalecem e impulsionam mulheres a viver uma vida com
              mais propósito, equilíbrio e significado.
            </Body>
            <Body>
              Porque quando uma mulher se eleva, tudo ao seu redor também se
              transforma.
            </Body>
            <View style={styles.pillars} testID="landing-pillars">
              {["Corpo", "Mente", "Espírito"].map((label) => (
                <Text key={label} style={styles.pillar}>
                  {label}
                </Text>
              ))}
            </View>
          </View>
          <View style={[styles.section, { width: panelWidth }]}>
            <Title small>Nossos canais</Title>
            <Body>
              Entre no grupo VIP para acompanhar as novidades do clube.
            </Body>
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
          <View style={[styles.section, { width: panelWidth }]}>
            <Image
              source={seal}
              accessible={false}
              style={{ width: 52, height: 52 }}
            />
            <Title small>Faça parte do clube</Title>
            <JoinForm />
          </View>
          <View style={[styles.footer, { width: panelWidth }]}>
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
        </View>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.pink, overflow: "hidden" },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: -BACKGROUND_TRAVEL,
  },
  backgroundTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(251,247,243,0.12)",
  },
  scroll: { flex: 1 },
  content: { width: "100%", maxWidth: 1120, alignSelf: "center" },
  portraitFrame: { width: "100%", aspectRatio: 2 / 3, overflow: "hidden" },
  portraitWide: { width: "50%" },
  portrait: { width: "100%", height: "100%" },
  heroWide: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroCopyWide: { flex: 1, marginHorizontal: 24, marginTop: 0, padding: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: colors.ivory,
    zIndex: 2,
    flexWrap: "wrap",
  },
  hero: { marginTop: 0 },
  heroCopy: {
    padding: 24,
    marginTop: -56,
    zIndex: 1,
    marginHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "rgba(251,247,243,0.97)",
  },
  about: {
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 40,
    padding: 24,
    gap: 20,
    backgroundColor: "rgba(251,247,243,0.97)",
    marginHorizontal: 20,
  },
  seal: { width: 80, height: 80, marginBottom: 4 },
  pillars: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  pillar: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 30,
    color: colors.burgundy,
    flexGrow: 1,
    flexShrink: 1,
    textAlign: "center",
  },
  section: {
    padding: 24,
    alignSelf: "center",
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "rgba(251,247,243,0.97)",
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
  footer: {
    gap: 22,
    padding: 24,
    alignSelf: "center",
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: "rgba(251,247,243,0.97)",
  },
});
