import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { Publication } from "../types/domain";
import { colors, fonts, pillarLabels, typeLabels } from "../theme";

export function CompactPublicationRow({ item }: { item: Publication }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${item.title}`}
      onPress={() => router.push(`/content/${item.id}`)}
      style={({ pressed }) => ({
        minHeight: 58,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        backgroundColor: pressed ? colors.pink : "transparent",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      })}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontFamily: fonts.medium,
            fontSize: 17,
            lineHeight: 22,
            color: colors.ink,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 18,
            color: colors.muted,
          }}
        >
          {typeLabels[item.type]} · {pillarLabels[item.pillar]}
        </Text>
      </View>
      <Text
        accessible={false}
        style={{
          fontFamily: fonts.medium,
          fontSize: 18,
          color: colors.burgundy,
        }}
      >
        ↗
      </Text>
    </Pressable>
  );
}
