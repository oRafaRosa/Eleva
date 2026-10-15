import React, { useState, useEffect, useRef, forwardRef } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  useReducedMotion,
  cubicBezier,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { colors, fonts, typeLabels, pillarLabels } from "../theme";
import { resolveContentAsset } from "../services/supabase";
import { Publication } from "../types/domain";
import { Illustration } from "./Illustration";
import { MotionBlock } from "./MotionBlock";
import { useEleva } from "../state/AppProvider";
import { BrandLogo } from "./BrandLogo";
export function Body({
  children,
  muted = false,
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  muted?: boolean;
  style?: any;
  numberOfLines?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[s.body, muted && { color: colors.muted }, style]}
    >
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
  busy = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  busy?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const reduce = useReducedMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ alignSelf: "stretch", minWidth: 0 }}
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
  actions,
  onBack,
  backHref = "/(tabs)/home",
  showBrand = true,
}: {
  children: React.ReactNode;
  title?: string;
  kicker?: string;
  back?: boolean;
  titleStyle?: TextStyle;
  actions?: React.ReactNode;
  onBack?: () => void;
  backHref?: Href;
  showBrand?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={s.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled={Platform.OS !== "web"}
    >
      <ScrollView
        style={s.page}
        contentContainerStyle={[
          s.content,
          { paddingBottom: 30 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {(showBrand || back) && (
          <View style={s.top}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={back ? "Voltar" : "ELEVA, início"}
              style={{ minHeight: 48, justifyContent: "center" }}
              onPress={() => {
                if (!back) {
                  router.navigate("/(tabs)/home");
                  return;
                }
                if (onBack) {
                  onBack();
                  return;
                }
                if (router.canGoBack()) router.back();
                else router.replace(backHref);
              }}
            >
              {back ? (
                <Text
                  style={{
                    fontFamily: fonts.medium,
                    fontSize: 17,
                    color: colors.burgundy,
                  }}
                >
                  ‹ Voltar
                </Text>
              ) : (
                <BrandLogo decorative />
              )}
            </Pressable>
          </View>
        )}
        {back && kicker && (
          <Body muted style={{ marginTop: 12, fontSize: 14 }}>
            {kicker}
          </Body>
        )}
        {(title || actions) && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 16,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            {title && (
              <Title
                style={[
                  { fontSize: 34, lineHeight: 40, flexShrink: 1 },
                  titleStyle,
                ]}
              >
                {title}
              </Title>
            )}
            {actions}
          </View>
        )}
        {children}
        <View style={{ height: 36 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
      <Title small style={{ fontSize: 26, lineHeight: 30 }}>
        {title}
      </Title>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={{
            minHeight: 48,
            minWidth: 48,
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Text style={s.link}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
export const Field = forwardRef<
  TextInput,
  { label: string } & React.ComponentProps<typeof TextInput>
>(function Field({ label, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        ref={ref}
        accessibilityLabel={props.accessibilityLabel || label}
        placeholderTextColor={colors.muted}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          s.input,
          { borderColor: focused ? colors.burgundy : colors.controlLine },
          props.style,
        ]}
      />
    </View>
  );
});
export function ErrorState({
  text,
  onRetry,
}: {
  text: string;
  onRetry: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  return (
    <View accessibilityRole="alert" style={{ gap: 12, marginVertical: 12 }}>
      <Body muted>{text}</Body>
      <Button
        secondary
        busy={busy}
        label={busy ? "Carregando…" : "Tentar novamente"}
        onPress={() => {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          void Promise.resolve()
            .then(onRetry)
            .catch(() => {})
            .finally(() => {
              lock.current = false;
              setBusy(false);
            });
        }}
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
  const reduced = useReducedMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          s.chip,
          active && {
            backgroundColor: colors.burgundy,
            borderColor: colors.burgundy,
          },
          {
            transitionProperty: ["backgroundColor", "borderColor"],
            transitionDuration: reduced ? 0 : 160,
          },
        ]}
      >
        <Text style={[s.chipText, active && { color: colors.white }]}>
          {label}
        </Text>
      </Animated.View>
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
export function ContentCover({
  path,
  variant = "thumbnail",
}: {
  path: string;
  variant?: "thumbnail" | "banner" | "detail";
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const { isDemo } = useEleva();
  useEffect(() => {
    let active = true;
    setUrl(null);
    setFailed(false);
    if (
      isDemo &&
      path.length <= 1500000 &&
      /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(path)
    ) {
      setUrl(path);
      return () => {
        active = false;
      };
    }
    resolveContentAsset(path)
      .then((value) => {
        if (active) setUrl(value);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [path, isDemo]);
  const frame: ViewStyle =
    variant === "thumbnail"
      ? { width: 84, height: 84, borderRadius: 4, flexShrink: 0 }
      : {
          width: "100%",
          height: variant === "detail" ? 240 : 128,
          borderRadius: 4,
          marginBottom: 16,
        };
  return (
    <View
      style={[
        frame,
        {
          backgroundColor: colors.pink,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      {failed ? (
        <Text
          accessibilityLabel="Imagem indisponível"
          style={{
            fontFamily: fonts.sans,
            fontSize: variant === "thumbnail" ? 12 : 14,
            color: colors.burgundy,
            textAlign: "center",
            padding: 4,
          }}
        >
          Sem imagem
        </Text>
      ) : url ? (
        <Image
          accessibilityIgnoresInvertColors
          source={{ uri: url }}
          accessible={false}
          onError={() => setFailed(true)}
          resizeMode={variant === "detail" ? "contain" : "cover"}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </View>
  );
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
        {item.cover_path && feature && (
          <ContentCover path={item.cover_path} variant="banner" />
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Body
              style={{
                fontSize: 13,
                color: feature ? colors.pink : colors.muted,
              }}
            >
              {typeLabels[item.type]} / {pillarLabels[item.pillar]}
            </Body>
            <Title
              small
              style={[
                { marginTop: 6, marginBottom: 10 },
                feature && {
                  color: colors.ivory,
                  fontSize: 34,
                  lineHeight: 37,
                },
              ]}
            >
              {item.title}
            </Title>
          </View>
          {item.cover_path && !feature && (
            <ContentCover path={item.cover_path} />
          )}
          {!item.cover_path &&
            ["devotional", "training", "motivation"].includes(item.type) && (
              <MotionBlock illustration>
                <Illustration
                  size={feature ? 64 : 40}
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
        <Body
          numberOfLines={feature ? 3 : 2}
          style={feature ? { color: "#EDDBE0" } : undefined}
        >
          {item.summary}
        </Body>
        <Text
          style={[s.link, { marginTop: 12 }, feature && { color: colors.pink }]}
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
    paddingTop: 12,
    paddingBottom: 30,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
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
  buttonText: {
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    flexShrink: 1,
    color: colors.white,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
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
    minHeight: 48,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 3,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  article: {
    paddingVertical: 16,
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
