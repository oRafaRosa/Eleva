import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
  ViewStyle,
  TextStyle,
} from "react-native";
import Animated, {
  useReducedMotion,
  cubicBezier,
} from "react-native-reanimated";
import { router } from "expo-router";
import { colors, fonts, typeLabels, pillarLabels } from "../theme";
import { resolveContentAsset } from "../services/supabase";
import { useEleva } from "../state/AppProvider";
import { Publication } from "../types/domain";
import { Illustration } from "./Illustration";
import { MotionBlock } from "./MotionBlock";
export function Body({
  children,
  muted = false,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  style?: any;
}) {
  return (
    <Text style={[s.body, muted && { color: colors.muted }, style]}>
      {children}
    </Text>
  );
}
export function Title({
  children,
  small = false,
  style,
}: {
  children: React.ReactNode;
  small?: boolean;
  style?: any;
}) {
  return (
    <Text style={[s.title, small && { fontSize: 30, lineHeight: 34 }, style]}>
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const reduce = useReducedMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ alignSelf: "stretch" }}
    >
      <Animated.View
        style={[
          s.button,
          secondary && {
            backgroundColor: "transparent",
            borderColor: colors.burgundy,
          },
          disabled && { opacity: 0.5 },
          {
            transform: [{ scale: pressed && !reduce ? 0.98 : 1 }],
            transitionProperty: ["transform", "opacity"],
            transitionDuration: reduce ? 0 : 120,
            transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
          },
        ]}
      >
        <Text style={[s.buttonText, secondary && { color: colors.burgundy }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
export function Page({
  children,
  title,
  kicker,
  back = false,
  titleStyle,
}: {
  children: React.ReactNode;
  title?: string;
  kicker?: string;
  back?: boolean;
  titleStyle?: TextStyle;
}) {
  const { isDemo } = useEleva();
  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.top}>
        <Pressable
          accessibilityRole="button"
          onPress={() => (back ? router.back() : router.push("/(tabs)/home"))}
        >
          <Text style={s.logo}>{back ? "‹ Voltar" : "ELEVA"}</Text>
        </Pressable>
        <Text style={s.topNote}>Corpo, mente e espírito</Text>
      </View>
      {isDemo && (
        <View
          style={{
            paddingVertical: 9,
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
          }}
        >
          <Body muted style={{ fontSize: 12, lineHeight: 18 }}>
            Prévia • Conteúdos e atividades fictícios
          </Body>
        </View>
      )}
      {kicker && (
        <Body muted style={{ marginTop: 25 }}>
          {kicker}
        </Body>
      )}
      {title && (
        <Title style={[{ marginTop: 8, marginBottom: 24 }, titleStyle]}>
          {title}
        </Title>
      )}
      {children}
      <View style={{ height: 36 }} />
    </ScrollView>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.section}>
      <Title small>{title}</Title>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text style={s.link}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
export function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel || label}
        placeholderTextColor={colors.muted}
        style={[s.input, props.style]}
      />
    </View>
  );
}
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[
        s.chip,
        active && {
          backgroundColor: colors.burgundy,
          borderColor: colors.burgundy,
        },
      ]}
    >
      <Text style={[s.chipText, active && { color: colors.white }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <Body muted>{text}</Body>
    </View>
  );
}
export function Loading() {
  return <ActivityIndicator color={colors.burgundy} style={{ margin: 24 }} />;
}
function ContentCover({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setUrl(null);
    resolveContentAsset(path)
      .then((value) => {
        if (active) setUrl(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [path]);
  return url ? (
    <Image
      accessibilityIgnoresInvertColors
      source={{ uri: url }}
      style={{ width: "100%", height: 190, borderRadius: 4, marginBottom: 16 }}
    />
  ) : null;
}
export function PublicationCard({
  item,
  feature = false,
}: {
  item: Publication;
  feature?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${item.title}`}
      onPress={() => router.push(`/content/${item.id}`)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <Animated.View
        style={[
          s.article,
          feature && s.feature,
          {
            transform: [{ scale: pressed && !reduced ? 0.985 : 1 }],
            transitionProperty: ["transform"],
            transitionDuration: reduced ? 0 : 140,
            transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
          },
        ]}
      >
        {item.cover_path && <ContentCover path={item.cover_path} />}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Body
            style={{
              fontSize: 13,
              color: feature ? colors.pink : colors.muted,
            }}
          >
            {typeLabels[item.type]} / {pillarLabels[item.pillar]}
          </Body>
          {!item.cover_path &&
            ["devotional", "training", "motivation"].includes(item.type) && (
              <MotionBlock illustration>
                <Illustration
                  size={feature ? 92 : 65}
                  light={feature}
                  kind={
                    item.type === "devotional"
                      ? "book"
                      : item.type === "training"
                        ? "movement"
                        : "flower"
                  }
                />
              </MotionBlock>
            )}
        </View>
        <Title
          small
          style={[
            { marginTop: 9, marginBottom: 10 },
            feature && { color: colors.ivory, fontSize: 37, lineHeight: 39 },
          ]}
        >
          {item.title}
        </Title>
        <Body style={feature ? { color: "#EDDBE0" } : undefined}>
          {item.summary}
        </Body>
        <Text
          style={[s.link, { marginTop: 20 }, feature && { color: colors.pink }]}
        >
          {item.type === "devotional"
            ? "Ler devocional"
            : item.type === "training"
              ? "Ver treino"
              : "Abrir conteúdo"}{" "}
          ↗
        </Text>
      </Animated.View>
    </Pressable>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.ivory },
  content: {
    width: "100%",
    maxWidth: 840,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  logo: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.burgundy,
    letterSpacing: 1,
  },
  topNote: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  body: {
    fontFamily: fonts.sans,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 44,
    lineHeight: 46,
    color: colors.burgundy,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 23,
    borderRadius: 4,
    backgroundColor: colors.burgundy,
    borderWidth: 1,
    borderColor: colors.burgundy,
    alignItems: "center",
  },
  buttonText: { fontFamily: fonts.medium, fontSize: 17, color: colors.white },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 16,
    gap: 12,
  },
  link: { fontFamily: fonts.medium, fontSize: 15, color: colors.burgundy },
  input: {
    fontFamily: fonts.sans,
    fontSize: 17,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
    padding: 14,
    color: colors.ink,
  },
  fieldLabel: { fontFamily: fonts.medium, color: colors.ink, fontSize: 15 },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 3,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  article: {
    paddingVertical: 21,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  feature: {
    backgroundColor: colors.burgundy,
    padding: 25,
    borderRadius: 5,
    borderBottomWidth: 0,
  },
  empty: {
    padding: 24,
    backgroundColor: "#F2EBE6",
    borderRadius: 4,
    marginVertical: 16,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  panel: {
    padding: 22,
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 4,
    gap: 12,
  },
});
