import { Image, View, Text } from "react-native";
import { colors } from "../theme";

export const brandTones = {
  burgundy: colors.burgundy,
  pink: colors.pink,
  ivory: colors.ivory,
  white: colors.white,
} as const;

/** One shared silhouette keeps the official lettering identical in every tone. */
export function BrandLogo({
  width = 112,
  tone = "burgundy",
  decorative = false,
  club = true,
}: {
  width?: number;
  tone?: keyof typeof brandTones;
  decorative?: boolean;
  club?: boolean;
}) {
  return (
    <View style={{ alignItems: "flex-end" }}>
      <Image
        source={require("../../assets/brand/eleva-burgundy.png")}
        resizeMode="contain"
        accessible={!decorative}
        accessibilityRole="image"
        accessibilityLabel={decorative ? undefined : "ELEVA"}
        style={{
          width,
          height: (width * 440) / 1600,
          tintColor: brandTones[tone],
        }}
      />
      {club && (
        <Text
          style={{
            fontFamily: "Allura_400Regular",
            fontSize: width * 0.22,
            lineHeight: width * 0.25,
            color: brandTones[tone],
            marginTop: -width * 0.02,
          }}
        >
          the club
        </Text>
      )}
    </View>
  );
}
