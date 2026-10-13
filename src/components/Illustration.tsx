import { View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect, G } from "react-native-svg";
import { colors } from "../theme";

export type IllustrationKind = "book" | "flower" | "movement" | "coffee";

export function Illustration({
  kind = "flower",
  size = 100,
  light = false,
}: {
  kind?: IllustrationKind;
  size?: number;
  light?: boolean;
}) {
  const ink = light ? colors.pink : colors.burgundy;
  const fill = light ? "#75394D" : "#F2E2E6";
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        accessibilityElementsHidden
      >
        <Circle cx="60" cy="60" r="49" fill={fill} opacity={0.65} />
        <G
          stroke={ink}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {kind === "book" && (
            <>
              <Path d="M20 37 Q38 29 59 38 Q80 29 100 37 L100 86 Q79 79 60 88 Q38 79 20 86 Z" />
              <Path d="M60 39 L60 87 M29 47 Q40 43 50 48 M29 57 Q40 53 50 58 M71 47 Q82 43 91 48 M71 57 Q82 53 91 58" />
              <Path d="M81 19 L81 29 M76 24 L86 24 M34 21 L37 26" />
            </>
          )}
          {kind === "flower" && (
            <>
              <Path d="M60 100 L60 60 M60 85 Q41 65 34 73 Q36 91 60 93 M60 77 Q79 57 89 66 Q86 85 60 86" />
              <Ellipse cx="60" cy="29" rx="9" ry="15" />
              <Ellipse
                cx="42"
                cy="40"
                rx="9"
                ry="15"
                transform="rotate(-58 42 40)"
              />
              <Ellipse
                cx="78"
                cy="40"
                rx="9"
                ry="15"
                transform="rotate(58 78 40)"
              />
              <Ellipse
                cx="49"
                cy="60"
                rx="9"
                ry="15"
                transform="rotate(35 49 60)"
              />
              <Ellipse
                cx="71"
                cy="60"
                rx="9"
                ry="15"
                transform="rotate(-35 71 60)"
              />
              <Circle cx="60" cy="45" r="8" fill={fill} />
            </>
          )}
          {kind === "movement" && (
            <>
              <Circle cx="65" cy="26" r="8" />
              <Path d="M63 36 Q57 48 63 60 L78 78 M63 60 L47 80 L30 80 M61 43 L41 49 L29 39 M63 43 L80 47 L92 36 M78 78 L95 82" />
              <Path d="M23 97 Q60 91 101 97 M23 20 Q31 16 36 22 M96 59 L102 56" />
            </>
          )}
          {kind === "coffee" && (
            <>
              <Path d="M27 49 L76 49 L73 79 Q71 88 52 88 Q34 88 31 79 Z M76 53 Q97 49 96 63 Q95 75 75 74 M20 94 Q55 100 90 94" />
              <Path d="M42 36 Q32 26 42 16 M57 36 Q47 26 57 16 M73 37 Q63 27 73 17" />
            </>
          )}
        </G>
      </Svg>
    </View>
  );
}
