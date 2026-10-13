import { View } from "react-native";
import { Page, Body, Title, Section, s } from "../../src/components/ui";
import { colors } from "../../src/theme";
export default function Connect() {
  return (
    <Page kicker="Comunidade ELEVA" title="Conectar">
      <View
        style={[
          s.panel,
          { backgroundColor: colors.pink, borderWidth: 0, padding: 28 },
        ]}
      >
        <Title small>Entre mulheres.</Title>
        <Body>
          Aqui também tem espaço para conversar, dividir experiências e conhecer
          quem faz parte da ELEVA.
        </Body>
      </View>
      <Section title="Nossos combinados" />
      <View style={{ gap: 22 }}>
        <View>
          <Title small>Respeito nas conversas</Title>
          <Body muted>
            Experiências diferentes são bem-vindas. Cuide da forma como você
            responde.
          </Body>
        </View>
        <View>
          <Title small>Privacidade de todas</Title>
          <Body muted>
            Não compartilhe relatos, fotos ou contatos de outras integrantes sem
            autorização.
          </Body>
        </View>
        <View>
          <Title small>Conteúdo com responsabilidade</Title>
          <Body muted>
            Orientações de saúde devem ser acompanhadas por profissionais. Evite
            recomendar medicamentos ou dietas para outras pessoas.
          </Body>
        </View>
      </View>
      <Section title="Grupos da comunidade" />
      <Body muted>
        Os links dos grupos serão disponibilizados pela equipe. Nesta prévia,
        ainda não há grupos conectados.
      </Body>
    </Page>
  );
}
