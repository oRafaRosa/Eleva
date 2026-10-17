import { useId } from "react";
import Svg, {
  Defs,
  Image,
  LinearGradient,
  Mask,
  Rect,
  Stop,
} from "react-native-svg";

/** Preserve the original portrait and its alpha; fade only the lower edge. */
export function FoundersPortrait() {
  const id = useId().replace(/:/g, "");
  const gradient = `portrait-gradient-${id}`;
  const mask = `portrait-mask-${id}`;
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 1024 1536"
      accessibilityLabel="As fundadoras do ELEVA"
      accessibilityRole="image"
    >
      <Defs>
        <LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="white" stopOpacity="1" />
          <Stop offset="0.78" stopColor="white" stopOpacity="1" />
          <Stop offset="0.9" stopColor="white" stopOpacity="0.55" />
          <Stop offset="1" stopColor="white" stopOpacity="0" />
        </LinearGradient>
        <Mask
          id={mask}
          x="0"
          y="0"
          width="1024"
          height="1536"
          maskUnits="userSpaceOnUse"
        >
          <Rect width="1024" height="1536" fill={`url(#${gradient})`} />
        </Mask>
      </Defs>
      <Image
        href={require("../../../assets/brand/founders-original.png")}
        width="1024"
        height="1536"
        preserveAspectRatio="xMidYMid meet"
        mask={`url(#${mask})`}
      />
    </Svg>
  );
}
