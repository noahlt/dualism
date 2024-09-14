import { Language } from "@/lib/lang";
import { DynamicTextarea } from "./DynamicTextarea";
import { Block, FileDispatcher } from "./blocksReducer";
import { css } from "@/styled-system/css";
import { useState } from "react";

import CodeMirror from "@uiw/react-codemirror";
import { dualismTheme, getLanguageExtension } from "@/lib/codemirror";

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
        value={block.prose}
        onChange={(e) =>
          dBlocks({ type: "edit-prose", id: block.id, prose: e.target.value })
        }
        onKeyDown={async (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            dBlocks({ type: "finish-edit-prose", id: block.id });
            const resp = await fetch("/i/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prose: block.prose, lang }),
            });
            if (!resp.body) {
              // TODO: save error in a real place and render properly
              dBlocks({
                type: "save-generated-code",
                id: block.id,
                code: "!ERROR response type",
              });
              return;
            }

            const utf8 = new TextDecoder("utf-8");
            //@ts-expect-error - not sure why TS doesn't like this
            for await (const chunk of resp.body) {
              const lines = utf8.decode(chunk).split("\n");
              const lastLine = lines.findLast((l) => l !== "") ?? '{"text":""}';
              const data = JSON.parse(lastLine);
              if (data.text) {
                dBlocks({
                  type: "save-generated-code",
                  id: block.id,
                  code: data.text,
                });
              } else {
                dBlocks({
                  type: "save-generated-code",
                  id: block.id,
                  code: "!ERROR json parse:" + data,
                });
              }
            }
          }
        }}
        placeholder="Prompt for code..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <CodeMirror
        className="dualismtheme"
        value={block.code}
        height="auto"
        readOnly={block.state === "generating-code"}
        theme={dualismTheme}
        extensions={getLanguageExtension(lang)}
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
            // const data = await generate({ code: block.code, lang });
            dBlocks({
              type: "save-generated-prose",
              id: block.id,
              prose: "nope",
            });
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

export async function generate(data: unknown) {
  const resp = await fetch("/i/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return resp.body;
}
