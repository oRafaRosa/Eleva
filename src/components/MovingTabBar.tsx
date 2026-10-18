import { useEffect, useRef, useState } from "react";
import { Image, View } from "react-native";
import { BottomTabBar, type BottomTabBarProps } from "expo-router/tabs";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme";
import { sealCenter, sealDuration } from "../utils/tabSeal";

const stampSize = 58;
const stamp = Image.resolveAssetSource(require("../../assets/brand/seal.png"));

export function MovingTabBar(props: BottomTabBarProps) {
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  const position = useSharedValue(0);
  const stretch = useSharedValue(1);
  const previousWidth = useRef(0);
  const initialized = useRef(false);
  const index = props.state.index;
  const count = props.state.routes.length;

  useEffect(() => {
    if (width <= 0) return;
    const target = sealCenter(width, index, count) - stampSize / 2;
    const resized = previousWidth.current !== width;
    previousWidth.current = width;
    cancelAnimation(position);
    cancelAnimation(stretch);
    if (!initialized.current || resized || reduced) {
      position.set(target);
      stretch.set(1);
      initialized.current = true;
      setReady(true);
      return;
    }
    const duration = sealDuration(target - position.get(), false);
    position.set(
      withTiming(target, {
        duration,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
    );
    stretch.set(
      withSequence(
        withTiming(1.12, { duration: duration * 0.42 }),
        withTiming(1, {
          duration: duration * 0.58,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ),
    );
  }, [width, index, count, reduced, position, stretch]);

  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.get() },
      { scaleX: stretch.get() },
      { scaleY: 1 - (stretch.get() - 1) * 0.3 },
    ],
  }));

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ backgroundColor: colors.ivory }}
    >
      {width > 0 && ready && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", top: 3, left: 0 }}
        >
          <Animated.Image
            accessible={false}
            source={stamp}
            resizeMode="contain"
            style={[
              {
                width: stampSize,
                height: stampSize,
                tintColor: colors.pink,
                opacity: 0.85,
              },
              animated,
            ]}
          />
        </View>
      )}
      <BottomTabBar {...props} />
    </View>
  );
}
