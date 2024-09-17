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
                  await generate({ prose: block.prose, lang }, block.id, dFile);
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
  gap: "20px",
  alignItems: "baseline",
};

const navLinkStyles = css(linkColor, {
  _hover: { borderTop: "2px solid #6996f0", paddingTop: "2px" },
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
          What is this?
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
          paddingLeft: "8px",
          paddingRight: "20px",
          borderRadius: "5px",
          border: "1px solid #aaa",
          WebkitAppearance: "none",
          background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50px' height='50px'><polyline points='46.139,15.518 25.166,45.49 4.193,15.519' fill='gray'/></svg>") right no-repeat`,
          backgroundPosition: "right 4px top 6px",
          backgroundSize: "12px 12px",
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
    </>
  );
}
