import { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import {
  Page,
  Body,
  Field,
  Chip,
  PublicationCard,
  Empty,
  Loading,
  ErrorState,
  s,
} from "../../src/components/ui";
import { useEleva } from "../../src/state/AppProvider";
import { MotionBlock } from "../../src/components/MotionBlock";
import { colors, fonts, typeLabels } from "../../src/theme";
import type { Pillar, PublicationType } from "../../src/types/domain";
import { filterPublications } from "../../src/utils/memberExperience";
export default function Learn() {
  const { publications, loading, error, refresh } = useEleva();
  const [q, setQ] = useState("");
  const [pillar, setPillar] = useState<Pillar | "all">("all");
  const [format, setFormat] = useState<PublicationType | "all">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const visible = filterPublications(publications, q, pillar, format);
  const formats = Array.from(new Set(publications.map((item) => item.type)));
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
            active={pillar !== "all" || format !== "all"}
            onPress={() => setFiltersOpen((v) => !v)}
          />
        </View>
      }
    >
      {!!error && <ErrorState text={error} onRetry={refresh} />}
      {searchOpen && (
        <MotionBlock style={{ marginBottom: 12 }}>
          <Field
            label="Buscar conteúdo"
            placeholder="Título ou assunto"
            value={q}
            onChangeText={setQ}
            autoFocus
            returnKeyType="search"
          />
        </MotionBlock>
      )}
      {filtersOpen && (
        <MotionBlock style={{ marginBottom: 12 }}>
          <Body muted style={{ fontSize: 14, marginBottom: 6 }}>
            Pilar
          </Body>
          <View style={[s.row, { marginBottom: 10 }]}>
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
                onPress={() => setPillar(id as Pillar | "all")}
              />
            ))}
          </View>
          <Body muted style={{ fontSize: 14, marginBottom: 6 }}>
            Formato
          </Body>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 20 }}
          >
            <Chip
              label="Todos"
              active={format === "all"}
              onPress={() => setFormat("all")}
            />
            {formats.map((type) => (
              <Chip
                key={type}
                label={typeLabels[type]}
                active={format === type}
                onPress={() => setFormat(type)}
              />
            ))}
          </ScrollView>
        </MotionBlock>
      )}
      {(q || pillar !== "all" || format !== "all") && (
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
            {format !== "all" ? ` · ${typeLabels[format]}` : ""}
          </Body>
          <Toggle
            label="Limpar"
            open={false}
            onPress={() => {
              setQ("");
              setPillar("all");
              setFormat("all");
            }}
          />
        </View>
      )}
      {loading ? (
        <Loading />
      ) : visible.length ? (
        <MotionBlock key={`${pillar}:${format}`}>
          {visible.map((p) => (
            <PublicationCard key={p.id} item={p} />
          ))}
        </MotionBlock>
      ) : !error ? (
        <Empty text="Não encontramos conteúdo com essa busca. Tente outro assunto." />
      ) : null}
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
