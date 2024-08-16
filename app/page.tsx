"use client";
import { css } from "@/styled-system/css";
import { FileDispatcher, useFileReducer, FileState } from "./blocksReducer";
import { useState } from "react";
import { AllLanguages, Language, isLanguage } from "@/lib/lang";
import { BlockWidget } from "./BlockWidget";
import { sourceCodeStyle } from "./styles";

export default function Home() {
  const [file, dFile] = useFileReducer({ lang: "Bash", blocks: [] });
  const [mode, setMode] = useState<"notebook" | "export-source">("notebook");

  return (
    <div
      className={css({
        margin: "10px",
        maxWidth: "900px",
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
              border: "1px solid #aaa",
            })}
            value={file.lang}
            onChange={(e) => {
              const lang = e.target.value;
              if (isLanguage(lang)) {
                dFile({ type: "switch-language", lang });
              }
            }}
          >
            {AllLanguages.map((lang) => (
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
  const styleBorder = "1px solid #aaa";
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
    <div
      className={css(sourceCodeStyle, {
        width: "100%",
        backgroundColor: "hsl(44, 0%, 96%)",
        borderRadius: "10px",
        padding: "10px",
      })}
    >
      {file.blocks
        .map(
          (block) => commentPrefix(file.lang) + block.prose + "\n" + block.code,
        )
        .join("\n\n")}
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
            borderRadius: "10px",
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
