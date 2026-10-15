import React from "react";
import { Field } from "../ui";
import {
  displayDateInput,
  normalizeDateInput,
  type DateControlProps,
} from "./dateInput";
export function DateControl({
  label,
  value,
  onChangeText,
  kind = "date",
  disabled = false,
}: DateControlProps) {
  return (
    <Field
      label={label}
      value={displayDateInput(value, kind)}
      onChangeText={(value) => onChangeText(normalizeDateInput(value, kind))}
      placeholder={
        kind === "date" ? "DD/MM/AAAA" : kind === "month" ? "MM/AAAA" : "HH:MM"
      }
      editable={!disabled}
      keyboardType="numbers-and-punctuation"
      autoCapitalize="none"
      autoCorrect={false}
      maxLength={kind === "date" ? 10 : kind === "month" ? 7 : 5}
    />
  );
}
