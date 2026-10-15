import { Tabs, Redirect } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabIcon } from "../../src/components/TabIcon";
import { useEleva } from "../../src/state/AppProvider";
import { Loading, Page, ErrorState } from "../../src/components/ui";
import { colors, fonts } from "../../src/theme";
export default function TabsLayout() {
  const { user, sessionReady, loading, error, refresh, authStatus } =
    useEleva();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  if (!sessionReady || (loading && !user)) return <Loading />;
  if (!user && error && (authStatus === "unknown" || authStatus === "verified"))
    return (
      <Page title="Não foi possível abrir">
        <ErrorState text={error} onRetry={refresh} />
      </Page>
    );
  if (!user) return <Redirect href="/login" />;
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
          height:
            Math.max(72, Math.ceil(64 * fontScale)) +
            Math.max(8, insets.bottom),
          paddingTop: 9,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarLabelPosition: "below-icon",
        tabBarItemStyle: { minWidth: 0, paddingHorizontal: 0 },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 12,
          lineHeight: 18,
          textAlign: "center",
        },
      }}
    >
      {[
        ["home", "Início"],
        ["learn", "Aprender"],
        ["live", "Viver"],
        ["connect", "Conectar"],
        ["profile", "Meu ELEVA"],
      ].map(([name, title]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => <TabIcon name={name} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
