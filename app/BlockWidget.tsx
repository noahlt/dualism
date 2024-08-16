import { Language } from "@/lib/lang";
import { DynamicTextarea } from "./DynamicTextarea";
import { Block, FileDispatcher } from "./blocksReducer";
import { css } from "@/styled-system/css";
import { sourceCodeStyle } from "./styles";

export function BlockWidget({
  block,
  lang,
  dBlocks,
}: {
  block: Block;
  lang: Language;
  dBlocks: FileDispatcher;
}) {
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
    padding: "10px",
    lineHeight: "1.2em",
  };

  return (
    <div className={css({ lineHeight: 0 })}>
      <DynamicTextarea
        className={css({
          ...sharedTextareaCSS,
          backgroundColor: "hsl(44, 77%, 87%)",
          borderRadius: "10px 10px 0 0",
          color: `rgba(0, 0, 0, ${block.state !== "editing-code" ? 1 : 0.5})`,
        })}
        value={block.prose}
        onChange={(e) =>
          dBlocks({ type: "edit-prose", id: block.id, prose: e.target.value })
        }
        onKeyDown={async (e) => {
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            dBlocks({ type: "finish-edit-prose", id: block.id });
            const resp = await generate({ prose: block.prose, lang });
            const data = await resp.json();
            dBlocks({
              type: "save-generated-code",
              id: block.id,
              code: data.code,
            });
          }
        }}
      />
      <DynamicTextarea
        className={css(sharedTextareaCSS, sourceCodeStyle, {
          backgroundColor: "hsl(44, 0%, 93%)",
          borderRadius: "0 0 10px 10px",
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
      />
    </div>
  );
}

async function generate(data: unknown) {
  return fetch("/i/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
