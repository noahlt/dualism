import { css } from "@/styled-system/css";
import IntLink from "next/link";
import { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { linkColor } from "../styles";

// TODO these styles should really be recipes: https://panda-css.com/docs/concepts/recipes#config-recipe
const hStyles = {
  marginTop: "1em",
  marginBottom: "0.5em",
  lineHeight: "2rem",
  fontWeight: "bold",
};
const h1Class = css(hStyles, {
  fontSize: "1.5em",
});
const h2Class = css(hStyles, {
  fontSize: "1.2em",
});

const P = ({ children }: PropsWithChildren) => (
  <p className={css({ margin: "1em 0" })}>{children}</p>
);

const UL = ({ children }: PropsWithChildren) => <ul>{children}</ul>;

const LI = ({ children }: PropsWithChildren) => (
  <li className={css({ listStyleType: "circle", margin: "1em 0 1em 1.5em" })}>
    {children}
  </li>
);

const ExtLink = ({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a href={href} className={css(linkColor)} {...props}>
    {children}
  </a>
);

export default function About() {
  return (
    <div
      className={css({
        margin: "20px",
        maxWidth: "600px",
        paddingBottom: "5em",
      })}
    >
      <h1 className={h1Class}>
        About{" "}
        <IntLink href="/" className={css(linkColor)}>
          Dualism
        </IntLink>
      </h1>
      <P>
        Dualism is a prototype LLM-assisted code editor modelled after notebooks
        and interactive consoles.
      </P>

      <h2 className={h2Class}>Motivation</h2>
      <P>
        When generating code with ChatGPT and Claude, I often iterate on the
        same code multiple times before copying it into my actual source code.
        The chat interface here is kind of clunky, I end up repeatedly typing
        things like “that’s good but now make it handle this edge case”.
      </P>
      <P>
        Conversely, when generating code in Copilot, Cursor, and Colab, I end up
        using comments as prompts, and I find I’m not too attached to the code
        it generates. When I need to change the generated code, I’d rather just
        adjust the prompt and regenerate.
      </P>
      <P>
        With Dualism, you can go back and iterate on the prompt, regenerating
        the code response until you get it just right.
      </P>
      <P>
        Dualism also does away with the chat interface. No more asking ChatGPT
        to “please generate code to […]”. It also provides an export view, which
        formats your prompts as code comments.
      </P>
      <P>
        Finally, you can actually edit the generated code and regenerate the
        prose description of it. (Hence, “dualism”.)
      </P>
      <P>
        This is a working prototype, but it really is a prototype: its purpose
        is to explore different interaction models for LLM-assisted programming.
      </P>
      <P>
        Enough yapping,{" "}
        <IntLink href="/" className={css(linkColor)}>
          go play with Dualism
        </IntLink>
        !
      </P>

      <h2 className={h2Class}>Limitations &amp; Future work</h2>
      <P>
        This is just a prototype. I find it’s good enough to write shell scripts
        (which was my original motivation), but it has many limitations and room
        for improvement:
      </P>
      <UL>
        <LI>
          user code is structured as a list of pairs, but really it should be a
          tree of pairs. You should be able to generate a looping construct and
          then add prompt/code pairs as child nodes of the loop.
        </LI>
        <LI>
          many many basic editor features are missing, such as selecting entire
          blocks, inserting blocks between others (rather than just appending),
          etc
        </LI>
        <LI>
          possibly the prompt for each code block should include all surrounding
          code so that, eg, the LLM knew what variables are in scope. Not sure
          about this one.
        </LI>
        <LI>there is no saving or persistence of any kind</LI>
        <LI>
          minor syntactic issues, eg: when generating typescript, the imports go
          at the top of each block. The Typescript exporter needs to hoist all
          imports to the top of the exported source.
        </LI>
      </UL>
      <P>
        If you’re interested in tinkering, check out{" "}
        <a className={css(linkColor)} href="https://github.com/noahlt/dualism">
          Dualism on GitHub
        </a>
        !
      </P>

      <h2 className={h2Class}>Implementation details</h2>
      <P>
        Dualism uses Claude Sonnet to generate code. The{" "}
        <ExtLink href="https://github.com/noahlt/dualism/blob/main/app/i/generate/route.ts#L25">
          prompts
        </ExtLink>{" "}
        took some tweaking but pretty reliably do what I want. I have some{" "}
        <ExtLink href="https://github.com/noahlt/dualism/blob/main/app/i/generate/route.ts#L88">
          cleanup functions
        </ExtLink>{" "}
        that remove extraneous code (exports, markdown backticks) that it
        sometimes generates.
      </P>
      <P>
        The rest is pretty standard frontend web code. I use Next.js with Panda
        CSS and host it on Render.
      </P>

      <h2 className={h2Class}>About me</h2>
      <P>
        I’m Noah Tye. I love programming tools and I’m frustrated that the
        chatbot paradigm is so common for LLMs.
      </P>
      <P>
        You can find me on{" "}
        <a className={css(linkColor)} href="https://twitter.com/noahlt">
          Twitter
        </a>{" "}
        or read more on{" "}
        <a className={css(linkColor)} href="https://www.noahtye.com">
          my website
        </a>
        !
      </P>
    </div>
  );
}
