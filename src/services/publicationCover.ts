import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

export interface PreparedCover {
  base64: string;
  mimeType: "image/jpeg";
  preview: string;
}
const MAX_BYTES = 1024 * 1024;
export async function pickPublicationCover(): Promise<PreparedCover | null> {
  if (Platform.OS !== "web") {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      throw new Error("Permita o acesso às fotos para escolher uma imagem.");
  }
  // On web this call follows the button directly, keeping the user gesture.
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: false,
    quality: 1,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  const sourceSize = asset.fileSize ?? asset.file?.size;
  if (
    typeof sourceSize !== "number" ||
    !Number.isFinite(sourceSize) ||
    sourceSize <= 0
  )
    throw new Error(
      "Não foi possível conferir o tamanho da imagem. Escolha outro arquivo.",
    );
  if (
    !new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ]).has((asset.mimeType ?? asset.file?.type ?? "").toLowerCase())
  )
    throw new Error("Use uma imagem JPEG, PNG, WebP, HEIC ou HEIF.");
  if (sourceSize > 20 * 1024 * 1024)
    throw new Error("Escolha uma imagem com até 20 MB.");
  if (!asset.width || !asset.height || asset.width * asset.height > 40_000_000)
    throw new Error("Escolha uma imagem com até 40 megapixels.");
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > 1600) {
    context.resize(
      asset.width >= asset.height
        ? { width: 1600, height: null }
        : { height: 1600, width: null },
    );
  }
  const image = await context.renderAsync();
  try {
    for (const compress of [0.8, 0.6, 0.4]) {
      const saved = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress,
        base64: true,
      });
      const base64 = saved.base64;
      if (base64 && Math.floor((base64.length * 3) / 4) <= MAX_BYTES)
        return {
          base64,
          mimeType: "image/jpeg",
          preview: `data:image/jpeg;base64,${base64}`,
        };
    }
    throw new Error("A imagem ficou maior que 1 MB. Escolha uma foto menor.");
  } finally {
    image.release();
    context.release();
  }
}
