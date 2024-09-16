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

  if (req.prose) {
    const msgs = anthropic.messages.stream({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: `Respond with a fragment of ${lang} code following best practices. Respond only with code, without preamble or explanation. Do not include usage examples.`,
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
    const downstream = new ReadableStream({
      async start(controller) {
        let entireText = "";
        for await (const msg of msgs) {
          if (msg.type === "content_block_delta") {
            if (msg.delta.type === "text_delta") {
              entireText += msg.delta.text;
              controller.enqueue(
                "\n" + JSON.stringify({ code: cleanCode(entireText) }),
              );
            } else {
              console.log("TODO: handle message delta type:", msg.delta.type);
            }
          } else if (msg.type === "message_stop") {
            controller.enqueue(
              "\n" + JSON.stringify({ code: cleanCode(entireText) }),
            );
          } else {
            console.log("TODO: unhandled message type", msg.type);
          }
        }
        controller.close();
      },
    });
    return new Response(downstream, { status: 200 });
  } else if (req.code) {
    const msgs = await anthropic.messages.stream({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 0,
      system: `Respond with prose that would be a useful, concise comment to add before this ${lang} code. Respond in imperative tense, like "Calculate the value". Respond with only the text content of the comment, no explanation or syntax.`,
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
    const downstream = new ReadableStream({
      async start(controller) {
        let entireText = "";
        for await (const msg of msgs) {
          if (msg.type === "content_block_delta") {
            if (msg.delta.type === "text_delta") {
              entireText += msg.delta.text;
              controller.enqueue(
                "\n" + JSON.stringify({ prose: cleanComment(entireText) }),
              );
            } else {
              console.log("TODO: handle message delta type:", msg.delta.type);
            }
          } else if (msg.type === "message_stop") {
            controller.enqueue(
              "\n" + JSON.stringify({ prose: cleanComment(entireText) }),
            );
          } else {
            console.log("TODO: unhandled message type", msg.type);
          }
        }
        controller.close();
      },
    });
    return new Response(downstream, { status: 200 });
  } else {
    return NextResponse.json(
      { error: "No prose or code provided" },
      { status: 400 },
    );
  }
}

function partialPrefixMatch(str: string, prefix: string): boolean {
  for (let i = 0; i < prefix.length && i < str.length; i++) {
    if (str[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
}

function cleanCode(code: string): string {
  let codeLines = code.split("\n");
  if (codeLines.length > 0 && partialPrefixMatch(codeLines[0], "```")) {
    codeLines = codeLines.slice(1);
  }
  if (
    codeLines.length > 0 &&
    partialPrefixMatch(codeLines[codeLines.length - 1], "```")
  ) {
    codeLines = codeLines.slice(0, codeLines.length - 1);
  }
  // bash cleanup
  if (codeLines.length > 0 && partialPrefixMatch(codeLines[0], "#!/")) {
    codeLines = codeLines.slice(1);
  }
  // js cleanup
  if (
    codeLines.length > 0 &&
    partialPrefixMatch(codeLines[codeLines.length - 1], "export default")
  ) {
    codeLines = codeLines.slice(0, codeLines.length - 1);
  }
  // trim empty leading/trailing lines
  while (codeLines.length > 0 && codeLines[0] === "") {
    codeLines = codeLines.slice(1);
  }
  while (codeLines.length > 0 && codeLines[codeLines.length - 1] === "") {
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
