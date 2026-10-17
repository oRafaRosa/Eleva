type SecureStore = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
};
// SecureStore has a small per-entry limit. Write a new generation before replacing
// the manifest, so an interrupted refresh does not overwrite the previous session.
export function createChunkedStorage(store: SecureStore) {
  type Manifest = { prefix: string; count: number };
  async function manifest(key: string): Promise<Manifest | null> {
    const value = await store.getItemAsync(key);
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      return typeof parsed.prefix === "string" &&
        parsed.prefix.startsWith(`${key}.`) &&
        Number.isInteger(parsed.count) &&
        parsed.count > 0 &&
        parsed.count <= 1000
        ? parsed
        : null;
    } catch {
      return null;
    }
  }
  async function cleanup(previous: Manifest | null) {
    if (previous)
      await Promise.all(
        Array.from({ length: previous.count }, (_, i) =>
          store.deleteItemAsync(`${previous.prefix}.${i}`),
        ),
      );
  }
  return {
    async getItem(key: string) {
      const value = await manifest(key);
      if (!value) return null;
      const parts = await Promise.all(
        Array.from({ length: value.count }, (_, i) =>
          store.getItemAsync(`${value.prefix}.${i}`),
        ),
      );
      return parts.some((part) => part === null) ? null : parts.join("");
    },
    async setItem(key: string, value: string) {
      const previous = await manifest(key);
      const prefix = `${key}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
      const characters = Array.from(value);
      const parts: string[] = [];
      for (let i = 0; i < characters.length; i += 500)
        parts.push(characters.slice(i, i + 500).join(""));
      if (!parts.length) parts.push("");
      if (parts.length > 1000)
        throw new Error("Sessão maior que o limite permitido.");
      try {
        await Promise.all(
          parts.map((part, i) => store.setItemAsync(`${prefix}.${i}`, part)),
        );
        await store.setItemAsync(
          key,
          JSON.stringify({ prefix, count: parts.length }),
        );
      } catch (error) {
        await cleanup({ prefix, count: parts.length }).catch(() => {});
        throw error;
      }
      await cleanup(previous).catch(() => {});
    },
    async removeItem(key: string) {
      const previous = await manifest(key);
      await store.deleteItemAsync(key);
      await cleanup(previous).catch(() => {});
    },
  };
}
