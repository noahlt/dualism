# Dualism

This is a new kind of LLM-assisted code editor that preserves prompt/code pairs, motivated by several observations:

- when generating code with ChatGPT or Claude, I often iterate on the same code multiple times before copying it into my actual source code. The chat interface here is kind of clunky, I end up repeatedly typing things like "that's good but now make it handle this edge case"
- copy/pasting out of the LLM chat and into my code editor feels clunky.
- once I've copy/pasted it, I lose the ability to go back and iterate on the prompt and regenerate the code
- often my prompts make good code comments

Dualism structures code as a series of prompt-code pairs. This way you can edit the prompt in one block, generate code, make changes to the prompt, and regenerate the code. The prompt is saved, so you can always go back and iterate on it.

Conversely, you can edit the code directly and then regenerate the prose, at which point it becomes less of a prompt and more of a comment. (I'm not sure how useful this is but it seemed interesting.)

## Limitations & Future work

This is just a prototype. It has many limitations and room for improvement:

- the code is structured as a list of pairs, when really it should be a tree of pairs. You should be able to generate a looping construct and then add prompt/code pairs as child nodes of the loop.
- many many basic editor features are missing, such as selecting entire blocks, inserting blocks between others (rather than just appending), etc
- the UI actually allows you to switch languages after you've already generated some code. It would be cool if switching languages regenerated all the code in the new language.
- ideally the prompt for each code block would include all surrounding code so that, eg, the LLM knew what variables are in scope.
- when generating typescript, the imports go at the top of each block. The Typescript exporter needs to hoist all imports to the top of the exported source.
