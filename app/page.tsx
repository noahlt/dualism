"use client";
import { css } from "@/styled-system/css";
import {
  FileDispatcher,
  useFileReducer,
  FileState,
  makeInitFileState,
} from "./blocksReducer";
import { ChangeEventHandler, PropsWithChildren, useState } from "react";
import { AllLanguages, Language, isLanguage } from "@/lib/lang";
import { BlockWidget, generate } from "./BlockWidget";
import { linkColor } from "./styles";
import Link from "next/link";
import { ExportSource } from "./ExportSource";

export default function Home() {
  const [file, dFile] = useFileReducer(makeInitFileState());
  const [mode, setMode] = useState<"notebook" | "export-source">("notebook");

  return (
    <div
      className={css({
        maxWidth: "900px",
        color: "#333",
        alignItems: "center",
      })}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: ["column", "row"],
          gap: [0, "10px"],
          margin: "10px",
          alignItems: "baseline",
          justifyContent: "space-between",
        })}
      >
        <HeaderAndNav />
        <div className={css(toolbarStyles)}>
          <LanguageSelector
            value={file.lang}
            onChange={(e) => {
              const lang = e.target.value;
              if (isLanguage(lang)) dFile({ type: "switch-language", lang });
              file.blocks.forEach(async (block) => {
                if (block.prose) {
                  const id = block.id;
                  dFile({ type: "finish-edit-prose", id });
                  const data = await generate({ prose: block.prose, lang });
                  dFile({ type: "save-generated-code", id, code: data.code });
                }
              });
            }}
          />
          <ToggleWidget
            mode={mode}
            onToggle={() =>
              setMode(mode === "notebook" ? "export-source" : "notebook")
            }
          />
        </div>
      </div>
      {mode === "notebook" ? (
        <Notebook file={file} dFile={dFile} />
      ) : (
        <ExportSource file={file} />
      )}
    </div>
  );
}

// dumb name but this just abstracts a flexbox row for the header bar
const toolbarStyles = {
  display: "flex",
  flexDirection: "row",
  gap: "10px",
  alignItems: "baseline",
};

const navLinkStyles = css(linkColor, {
  _hover: { borderBottom: "2px solid #6996f0" },
});

function HeaderAndNav() {
  return (
    <div className={css(toolbarStyles, { width: "100%" })}>
      <div
        className={css({
          fontSize: "2xl",
          fontWeight: "bold",
          flexGrow: [1, 0],
        })}
      >
        Dualism
      </div>
      <div>
        <Link href="/about" className={navLinkStyles}>
          About
        </Link>
      </div>
      <div>
        <a href="https://github.com/noahlt/dualism" className={navLinkStyles}>
          GitHub
        </a>
      </div>
    </div>
  );
}

function LanguageSelector({
  value,
  onChange,
}: {
  value: Language;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <div className={css({ display: "flex", alignItems: "center" })}>
      <select
        className={css({
          height: "auto",
          fontSize: "0.9em",
          padding: "2px",
          paddingRight: "8px",
          borderRadius: "5px",
          border: "1px solid #aaa",
        })}
        value={value}
        onChange={onChange}
      >
        {AllLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
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
  // const selectedColor = "#729cef";
  const selectedColor = "#436ce3";
  const styleBorder = "1px solid #aaa";
  return (
    <button className={css({ fontSize: "0.9em" })} onClick={onToggle}>
      <span
        className={css({
          border: styleBorder,
          borderRadius: "5px 0 0 5px",
          py: "3px",
          px: "8px",
          color: mode === "notebook" ? "#fff" : "#333",
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
          color: mode === "export-source" ? "#fff" : "#333",
          backgroundColor: mode === "export-source" ? selectedColor : "#fff",
        })}
      >
        Export
      </span>
    </button>
  );
}

function Notebook({ file, dFile }: { file: FileState; dFile: FileDispatcher }) {
  return (
    <>
      <div className={css({ display: "flex", flexDir: "column" })}>
        {file.blocks.map((block) => (
          <BlockWidget
            key={block.id}
            block={block}
            lang={file.lang}
            dBlocks={dFile}
          />
        ))}
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
