import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseUrl = process.env.ELEVA_WEB_BASE_PATH || "";
  if (baseUrl && !/^\/[A-Za-z0-9_-]+$/.test(baseUrl)) {
    throw new Error("ELEVA_WEB_BASE_PATH precisa ser um caminho como /Eleva.");
  }
  return {
    ...config,
    name: config.name || "ELEVA",
    slug: config.slug || "eleva",
    experiments: { ...config.experiments, baseUrl },
  };
};
