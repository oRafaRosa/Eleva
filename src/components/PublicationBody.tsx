import { StyleSheet, Text, View } from "react-native";
import { Body, Title } from "./ui";
import { colors, fonts } from "../theme";
import {
  publicationContent,
  type PublicationContent,
} from "../utils/publicationDetails";
export function PublicationBody({
  item,
  showSummary = true,
}: {
  item: PublicationContent;
  showSummary?: boolean;
}) {
  const { metadata, sections, paragraphs } = publicationContent(item);
  const verse = sections.find((section) => section.key === "verse");
  return (
    <View>
      {showSummary && !!item.summary.trim() && (
        <Body muted style={{ marginBottom: 24 }}>
          {item.summary}
        </Body>
      )}
      {!!metadata.length && (
        <View style={styles.metadata}>
          {metadata.map((meta) => (
            <View key={meta.key} style={{ gap: 3 }}>
              <Text style={styles.metaLabel}>{meta.label}</Text>
              <Text style={styles.metaValue}>{meta.value}</Text>
            </View>
          ))}
        </View>
      )}
      {verse && (
        <View style={styles.verse}>
          {verse.paragraphs.map((paragraph, index) => (
            <Body key={index} style={styles.reading}>
              {paragraph}
            </Body>
          ))}
        </View>
      )}
      {paragraphs.map((paragraph, index) => (
        <Body key={index} style={[styles.reading, { marginBottom: 20 }]}>
          {paragraph}
        </Body>
      ))}
      {sections
        .filter((section) => section.key !== "verse")
        .map((section) => (
          <View key={section.key} style={styles.section}>
            <Title small style={styles.sectionTitle}>
              {section.label}
            </Title>
            {section.paragraphs.map((paragraph, index) => (
              <View
                key={index}
                style={
                  section.key === "exercises" && section.paragraphs.length > 1
                    ? styles.exercise
                    : undefined
                }
              >
                <Body style={styles.reading}>{paragraph}</Body>
              </View>
            ))}
          </View>
        ))}
    </View>
  );
}
const styles = StyleSheet.create({
  reading: { fontSize: 18, lineHeight: 29 },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    marginBottom: 28,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  metaLabel: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  metaValue: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
    maxWidth: 520,
  },
  verse: {
    padding: 20,
    backgroundColor: colors.pink,
    borderRadius: 4,
    marginBottom: 28,
    gap: 12,
  },
  section: { marginTop: 16, marginBottom: 12, gap: 12 },
  sectionTitle: { fontSize: 26, lineHeight: 32 },
  exercise: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
});
