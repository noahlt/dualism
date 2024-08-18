import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { shell } from "@codemirror/legacy-modes/mode/shell";

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

const langExts: Map<Language, LanguageSupport | StreamLanguage<unknown>> =
  new Map();

langExts.set("Javascript", javascript({ jsx: true }));
langExts.set("Typescript", javascript({ jsx: true }));
langExts.set("Python", python());
langExts.set("Bash", StreamLanguage.define(shell));

export function getLanguageExtension(lang: Language) {
  const ext = langExts.get(lang);
  if (ext) {
    return [ext];
  } else {
    return [];
  }
}
