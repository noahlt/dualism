export type Language = "Bash" | "Python" | "Typescript" | "Javascript";
export const AllLanguages = [
  "Bash",
  "Python",
  "Typescript",
  "Javascript",
] as const;
export function isLanguage(lang: string): lang is Language {
  return AllLanguages.includes(lang as Language);
}
