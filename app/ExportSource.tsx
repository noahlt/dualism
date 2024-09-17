import { Language } from "@/lib/lang";
import { FileState } from "./blocksReducer";
import CodeMirror from "@uiw/react-codemirror";
import { dualismTheme, getLanguageExtension } from "@/lib/codemirror";

function commentPrefix(lang: Language) {
  switch (lang) {
    case "Bash":
      return "# ";
    case "Python":
      return "# ";
    case "TypeScript":
    case "JavaScript":
    default:
      return "// ";
  }
}
export function ExportSource({ file }: { file: FileState }) {
  const source = file.blocks
    .filter((b) => b.prose !== "" || b.code !== "")
    .map((b) => commentPrefix(file.lang) + b.prose + "\n" + b.code)
    .join("\n\n");
  return (
    <CodeMirror
      value={source}
      height="auto"
      theme={dualismTheme}
      extensions={getLanguageExtension(file.lang)}
      readOnly={true}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
      }}
    />
  );
}
