import { useEffect, useRef, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import {
  Body,
  Button,
  Empty,
  Field,
  Loading,
  Page,
} from "../src/components/ui";
import { useEleva } from "../src/state/AppProvider";
import { colors, fonts } from "../src/theme";
import { decodeAvatar } from "../src/services/profileValidation";

export default function EditProfile() {
  const { user, sessionReady, loading, isDemo, updateProfile } = useEleva();
  const [name, setName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [photo, setPhoto] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const active = useRef(true);
  const saveLock = useRef(false);
  const pickerLock = useRef(false);
  const identity = useRef(user?.id);
  identity.current = user?.id;
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    setName(user?.full_name ?? "");
    setPhone(user?.phone ?? "");
    setCity(user?.city ?? "");
    setPhoto(undefined);
  }, [user?.id]);
  async function choosePhoto() {
    if (pickerLock.current || saveLock.current || !user) return;
    pickerLock.current = true;
    const accountId = user.id;
    setPreparing(true);
    setError("");
    // Invoke synchronously from the press, preserving Safari's user activation.
    try {
      const selection = ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        allowsEditing: false,
        quality: 1,
        exif: false,
      });
      const result = await selection;
      if (
        result.canceled ||
        !result.assets?.[0] ||
        !active.current ||
        identity.current !== accountId
      )
        return;
      const asset = result.assets[0];
      const sourceSize = asset.fileSize ?? asset.file?.size;
      if (!sourceSize)
        throw new Error(
          "Não foi possível verificar o tamanho da foto. Escolha outra imagem.",
        );
      if (sourceSize > 10 * 1024 * 1024)
        throw new Error("Escolha uma foto de até 10 MB.");
      if (
        asset.mimeType &&
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/heic",
          "image/heif",
        ].includes(asset.mimeType)
      )
        throw new Error("Use uma foto JPG, PNG, WebP ou HEIC.");
      if (
        !asset.width ||
        !asset.height ||
        asset.width * asset.height > 40000000
      )
        throw new Error("Escolha uma foto com resolução menor.");
      setPreparing(true);
      const size = Math.min(asset.width, asset.height);
      const context = ImageManipulator.manipulate(asset.uri);
      context.crop({
        originX: Math.floor((asset.width - size) / 2),
        originY: Math.floor((asset.height - size) / 2),
        width: size,
        height: size,
      });
      context.resize({ width: 640, height: 640 });
      const image = await context.renderAsync();
      const saved = await image
        .saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.8,
          base64: true,
        })
        .finally(() => {
          image.release();
          context.release();
        });
      if (!saved.base64)
        throw new Error(
          "Não foi possível preparar a foto. Escolha outra imagem.",
        );
      decodeAvatar(saved.base64);
      if (active.current && identity.current === accountId)
        setPhoto(saved.base64);
    } catch (e) {
      if (active.current && identity.current === accountId)
        setError(
          e instanceof Error
            ? e.message
            : "Não foi possível abrir a foto. Escolha outra imagem.",
        );
    } finally {
      pickerLock.current = false;
      if (active.current && identity.current === accountId) setPreparing(false);
    }
  }
  async function save() {
    if (saveLock.current || pickerLock.current || !user) return;
    saveLock.current = true;
    const accountId = user.id;
    setBusy(true);
    setError("");
    try {
      await updateProfile({
        full_name: name,
        phone,
        city,
        avatar_base64: photo,
      });
      if (active.current && identity.current === accountId)
        router.replace("/(tabs)/profile");
    } catch (e) {
      if (active.current && identity.current === accountId)
        setError(
          e instanceof Error
            ? e.message
            : "Não foi possível salvar seu perfil. Tente novamente.",
        );
    } finally {
      saveLock.current = false;
      if (active.current && identity.current === accountId) setBusy(false);
    }
  }
  if (!sessionReady || (loading && !user)) return <Loading />;
  if (!user) return <Redirect href="/login" />;
  const uri =
    photo === undefined
      ? user.avatar_url
      : photo
        ? `data:image/jpeg;base64,${photo}`
        : null;
  return (
    <Page back title="Editar perfil">
      <View style={{ gap: 24 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <View
            style={{
              height: 96,
              width: 96,
              borderRadius: 48,
              overflow: "hidden",
              backgroundColor: colors.pink,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {uri ? (
              <Image
                accessibilityLabel="Sua foto de perfil"
                source={{ uri }}
                style={{ width: 96, height: 96 }}
              />
            ) : (
              <Text
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 38,
                  color: colors.burgundy,
                }}
              >
                {name.trim().slice(0, 1).toUpperCase() || "E"}
              </Text>
            )}
          </View>
          <View style={{ gap: 8 }}>
            <Button
              secondary
              label={preparing ? "Preparando foto…" : "Escolher foto"}
              disabled={busy || preparing}
              onPress={() => void choosePhoto()}
            />
            {(uri || photo !== undefined) && (
              <Button
                secondary
                label="Remover foto"
                disabled={busy || preparing}
                onPress={() => setPhoto(null)}
              />
            )}
          </View>
        </View>
        <Field
          label="Nome"
          value={name}
          onChangeText={setName}
          maxLength={120}
          autoComplete="name"
          editable={!busy}
        />
        <Field
          label="Telefone"
          value={phone}
          onChangeText={setPhone}
          maxLength={30}
          keyboardType="phone-pad"
          autoComplete="tel"
          editable={!busy}
        />
        <Field
          label="Cidade"
          value={city}
          onChangeText={setCity}
          maxLength={100}
          autoCapitalize="words"
          editable={!busy}
        />
        {!!error && <Empty text={error} />}
        <View style={{ gap: 12 }}>
          <Button
            label={busy ? "Salvando…" : "Salvar perfil"}
            disabled={busy || preparing}
            onPress={() => void save()}
          />
          <Button
            secondary
            label="Cancelar"
            disabled={busy}
            onPress={() => router.replace("/(tabs)/profile")}
          />
        </View>
        {isDemo && (
          <Body muted style={{ fontSize: 14 }}>
            Na prévia, seu perfil fica salvo apenas neste{" "}
            {Platform.OS === "web" ? "navegador" : "dispositivo"}.
          </Body>
        )}
      </View>
    </Page>
  );
}
