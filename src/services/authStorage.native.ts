import * as SecureStore from "expo-secure-store";
import { createChunkedStorage } from "./chunkedStorage";
export const authStorage = createChunkedStorage(SecureStore);
