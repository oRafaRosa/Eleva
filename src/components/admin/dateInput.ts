export type DateInputKind = "date" | "month" | "time";
export type DateControlProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  kind?: DateInputKind;
  disabled?: boolean;
};
export function displayDateInput(value: string, kind: DateInputKind): string {
  if (kind === "date" && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value.split("-").reverse().join("/");
  if (kind === "month" && /^\d{4}-\d{2}$/.test(value))
    return value.split("-").reverse().join("/");
  return value;
}
export function normalizeDateInput(value: string, kind: DateInputKind): string {
  if (kind === "date" && /^\d{2}\/\d{2}\/\d{4}$/.test(value))
    return value.split("/").reverse().join("-");
  if (kind === "month" && /^\d{2}\/\d{4}$/.test(value))
    return value.split("/").reverse().join("-");
  return value;
}
