import { useState } from "react";
import { View } from "react-native";
import { Button, Body } from "../ui";
import { clubLinks } from "./links";

export default function JoinForm() {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={{ gap: 16 }}>
      <Body>Preencha o formulário e entre para a nossa lista prioritária.</Body>
      <Button
        label={expanded ? "Recolher formulário" : "Preencher formulário"}
        onPress={() => setExpanded(!expanded)}
      />
      {expanded && (
        <iframe
          title="Formulário de adesão ELEVA the club"
          src={`${clubLinks.form}?embedded=true`}
          loading="lazy"
          style={{
            width: "100%",
            height: "min(900px, 80dvh)",
            minHeight: 420,
            border: 0,
            background: "#FBF7F3",
          }}
        />
      )}
      <a
        href={clubLinks.form}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#4B0B22",
          fontFamily: "SourceSans3_400Regular",
          minHeight: 48,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Abrir formulário em outra aba
      </a>
    </View>
  );
}
