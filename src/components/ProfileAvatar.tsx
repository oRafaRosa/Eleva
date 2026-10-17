import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { colors, fonts } from "../theme";

/** Keep the footprint stable on missing, expired or failed photos. */
export function ProfileAvatar({
  name,
  uri,
  path,
  size = 48,
}: {
  name: string;
  uri?: string | null;
  path?: string | null;
  size?: number;
}) {
  const [photo, setPhoto] = useState(uri ?? null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setPhoto(uri ?? null);
    setFailed(false);
    const refresh = async () => {
      if (!path || path.startsWith("data:")) return;
      try {
        const { supabase } = await import("../services/supabase");
        const result = await supabase?.storage
          .from("eleva-avatars")
          .createSignedUrl(path, 300);
        if (alive && result?.data?.signedUrl) {
          setPhoto(result.data.signedUrl);
          setFailed(false);
        }
      } catch {
        /* Initials remain available. */
      }
    };
    if (!uri && path) void refresh();
    const timer =
      path && !path.startsWith("data:")
        ? setInterval(() => void refresh(), 240000)
        : undefined;
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [uri, path]);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: colors.pink,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {photo && !failed ? (
        <Image
          source={{ uri: photo }}
          accessibilityLabel={"Foto de " + name}
          onError={() => setFailed(true)}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <Text
          accessible={false}
          style={{
            fontFamily: fonts.serif,
            fontSize: size * 0.43,
            color: colors.burgundy,
          }}
        >
          {name.trim().slice(0, 1).toUpperCase() || "E"}
        </Text>
      )}
    </View>
  );
}
