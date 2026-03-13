import { visit } from "unist-util-visit";
import { h } from "hastscript";

/**
 * Rehype plugin that transforms Shiki-generated code blocks into
 * a custom "editor-style" code block with:
 * - Optional filename header (extracted from first `// FileName` comment)
 * - Line numbers
 * - Line count + copy button in header
 */
export default function rehypeCodeBlock() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      // Match <pre> elements that contain a <code> child (Shiki output)
      if (node.tagName !== "pre" || !parent) return;
      const codeNode = node.children.find(
        (child) => child.type === "element" && child.tagName === "code"
      );
      if (!codeNode) return;

      // Collect all .line spans
      const lines = codeNode.children.filter(
        (child) =>
          child.type === "element" &&
          child.tagName === "span" &&
          child.properties?.className?.includes("line")
      );

      // Try to extract filename from the first line's `// FileName` comment
      let filename = null;
      const firstLine = lines[0];
      if (firstLine) {
        const textContent = extractText(firstLine).trim();
        // Match patterns like `// Game.cpp` or `// Fibo.js`
        const match = textContent.match(/^\/\/\s*(.+)$/);
        if (match) {
          filename = match[1].trim();
          // Remove the first line (filename comment) from code
          const lineIdx = codeNode.children.indexOf(firstLine);
          if (lineIdx !== -1) {
            // Also remove the newline text node after the line if present
            const nextNode = codeNode.children[lineIdx + 1];
            if (nextNode && nextNode.type === "text" && nextNode.value === "\n") {
              codeNode.children.splice(lineIdx, 2);
            } else {
              codeNode.children.splice(lineIdx, 1);
            }
          }
        }
      }

      // Re-collect lines after potential removal
      const remainingLines = codeNode.children.filter(
        (child) =>
          child.type === "element" &&
          child.tagName === "span" &&
          child.properties?.className?.includes("line")
      );

      const lineCount = remainingLines.length;

      // Add line numbers to each remaining .line span
      remainingLines.forEach((line, i) => {
        const lineNum = h(
          "span",
          { className: ["line-number"], "aria-hidden": "true" },
          String(i + 1)
        );
        line.children.unshift(lineNum);
      });

      // Build the header
      const headerLeft = [];
      if (filename) {
        headerLeft.push(
          h("span", { className: ["code-filename"] }, filename)
        );
      }

      const headerRight = [];
      headerRight.push(
        h("span", { className: ["code-meta"] }, `UTF-8 | ${lineCount} Lines`)
      );
      headerRight.push(
        h(
          "button",
          {
            className: ["code-copy-btn"],
            "aria-label": "Copy code",
            "data-copied": "false",
          },
          [
            h(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                className: ["copy-icon"],
              },
              [
                h("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
                h("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" }),
              ]
            ),
            h(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                className: ["check-icon"],
                style: "display:none",
              },
              [
                h("polyline", { points: "20 6 9 17 4 12" }),
              ]
            ),
          ]
        )
      );

      const header = h("div", { className: ["code-header"] }, [
        h("div", { className: ["code-header-left"] }, headerLeft),
        h("div", { className: ["code-header-right"] }, headerRight),
      ]);

      // Wrap everything in a container
      const wrapper = h("div", { className: ["code-block"] }, [header, node]);

      // Replace the original <pre> with the wrapper
      parent.children[index] = wrapper;
    });
  };
}

/**
 * Recursively extract text content from a hast node.
 */
function extractText(node) {
  if (node.type === "text") return node.value;
  if (node.children) return node.children.map(extractText).join("");
  return "";
}
