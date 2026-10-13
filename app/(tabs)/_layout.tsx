import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors, fonts } from "../../src/theme";
export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        animation: "none",
        headerShown: false,
        tabBarActiveTintColor: colors.burgundy,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.ivory,
          borderTopColor: colors.line,
          height: 72,
          paddingTop: 9,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
      }}
    >
      {[
        ["home", "Início", "⌂"],
        ["learn", "Aprender", "▤"],
        ["live", "Viver", "◉"],
        ["connect", "Conectar", "◎"],
        ["profile", "Meu ELEVA", "○"],
      ].map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 23, color }}>{icon}</Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
