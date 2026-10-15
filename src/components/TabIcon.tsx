import Svg, { Path, Circle } from "react-native-svg";
import { View, Image, type ColorValue } from "react-native";
import { colors } from "../theme";

export function TabIcon({
  name,
  color,
  selected = false,
}: {
  name: string;
  color: ColorValue;
  selected?: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {selected && (
        <Image
          source={require("../../assets/brand/seal.png")}
          accessible={false}
          resizeMode="contain"
          style={{
            position: "absolute",
            width: 58,
            height: 58,
            left: -17,
            top: -6,
            tintColor: colors.pink,
            opacity: 0.85,
          }}
        />
      )}
      <Svg
        accessible={false}
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {name === "home" ? (
          <Path d="M3 10 12 3l9 7v11h-6v-7H9v7H3Z" />
        ) : name === "learn" ? (
          <Path d="M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v16" />
        ) : name === "live" ? (
          <>
            <Path d="M3 8v8m3-11v14m12-14v14m3-11v8M6 12h12" />
          </>
        ) : name === "connect" ? (
          <Path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.7 0-3.3-.5-4.6-1.3L3 21l1.5-5.2A8.5 8.5 0 1 1 21 11.5Z" />
        ) : (
          <>
            <Circle cx={12} cy={7} r={4} />
            <Path d="M4 21v-2a8 8 0 0 1 16 0v2" />
          </>
        )}
      </Svg>
    </View>
  );
}
