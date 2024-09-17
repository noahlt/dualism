import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { Language } from "./lang";

import { CreateThemeOptions, createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

const gray = "#808080";
const lightGray = "#8a8a8a";

export const defaultSettingsEclipse: CreateThemeOptions["settings"] = {
  background: "#fff",
  foreground: gray,
  caret: "#000",
  selection: "#d7d4f0",
  selectionMatch: "#d7d4f0",
  gutterBackground: "#f7f7f7",
  gutterForeground: "#999",
  lineHighlight: "#006fff1c",
  gutterBorder: "transparent",
};

const orange = "#F6B281";
const purple = "#C191DF";
const blue = "#91B6EF";
const green = "#9ACB96";

export const eclipseLightStyle: CreateThemeOptions["styles"] = [
  { tag: [t.comment], color: orange },
  { tag: [t.documentMeta], color: "#FF1717" },
  { tag: t.keyword, color: purple },
  { tag: t.atom, color: gray },
  { tag: t.number, color: gray },
  { tag: t.propertyName, color: gray },
  { tag: [t.variableName, t.definition(t.variableName)], color: blue },
  { tag: t.function(t.variableName), color: blue },
  { tag: t.string, color: green },
  { tag: t.operator, color: lightGray },
  { tag: t.tagName, color: gray },
  { tag: t.attributeName, color: gray },
  { tag: t.link, color: gray },
];

export const dualismTheme = createTheme({
  theme: "light",
  settings: {
    ...defaultSettingsEclipse,
  },
  styles: eclipseLightStyle,
});

const langExts: Map<Language, LanguageSupport | StreamLanguage<unknown>> =
  new Map();

langExts.set("JavaScript", javascript({ jsx: true }));
langExts.set("TypeScript", javascript({ jsx: true }));
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
