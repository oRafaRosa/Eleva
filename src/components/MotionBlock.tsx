import React, { useEffect, useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  cubicBezier,
  useReducedMotion,
} from "react-native-reanimated";

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
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: ready || reduced ? 1 : 0.7,
          transform: reduced
            ? []
            : [
                { translateY: ready ? 0 : 6 },
                { scale: ready ? 1 : illustration ? 0.94 : 1 },
              ],
          transitionProperty: ["opacity", "transform"],
          transitionDuration: reduced ? 0 : illustration ? 420 : 240,
          transitionTimingFunction: cubicBezier(0.23, 1, 0.32, 1),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
