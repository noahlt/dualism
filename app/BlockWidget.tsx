import { Language } from "@/lib/lang";
import { DynamicTextarea } from "./DynamicTextarea";
import { Block, FileDispatcher } from "./blocksReducer";
import { css } from "@/styled-system/css";
import { sourceCodeStyle } from "./styles";
import { useState } from "react";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { StreamLanguage } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";

const cmExtensions = [
  javascript({ jsx: true }),
  python(),
  StreamLanguage.define(shell),
];

export function BlockWidget({
  block,
  lang,
  dBlocks,
}: {
  block: Block;
  lang: Language;
  dBlocks: FileDispatcher;
}) {
  const [focused, setFocused] = useState(false);

  let code = block.code;
  if (block.state === "generating-code" && block.code === "") {
    code = "(generating...)";
  }
  let prose = block.prose;
  if (block.state === "generating-prose" && block.prose === "") {
    prose = "(generating...)";
  }

  const sharedTextareaCSS = {
    width: "100%",
    paddingTop: "5px",
    paddingLeft: "32px",
    lineHeight: "1.2em",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left 11px top 9px",
    _focus: { outline: "none" },
  };

  return (
    <div
      className={css({
        borderTop: "1px solid #eee",
        lineHeight: 0,
        position: "relative",
        paddingBottom: "10px",
      })}
    >
      {focused && (
        <div
          className={css({
            backgroundColor: "#729cef",
            position: "absolute",
            top: 0,
            left: "-5px",
            width: "10px",
            height: "100%",
            borderRadius: "5px",
          })}
        />
      )}
      <DynamicTextarea
        className={css(sharedTextareaCSS, {
          backgroundImage: "url('/prose-icon.svg')",
          color: `rgba(0, 0, 0, ${block.state !== "editing-code" ? 1 : 0.5})`,
        })}
        value={prose}
        onChange={(e) =>
          dBlocks({ type: "edit-prose", id: block.id, prose: e.target.value })
        }
        onKeyDown={async (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            dBlocks({ type: "finish-edit-prose", id: block.id });
            const data = await generate({ prose: block.prose, lang });
            dBlocks({
              type: "save-generated-code",
              id: block.id,
              code: data.code,
            });
          }
        }}
        placeholder="prompt for code..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <CodeMirror
        className="dualismtheme"
        value={code}
        height="auto"
        readOnly={block.state === "generating-code"}
        extensions={cmExtensions}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
        }}
        onChange={(val) => {
          dBlocks({ type: "edit-code", id: block.id, code: val });
        }}
        onKeyDown={async (e) => {
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            dBlocks({ type: "finish-edit-code", id: block.id });
            const data = await generate({ code: block.code, lang });
            dBlocks({
              type: "save-generated-prose",
              id: block.id,
              prose: data.prose,
            });
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {/* <DynamicTextarea
        className={css(sharedTextareaCSS, sourceCodeStyle, {
          backgroundImage: "url('/code-icon.svg')",
          paddingBottom: "20px",
          color: `rgba(0, 0, 0, ${block.state !== "editing-prose" ? 1 : 0.5})`,
        })}
        value={code}
        readOnly={block.state === "generating-code"}
        onChange={(evt) => {
          dBlocks({ type: "edit-code", id: block.id, code: evt.target.value });
        }}
        onKeyDown={async (e) => {
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            dBlocks({ type: "finish-edit-code", id: block.id });
            const resp = await generate({ code: block.code, lang });
            const data = await resp.json();
            dBlocks({
              type: "save-generated-prose",
              id: block.id,
              prose: data.prose,
            });
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      /> */}
    </div>
  );
}

export async function generate(data: unknown) {
  const resp = await fetch("/i/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return resp.json();
}
