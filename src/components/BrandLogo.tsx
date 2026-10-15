import { Image } from "react-native";
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
}: {
  width?: number;
  tone?: keyof typeof brandTones;
  decorative?: boolean;
}) {
  return (
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
  );
}
