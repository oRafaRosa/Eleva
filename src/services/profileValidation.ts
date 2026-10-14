import type { ProfileUpdate } from "../types/domain";
export const MAX_AVATAR_BYTES = 512 * 1024;
export function validateProfileUpdate(update: ProfileUpdate): ProfileUpdate {
  const full_name = update.full_name.trim();
  if (!full_name || full_name.length > 120)
    throw new Error("Preencha um nome com até 120 caracteres.");
  const phone = update.phone?.trim() || null;
  const city = update.city?.trim() || null;
  if (phone && (phone.length > 30 || !/^[0-9+().\s-]+$/.test(phone)))
    throw new Error(
      "Confira o telefone. Use apenas números e os sinais de telefone.",
    );
  if (city && city.length > 100)
    throw new Error("A cidade deve ter até 100 caracteres.");
  const safe: ProfileUpdate = { full_name, phone, city };
  if (update.avatar_base64 !== undefined) {
    if (update.avatar_base64 !== null) decodeAvatar(update.avatar_base64);
    safe.avatar_base64 = update.avatar_base64;
  }
  return safe;
}
export function decodeAvatar(base64: string): Uint8Array {
  if (
    base64.length > Math.ceil(MAX_AVATAR_BYTES / 3) * 4 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)
  )
    throw new Error(
      "Escolha outra foto. O arquivo preparado deve ter até 512 KB.",
    );
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error("Não foi possível ler a foto. Escolha outra imagem.");
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.length > MAX_AVATAR_BYTES)
    throw new Error(
      "Escolha outra foto. O arquivo preparado deve ter até 512 KB.",
    );
  if (
    bytes[0] !== 255 ||
    bytes[1] !== 216 ||
    bytes[2] !== 255 ||
    bytes[bytes.length - 2] !== 255 ||
    bytes[bytes.length - 1] !== 217
  )
    throw new Error("A foto precisa estar no formato JPEG.");
  return bytes;
}
