import { Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { Body } from "./ui";
import { colors } from "../theme";

export function SocialAction({
  kind,
  count,
  active = false,
  disabled = false,
  onPress,
}: {
  kind: "heart" | "comment";
  count: number;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        kind === "heart"
          ? `${active ? "Descurtir" : "Curtir"}, ${count} curtidas`
          : `${count} comentários. Comentar`
      }
      accessibilityState={{
        disabled,
        ...(kind === "heart" ? { selected: active } : {}),
      }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 48,
        minWidth: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingRight: 16,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: active ? 1.08 : 1 }],
          transitionProperty: ["transform"],
          transitionDuration: reduced ? 0 : 160,
        }}
      >
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill={kind === "heart" && active ? colors.burgundy : "none"}
          stroke={colors.burgundy}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path
            d={
              kind === "heart"
                ? "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"
                : "M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.7 0-3.3-.5-4.6-1.3L3 21l1.5-5.2A8.5 8.5 0 1 1 21 11.5Z"
            }
          />
        </Svg>
      </Animated.View>
      <Body style={{ fontSize: 15, color: colors.burgundy }}>{count}</Body>
    </Pressable>
  );
}
