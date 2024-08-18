import { css } from "@/styled-system/css";
import { sourceCodeStyle } from "./styles";
import { Language } from "@/lib/lang";
import { FileState } from "./blocksReducer";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { StreamLanguage } from "@codemirror/language";

function commentPrefix(lang: Language) {
  switch (lang) {
    case "Bash":
      return "# ";
    case "Python":
      return "# ";
    case "Typescript":
      return "// ";
  }
}

const extensions = [
  javascript({ jsx: true }),
  python(),
  StreamLanguage.define(shell),
];

export function ExportSource({ file }: { file: FileState }) {
  const source = file.blocks
    .filter((b) => b.prose !== "" || b.code !== "")
    .map((b) => commentPrefix(file.lang) + b.prose + "\n" + b.code)
    .join("\n\n");
  return (
    <CodeMirror
      value={source}
      height="auto"
      extensions={extensions}
      readOnly={true}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
      }}
    />
  );
}
