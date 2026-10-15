import React, { useId, useEffect, useState } from "react";
import { colors, fonts } from "../../theme";
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
  const id = useId();
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    const input = document.createElement("input");
    input.type = kind;
    setSupported(input.type === kind);
  }, [kind]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
        minWidth: 0,
        width: "100%",
      }}
    >
      <label
        htmlFor={id}
        style={{ fontFamily: fonts.medium, color: colors.ink, fontSize: 15 }}
      >
        {label}
      </label>
      <input
        id={id}
        type={supported ? kind : "text"}
        value={supported ? value : displayDateInput(value, kind)}
        placeholder={
          kind === "month"
            ? "MM/AAAA"
            : kind === "date"
              ? "DD/MM/AAAA"
              : "HH:MM"
        }
        disabled={disabled}
        onChange={(event) =>
          onChangeText(
            supported
              ? event.target.value
              : normalizeDateInput(event.target.value, kind),
          )
        }
        style={{
          boxSizing: "border-box",
          width: "100%",
          minWidth: 0,
          minHeight: 48,
          fontFamily: fonts.sans,
          fontSize: 17,
          background: colors.white,
          border: "1px solid " + colors.muted,
          borderRadius: 4,
          padding: 12,
          color: colors.ink,
          colorScheme: "light",
        }}
      />
    </div>
  );
}
