export const MAX_COVER_BYTES = 1024 * 1024;
export function decodeCover(upload: {
  base64: string;
  mimeType: "image/jpeg";
}): Uint8Array {
  if (
    upload.mimeType !== "image/jpeg" ||
    upload.base64.length > Math.ceil(MAX_COVER_BYTES / 3) * 4 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(upload.base64)
  )
    throw new Error("Escolha uma capa JPEG de até 1 MB.");
  let binary: string;
  try {
    binary = atob(upload.base64);
  } catch {
    throw new Error("Não foi possível ler a capa. Escolha outra imagem.");
  }
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  if (
    bytes.length > MAX_COVER_BYTES ||
    bytes[0] !== 255 ||
    bytes[1] !== 216 ||
    bytes[2] !== 255 ||
    bytes[bytes.length - 2] !== 255 ||
    bytes[bytes.length - 1] !== 217
  )
    throw new Error("Escolha uma capa JPEG de até 1 MB.");
  return bytes;
}
