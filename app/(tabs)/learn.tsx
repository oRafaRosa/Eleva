import { useState } from "react";
import { View, Pressable } from "react-native";
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
import { colors, fonts } from "../../src/theme";
export default function Learn() {
  const { publications, loading } = useEleva();
  const [q, setQ] = useState("");
  const [pillar, setPillar] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const visible = publications.filter(
    (p) =>
      (pillar === "all" || p.pillar === pillar) &&
      (p.title + " " + p.summary)
        .toLocaleLowerCase("pt-BR")
        .includes(q.toLocaleLowerCase("pt-BR")),
  );
  return (
    <Page
      title="Aprender"
      actions={
        <View style={s.row}>
          <Toggle
            label="Buscar"
            open={searchOpen}
            active={!!q}
            onPress={() => setSearchOpen((v) => !v)}
          />
          <Toggle
            label="Filtros"
            open={filtersOpen}
            active={pillar !== "all"}
            onPress={() => setFiltersOpen((v) => !v)}
          />
        </View>
      }
    >
      {searchOpen && (
        <MotionBlock style={{ marginBottom: 12 }}>
          <Field
            label="Buscar conteúdo"
            placeholder="Título ou assunto"
            value={q}
            onChangeText={setQ}
            autoFocus
          />
        </MotionBlock>
      )}
      {filtersOpen && (
        <MotionBlock>
          <View style={[s.row, { marginBottom: 12 }]}>
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
        </MotionBlock>
      )}
      {(q || pillar !== "all") && (
        <View
          style={[
            s.row,
            {
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            },
          ]}
        >
          <Body muted>
            {visible.length} {visible.length === 1 ? "conteúdo" : "conteúdos"}
            {q ? ` para “${q}”` : ""}
            {pillar !== "all"
              ? ` em ${({ body: "Corpo", mind: "Mente", spirit: "Espírito" } as Record<string, string>)[pillar]}`
              : ""}
          </Body>
          <Toggle
            label="Limpar"
            open={false}
            onPress={() => {
              setQ("");
              setPillar("all");
            }}
          />
        </View>
      )}
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
function Toggle({
  label,
  open,
  active,
  onPress,
}: {
  label: string;
  open: boolean;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      style={{
        minHeight: 48,
        paddingHorizontal: 12,
        justifyContent: "center",
        backgroundColor: open || active ? colors.pink : "transparent",
        borderRadius: 4,
      }}
    >
      <Body
        style={{
          fontFamily: fonts.medium,
          color: colors.burgundy,
          fontSize: 16,
        }}
      >
        {label}
      </Body>
    </Pressable>
  );
}
