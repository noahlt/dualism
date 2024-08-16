import { isLanguage } from "@/lib/lang";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const req = await request.json();
  const lang = req.lang || "Typescript";
  if (!isLanguage(lang)) {
    return Response.json({ error: "Invalid language" }, { status: 400 });
  }
  // this is a silly hack but it does help, I think
  const style =
    lang === "Typescript" || lang === "Javascript"
      ? " in a functional style"
      : "";
  let msgs;
  if (req.prose) {
    msgs = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: `Respond with a fragment of ${lang} code following best practices${style}. Respond only with code, without preamble or explanation.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Write code that does the following: " + req.prose,
            },
          ],
        },
      ],
    });
    const result = extractLLMResult(msgs);
    if (result instanceof Response) {
      return result; // it's an error
    }
    return Response.json({ code: cleanCode(result) });
  } else if (req.code) {
    msgs = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: `Respond with prose that would be a useful, concise comment to add before this ${lang} code. Respond with only the text content of the comment, no explanation or syntax.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Write prose describing the following code: " + req.code,
            },
          ],
        },
      ],
    });
    const result = extractLLMResult(msgs);
    if (result instanceof Response) {
      return result; // it's an error
    }
    return Response.json({ prose: cleanComment(result) });
  } else {
    return NextResponse.json(
      { error: "No prose or code provided" },
      { status: 400 },
    );
  }
}

function extractLLMResult(msgs: Anthropic.Messages.Message): string | Response {
  if (msgs.content.length > 1) {
    return Response.json(
      { error: "Multiple messages in response??" },
      { status: 400 },
    );
  }
  if (msgs.content[0].type !== "text") {
    console.error("NEED TO HANDLE NON-TEXT MESSAGE");
    return Response.json({ error: "Non-text message" }, { status: 400 });
  }
  return msgs.content[0].text;
}

function cleanCode(code: string): string {
  let codeLines = code.split("\n");
  if (
    codeLines[0].startsWith("```") &&
    codeLines[codeLines.length - 1].startsWith("```")
  ) {
    codeLines = codeLines.slice(1, codeLines.length - 1);
  }
  // bash cleanup
  if (codeLines[0].startsWith("#!/")) {
    codeLines = codeLines.slice(1);
  }
  // js cleanup
  if (codeLines[codeLines.length - 1].startsWith("export default")) {
    codeLines = codeLines.slice(0, codeLines.length - 1);
  }
  // trim empty leading/trailing lines
  while (codeLines[0] === "") {
    codeLines = codeLines.slice(1);
  }
  while (codeLines[codeLines.length - 1] === "") {
    codeLines = codeLines.slice(0, codeLines.length - 1);
  }
  return codeLines.join("\n");
}

function cleanComment(comment: string): string {
  // remove leading comment syntax like # or //
  return comment
    .split("\n")
    .map((line) => line.replace(/^[#\/]{1,2}\s*/, ""))
    .join("\n");
}
