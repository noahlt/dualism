export type Language = "Bash" | "Python" | "TypeScript" | "JavaScript";
export const AllLanguages = [
  "Bash",
  "Python",
  "TypeScript",
  "JavaScript",
] as const;

export function isLanguage(lang: string): lang is Language {
  return AllLanguages.includes(lang as Language);
}
