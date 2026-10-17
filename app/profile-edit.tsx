import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePreventRemove } from "expo-router/react-navigation";
import { Redirect, router, useNavigation } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import {
  Body,
  Button,
  Empty,
  ErrorState,
  Field,
  Loading,
  Page,
} from "../src/components/ui";
import { useEleva } from "../src/state/AppProvider";
import { colors, fonts } from "../src/theme";
import { decodeAvatar } from "../src/services/profileValidation";

export default function EditProfile() {
  const {
    user,
    sessionReady,
    loading,
    isDemo,
    updateProfile,
    refresh,
    error: loadError,
    authStatus,
  } = useEleva();
  const navigation = useNavigation();
  const [name, setName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [whatsappPublic, setWhatsappPublic] = useState(
    user?.whatsapp_public ?? false,
  );
  const [city, setCity] = useState(user?.city ?? "");
  const [photo, setPhoto] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const active = useRef(true);
  const saveLock = useRef(false);
  const pickerLock = useRef(false);
  const [draftReady, setDraftReady] = useState(false);
  const initialized = useRef<string | null>(null);
  const baseline = useRef({
    name: user?.full_name ?? "",
    phone: user?.phone ?? "",
    whatsappPublic: user?.whatsapp_public ?? false,
    city: user?.city ?? "",
  });
  const allowLeave = useRef(false);
  const draftKey = useRef<string | null>(null);
  const writeQueue = useRef(Promise.resolve());
  const phoneRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const identity = useRef(user?.id);
  identity.current = user?.id;
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const dirty =
    draftReady &&
    (name !== baseline.current.name ||
      phone !== baseline.current.phone ||
      whatsappPublic !== baseline.current.whatsappPublic ||
      city !== baseline.current.city ||
      photo !== undefined);
  const draft = {
    name,
    phone,
    whatsappPublic,
    city,
    ...(photo !== undefined ? { photo } : {}),
  };
  const latestDraft = useRef(draft);
  latestDraft.current = draft;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    if (!user || initialized.current === user.id) return;
    const id = user.id;
    initialized.current = id;
    draftKey.current = `eleva:profile-draft:v1:${isDemo ? "demo" : "live"}:${id}`;
    setDraftReady(false);
    baseline.current = {
      name: user.full_name,
      phone: user.phone ?? "",
      whatsappPublic: user.whatsapp_public ?? false,
      city: user.city ?? "",
    };
    setName(baseline.current.name);
    setPhone(baseline.current.phone);
    setWhatsappPublic(baseline.current.whatsappPublic);
    setCity(baseline.current.city);
    setPhoto(undefined);
    AsyncStorage.getItem(draftKey.current)
      .then((raw) => {
        if (!active.current || identity.current !== id || !raw) return;
        const stored = JSON.parse(raw);
        if (
          typeof stored.name !== "string" ||
          typeof stored.phone !== "string" ||
          typeof stored.city !== "string"
        )
          return;
        if (stored.photo !== undefined && stored.photo !== null)
          decodeAvatar(stored.photo);
        setName(stored.name);
        setPhone(stored.phone);
        setWhatsappPublic(
          typeof stored.whatsappPublic === "boolean"
            ? stored.whatsappPublic
            : baseline.current.whatsappPublic,
        );
        setCity(stored.city);
        setPhoto(stored.photo);
      })
      .catch(() => {
        /* A malformed draft never replaces the saved profile. */
      })
      .finally(() => {
        if (active.current && identity.current === id) setDraftReady(true);
      });
  }, [user?.id, isDemo]);
  useEffect(() => {
    if (!draftReady || allowLeave.current || !draftKey.current) return;
    const key = draftKey.current;
    if (!dirty) {
      writeQueue.current = writeQueue.current
        .catch(() => {})
        .then(() => AsyncStorage.removeItem(key))
        .catch(() => {});
      return;
    }
    const timer = setTimeout(() => {
      if (allowLeave.current) return;
      const value = JSON.stringify(latestDraft.current);
      writeQueue.current = writeQueue.current
        .catch(() => {})
        .then(() => AsyncStorage.setItem(key, value))
        .catch(() => {});
    }, 150);
    return () => clearTimeout(timer);
  }, [name, phone, whatsappPublic, city, photo, draftReady, dirty]);
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (
        allowLeave.current ||
        (!dirtyRef.current && !saveLock.current && !pickerLock.current)
      )
        return;
      if (draftKey.current && dirtyRef.current) {
        try {
          window.localStorage.setItem(
            draftKey.current,
            JSON.stringify(latestDraft.current),
          );
        } catch {
          /* Browser storage may be unavailable. */
        }
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);
  async function discardAndLeave(proceed: () => void) {
    if (saveLock.current || pickerLock.current) {
      setError("Aguarde a foto ou o salvamento terminar.");
      return;
    }
    allowLeave.current = true;
    try {
      await writeQueue.current.catch(() => {});
      if (draftKey.current) await AsyncStorage.removeItem(draftKey.current);
      proceed();
    } catch {
      allowLeave.current = false;
      setError("Não foi possível descartar as alterações. Tente novamente.");
    }
  }
  function requestLeave(proceed: () => void) {
    if (saveLock.current || pickerLock.current) {
      setError("Aguarde a foto ou o salvamento terminar.");
      return;
    }
    if (!dirtyRef.current) {
      void discardAndLeave(proceed);
      return;
    }
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Descartar as alterações do perfil?")
      )
        void discardAndLeave(proceed);
    } else
      Alert.alert("Descartar alterações?", "Seu perfil ainda não foi salvo.", [
        { text: "Continuar editando", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => void discardAndLeave(proceed),
        },
      ]);
  }
  usePreventRemove(
    Boolean(user) && (dirty || busy || preparing),
    ({ data }) => {
      if (allowLeave.current) {
        navigation.dispatch(data.action);
        return;
      }
      requestLeave(() => navigation.dispatch(data.action));
    },
  );
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
        whatsapp_public: whatsappPublic,
        city,
        avatar_base64: photo,
      });
      if (active.current && identity.current === accountId) {
        allowLeave.current = true;
        await writeQueue.current.catch(() => {});
        if (draftKey.current)
          await AsyncStorage.removeItem(draftKey.current).catch(() => {});
        router.replace("/(tabs)/profile");
      }
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
  if (
    !user &&
    loadError &&
    (authStatus === "unknown" || authStatus === "verified")
  )
    return (
      <Page layout="form" back title="Editar perfil">
        <ErrorState text={loadError} onRetry={refresh} />
      </Page>
    );
  if (!user) return <Redirect href="/login" />;
  if (!draftReady) return <Loading />;
  const uri =
    photo === undefined
      ? user.avatar_url
      : photo
        ? `data:image/jpeg;base64,${photo}`
        : null;
  return (
    <Page
      back
      title="Editar perfil"
      layout="form"
      onBack={() => requestLeave(() => router.replace("/(tabs)/profile"))}
    >
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
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => phoneRef.current?.focus()}
        />
        <Field
          ref={phoneRef}
          label="WhatsApp"
          placeholder="(11) 99999-9999"
          value={phone}
          onChangeText={setPhone}
          maxLength={30}
          keyboardType="phone-pad"
          autoComplete="tel"
          editable={!busy}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => cityRef.current?.focus()}
        />
        <View style={{ gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              minHeight: 48,
            }}
          >
            <Body style={{ flex: 1 }}>Mostrar meu WhatsApp no perfil</Body>
            <Switch
              accessibilityLabel="Mostrar meu WhatsApp no perfil"
              value={whatsappPublic}
              onValueChange={setWhatsappPublic}
              disabled={busy}
              trackColor={{ false: colors.controlLine, true: colors.burgundy }}
            />
          </View>
          <Body muted style={{ fontSize: 14 }}>
            {whatsappPublic
              ? "Integrantes do clube poderão ver seu número e abrir uma conversa no WhatsApp."
              : "Seu número não aparece para outras integrantes."}
          </Body>
          <Body muted style={{ fontSize: 14 }}>
            Use DDD. Para números de outros países, inclua +DDI.
          </Body>
        </View>
        <Field
          ref={cityRef}
          label="Cidade"
          value={city}
          onChangeText={setCity}
          maxLength={100}
          autoCapitalize="words"
          editable={!busy}
          returnKeyType="done"
          onSubmitEditing={() => void save()}
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
            disabled={busy || preparing}
            onPress={() =>
              requestLeave(() => router.replace("/(tabs)/profile"))
            }
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
