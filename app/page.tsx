"use client";
import { css } from "@/styled-system/css";
import {
  Block,
  FileDispatcher,
  useFileReducer,
  LANGUAGES,
  isLanguage,
  Language,
  FileState,
} from "./blocksReducer";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const blockBorderRadius = "10px";
const styleBorder = "1px solid #aaa";

export default function Home() {
  const [file, dFile] = useFileReducer({ lang: "Bash", blocks: [] });
  const [mode, setMode] = useState<"notebook" | "export-source">("notebook");

  return (
    <div
      className={css({
        margin: "10px",
        width: "900px",
        color: "#333",
        alignItems: "center",
      })}
    >
      <div className={css({ display: "flex", gap: "10px" })}>
        <div
          className={css({
            fontSize: "2xl",
            fontWeight: "bold",
            marginLeft: "8px",
            marginBottom: "10px",
            flexGrow: 1,
          })}
        >
          Dualism
        </div>
        <div className={css({ paddingTop: "7px" })}>
          <select
            className={css({
              height: "auto",
              fontSize: "0.9em",
              padding: "5px",
              paddingRight: "8px",
              borderRadius: "5px",
              border: styleBorder,
            })}
            value={file.lang}
            onChange={(e) => {
              const lang = e.target.value;
              if (isLanguage(lang)) {
                dFile({ type: "switch-language", lang });
              }
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <ToggleWidget
          mode={mode}
          onToggle={() =>
            setMode(mode === "notebook" ? "export-source" : "notebook")
          }
        />
      </div>
      {mode === "notebook" ? (
        <Notebook file={file} dFile={dFile} />
      ) : (
        <ExportSource file={file} />
      )}
    </div>
  );
}

function ToggleWidget({
  mode,
  onToggle,
}: {
  mode: "notebook" | "export-source"; // yeah this is silly and not general but hey it's a prototype
  onToggle: () => void;
}) {
  const selectedColor = "hsl(44, 77%, 83%)";
  return (
    <button className={css({ fontSize: "0.9em" })} onClick={onToggle}>
      <span
        className={css({
          border: styleBorder,
          borderRadius: "5px 0 0 5px",
          py: "3px",
          px: "8px",
          backgroundColor: mode === "notebook" ? selectedColor : "#fff",
        })}
      >
        Notebook
      </span>
      <span
        className={css({
          borderTop: styleBorder,
          borderRight: styleBorder,
          borderBottom: styleBorder,
          borderRadius: "0 5px 5px 0",
          py: "3px",
          px: "8px",
          backgroundColor: mode === "export-source" ? selectedColor : "#fff",
        })}
      >
        Export
      </span>
    </button>
  );
}

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

function ExportSource({ file }: { file: FileState }) {
  return (
    <div>
      <textarea
        className={css({
          width: "100%",
          height: "80vh",
          fontSize: "0.9em",
          fontFamily: "'Source Code Pro', monospace",
          backgroundColor: "hsl(44, 0%, 96%)",
          borderRadius: blockBorderRadius,
          padding: "10px",
        })}
        value={file.blocks
          .map(
            (block) =>
              commentPrefix(file.lang) + block.prose + "\n" + block.code,
          )
          .join("\n\n")}
        readOnly
      ></textarea>
    </div>
  );
}

function Notebook({ file, dFile }: { file: FileState; dFile: FileDispatcher }) {
  return (
    <>
      <div
        className={css({
          display: "flex",
          flexDir: "column",
          gap: "10px",
        })}
      >
        {file.blocks.map((block) => (
          <BlockWidget
            key={block.id}
            block={block}
            lang={file.lang}
            dBlocks={dFile}
          />
        ))}
        <button
          className={css({
            border: "2px dashed #eee",
            borderRadius: blockBorderRadius,
            padding: "10px",
            textAlign: "center",
            cursor: "pointer",
            color: "#aaa",
            _hover: {
              color: "#333",
            },
            _active: {
              color: "#333",
              backgroundColor: "#f9f9f9",
            },
          })}
          onClick={() => dFile({ type: "create-block" })}
        >
          Add block
        </button>
      </div>
      {file.blocks.length === 0 && (
        <div className={css({ textAlign: "right", marginTop: "10px" })}>
          <button
            className={css({
              fontSize: "0.8em",
              py: "5px",
              px: "10px",
              borderRadius: "10px",
              backgroundColor: "hsl(44, 0%, 95%)",
              color: "#666",
              cursor: "pointer",
              _hover: {
                color: "#333",
              },
              _active: {
                backgroundColor: "hsl(44, 0%, 90%)",
              },
            })}
            onClick={() => {
              dFile({ type: "load-examples" });
            }}
          >
            Load ts examples
          </button>
        </div>
      )}
    </>
  );
}

function BlockWidget({
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

  return (
    <div className={css({ lineHeight: 0 })}>
      <DynamicTextarea
        className={css({
          width: "100%",
          backgroundColor: "hsl(44, 77%, 87%)",
          borderRadius: "10px 10px 0 0",
          padding: "10px",
          lineHeight: "1.2em",
          color:
            block.state !== "editing-code"
              ? "rgba(0, 0, 0, 1)"
              : "rgba(0, 0, 0, 0.5)",

          WebkitAppearance: "none",
        })}
        value={block.prose}
        onChange={(e) =>
          dBlocks({ type: "edit-prose", id: block.id, prose: e.target.value })
        }
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            if (e.shiftKey) {
              dBlocks({
                type: "edit-prose",
                id: block.id,
                prose: block.prose + "\n",
              });
            } else {
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
          }
        }}
      />
      <DynamicTextarea
        className={css({
          width: "100%",
          height: "auto",
          fontSize: "0.9em",
          fontFamily: "'Source Code Pro', monospace",
          lineHeight: "1.2em",
          backgroundColor: "hsl(44, 0%, 93%)",
          borderRadius: "0 0 10px 10px",
          padding: "10px",
          paddingBottom: "20px",
          color:
            block.state !== "editing-prose"
              ? "rgba(0, 0, 0, 1)"
              : "rgba(0, 0, 0, 0.5)",
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

interface DynamicTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

function DynamicTextarea({
  value,
  onChange,
  className,
  ...props
}: DynamicTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value}
      rows={1}
      onChange={(evt) => {
        const elt = evt.target;
        elt.style.height = elt.scrollHeight + "px";
        if (onChange) onChange(evt);
      }}
      {...props}
    ></textarea>
  );
}
