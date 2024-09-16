import { Language } from "@/lib/lang";
import { DynamicTextarea } from "./DynamicTextarea";
import { Block, FileDispatcher } from "./blocksReducer";
import { css } from "@/styled-system/css";
import { useCallback, useState } from "react";

import CodeMirror, { keymap } from "@uiw/react-codemirror";
import { dualismTheme, getLanguageExtension } from "@/lib/codemirror";

export async function generate(
  req: { prose: string; lang: string } | { code: string; lang: string },
  blockId: string,
  dFile: FileDispatcher,
) {
  dFile({ type: "finish-editing", id: blockId });
  const dest = "prose" in req ? ("code" as const) : ("prose" as const);
  console.log("generating", dest);
  var resp;
  try {
    resp = await fetch("/i/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  } catch (e) {
    console.log("error fetching response", e);
    dFile({
      type: "save",
      id: blockId,
      [dest]: "[error fetching response]", // TODO: save error in real place and render properly
    });
    return;
  }
  if (!resp?.body) {
    // TODO: save error in a real place and render properly
    dFile({
      type: "save",
      id: blockId,
      [dest]: "[error fetching response]",
    });
    return;
  }

  const utf8 = new TextDecoder("utf-8");
  //@ts-expect-error - not sure why TS doesn't like this
  for await (const chunk of resp.body) {
    const lines = utf8.decode(chunk).split("\n");
    const lastLine = lines.findLast((l) => l !== "");
    if (!lastLine) continue; // TODO: nicely render "generating" message
    try {
      const data = JSON.parse(lastLine);
      console.log("updating", dest, data);
      dFile({
        type: "update-generated",
        id: blockId,
        [dest]: data[dest],
      });
    } catch {
      console.error("error parsing json", lastLine);
      dFile({
        type: "save",
        id: blockId,
        [dest]: "[error parsing json]", // TODO: nicely render error message
      });
    }
  }

  console.log("saving", blockId);
  dFile({ type: "save", id: blockId });
}

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
        className={css({
          width: "100%",
          paddingTop: "5px",
          paddingLeft: "32px",
          lineHeight: "1.2em",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left 11px top 9px",
          _focus: { outline: "none" },
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
            generate({ prose: block.prose, lang }, block.id, dBlocks);
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
            generate({ code: block.code, lang }, block.id, dBlocks);
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}
