import React, { useCallback } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { useFocusEffect } from "expo-router";

export function MotionBlock({
  children,
  style,
  illustration = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  illustration?: boolean;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  useFocusEffect(
    useCallback(() => {
      progress.set(reduced ? 1 : 0);
      progress.set(
        withTiming(1, {
          duration: reduced ? 0 : illustration ? 420 : 280,
          easing: Easing.bezier(0.23, 1, 0.32, 1),
        }),
      );
      return () => cancelAnimation(progress);
    }, [progress, reduced, illustration]),
  );
  const animated = useAnimatedStyle(() => ({
    opacity: reduced ? 1 : 0.65 + progress.get() * 0.35,
    transform: reduced
      ? []
      : [
          { translateY: (1 - progress.get()) * 7 },
          { scale: illustration ? 0.96 + progress.get() * 0.04 : 1 },
        ],
  }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
