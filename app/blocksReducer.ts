import { Reducer, useReducer } from "react";

export const INERT = "inert";
const EDITING_PROSE = "editing-prose";
const EDITING_CODE = "editing-code";
const GENERATING_CODE = "generating-code";
const GENERATING_PROSE = "generating-prose";

export const EXAMPLE_BLOCKS: FileState = {
  lang: "Typescript" as const,
  blocks: [
    {
      id: "b_1",
      prose: "Hello world",
      code: "console.log('Hello')",
      state: INERT,
    },
    {
      id: "b_2",
      prose: `Function to generate a random id with a string prefix. For example, makeID("b") -> "b_abc234".`,
      code: `function makeID(prefix: string): string {
  const characters =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return \`\${prefix}_\${result}\`;
}`,
      state: INERT,
    },
  ],
};

export type BlockState =
  | typeof INERT
  | typeof EDITING_PROSE
  | typeof EDITING_CODE
  | typeof GENERATING_CODE
  | typeof GENERATING_PROSE;

export type Block = {
  id: string;
  prose: string;
  code: string;
  state: BlockState;
};

export type Language = "Bash" | "Python" | "Typescript";
export const LANGUAGES = ["Bash", "Python", "Typescript"] as const;
export function isLanguage(lang: string): lang is Language {
  return LANGUAGES.includes(lang as Language);
}

export type FileState = { lang: Language; blocks: Block[] };

export type FileAction =
  | { type: "switch-language"; lang: Language }
  | { type: "load-examples" }
  | { type: "create-block" }
  | { type: "edit-prose"; id: string; prose: string }
  | { type: "edit-code"; id: string; code: string }
  | { type: "finish-edit-prose"; id: string }
  | { type: "finish-edit-code"; id: string }
  | { type: "save-generated-prose"; id: string; prose: string }
  | { type: "save-generated-code"; id: string; code: string };

function makeID(prefix: string): string {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `${prefix}_${result}`;
}

// Reducer function
const fileReducer: Reducer<FileState, FileAction> = (
  state: FileState,
  action: FileAction,
) => {
  switch (action.type) {
    case "switch-language":
      return { ...state, lang: action.lang };

    case "load-examples":
      return EXAMPLE_BLOCKS;

    case "create-block":
      const newBlock = {
        id: makeID("b"),
        prose: "",
        code: "",
        state: "inert" as const,
      };
      return { ...state, blocks: [...state.blocks, newBlock] };

    case "edit-prose":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.id
            ? { ...block, prose: action.prose, state: EDITING_PROSE }
            : block,
        ),
      };

    case "edit-code":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.id
            ? { ...block, code: action.code, state: EDITING_CODE }
            : block,
        ),
      };

    case "finish-edit-prose":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.id
            ? { ...block, code: "", state: GENERATING_CODE }
            : block,
        ),
      };

    case "finish-edit-code":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.id
            ? { ...block, prose: "", state: GENERATING_PROSE }
            : block,
        ),
      };

    case "save-generated-prose":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.id
            ? { ...block, prose: action.prose, state: INERT }
            : block,
        ),
      };

    case "save-generated-code":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.id
            ? { ...block, code: action.code, state: INERT }
            : block,
        ),
      };

    default:
      return state;
  }
};

// Custom hook to use the reducer
export function useFileReducer(initialBlocks: FileState) {
  return useReducer(fileReducer, initialBlocks);
}

export type FileDispatcher = ReturnType<typeof useFileReducer>[1];
