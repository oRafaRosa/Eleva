import { useState } from "react";
import { View } from "react-native";
import {
  Page,
  Body,
  Field,
  Chip,
  PublicationCard,
  Empty,
  Loading,
  s,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { MotionBlock } from "../../src/components/MotionBlock";
export default function Learn() {
  const { publications, loading } = useEleva();
  const [q, setQ] = useState("");
  const [pillar, setPillar] = useState("all");
  const visible = publications.filter(
    (p) =>
      (pillar === "all" || p.pillar === pillar) &&
      (p.title + " " + p.summary)
        .toLocaleLowerCase("pt-BR")
        .includes(q.toLocaleLowerCase("pt-BR")),
  );
  return (
    <Page kicker="Biblioteca ELEVA" title="Aprender">
      <Body muted style={{ marginBottom: 24 }}>
        Aulas, leituras e treinos para consultar quando quiser.
      </Body>
      <Field
        label="Buscar conteúdo"
        placeholder="Título ou assunto"
        value={q}
        onChangeText={setQ}
      />
      <View style={[s.row, { marginTop: 16, marginBottom: 10 }]}>
        {[
          ["all", "Todos"],
          ["body", "Corpo"],
          ["mind", "Mente"],
          ["spirit", "Espírito"],
        ].map(([id, label]) => (
          <Chip
            key={id}
            label={label}
            active={pillar === id}
            onPress={() => setPillar(id)}
          />
        ))}
      </View>
      {loading ? (
        <Loading />
      ) : visible.length ? (
        <MotionBlock key={pillar}>
          {visible.map((p) => (
            <PublicationCard key={p.id} item={p} />
          ))}
        </MotionBlock>
      ) : (
        <Empty text="Não encontramos conteúdo com essa busca. Tente outro assunto." />
      )}
    </Page>
  );
}
