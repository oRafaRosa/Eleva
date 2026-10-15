import { useEffect, useState, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { colors, fonts } from "../theme";

const STATE_DURATION = 180;
const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

/** The track follows confirmed activity state, never an optimistic timer. */
export function ChallengeProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const count = Math.max(0, Math.min(completed, total));
  const fraction = total > 0 ? count / total : 0;
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(fraction);
  const trackWidth = useSharedValue(0);
  useEffect(() => {
    progress.set(
      withTiming(fraction, {
        duration: reducedMotion ? 0 : STATE_DURATION,
        easing: easeOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [fraction, reducedMotion, progress]);
  const fillStyle = useAnimatedStyle(() => ({
    // Scaling around the centre plus translation keeps the left edge fixed.
    transform: [
      { translateX: ((progress.get() - 1) * trackWidth.get()) / 2 },
      { scaleX: progress.get() },
    ],
    opacity: progress.get() > 0 ? 1 : 0,
  }));
  return (
    <View style={styles.progress}>
      <Text style={styles.count}>
        {count} de {total} atividades concluídas
      </Text>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Atividades concluídas"
        accessibilityValue={{
          min: 0,
          max: total || 1,
          now: count,
          text: `${count} de ${total} atividades concluídas`,
        }}
        onLayout={(event) => {
          trackWidth.set(event.nativeEvent.layout.width);
        }}
        style={styles.track}
      >
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

/** Only the confirmed `checked` prop changes the checkmark. */
export function ChallengeStepControl({
  title,
  checked,
  onToggle,
}: {
  title: string;
  checked: boolean;
  onToggle: () => Promise<void>;
}) {
  const reducedMotion = useReducedMotion();
  const confirmation = useSharedValue(checked ? 1 : 0);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    confirmation.set(
      withTiming(checked ? 1 : 0, {
        duration: reducedMotion ? 0 : STATE_DURATION,
        easing: easeOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [checked, reducedMotion, confirmation]);
  const fillStyle = useAnimatedStyle(() => ({ opacity: confirmation.get() }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: confirmation.get(),
    transform: [{ scale: 0.96 + confirmation.get() * 0.04 }],
  }));
  async function toggle() {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    try {
      await onToggle();
    } catch {
      // O estado confirmado fica intacto; o aviso da ação mostra como tentar novamente.
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={title}
      accessibilityHint={
        checked ? "Desmarcar atividade" : "Marcar atividade como concluída"
      }
      accessibilityState={{ checked, disabled: pending, busy: pending }}
      disabled={pending}
      onPress={() => void toggle()}
      style={({ pressed }) => [styles.step, pressed && styles.pressed]}
    >
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[styles.checkbox, checked && styles.checkedBorder]}
      >
        <Animated.View style={[styles.checkFill, fillStyle]} />
        <Animated.Text style={[styles.checkmark, markStyle]}>✓</Animated.Text>
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  progress: { gap: 10, paddingTop: 8, paddingBottom: 18 },
  count: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  track: {
    height: 4,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: colors.pink,
  },
  fill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: colors.burgundy,
  },
  step: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  pressed: { backgroundColor: colors.ivory },
  checkbox: {
    height: 24,
    width: 24,
    borderWidth: 1.5,
    borderColor: colors.muted,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  checkedBorder: { borderColor: colors.burgundy },
  checkFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.burgundy,
  },
  checkmark: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 22,
  },
  stepTitle: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink,
  },
});
