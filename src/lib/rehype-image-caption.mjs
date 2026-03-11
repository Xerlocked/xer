import { visit } from "unist-util-visit";
import { h } from "hastscript";

export default function rehypeImageCaption() {
    return (tree) => {
        visit(tree, "element", (node, index, parent) => {
            // Find img elements
            if (node.tagName === "img") {
                // Find title or alt text to use as caption
                const captionText = node.properties.title || node.properties.alt;

                if (captionText) {
                    // Create the figure element
                    const figureNode = h("figure", { class: "flex flex-col items-center my-8" }, [
                        node, // The original img element
                        h("figcaption", { class: "text-center text-sm opacity-75 mt-1 italic" }, captionText)
                    ]);

                    // Replace the img with the new figure
                    if (parent && typeof index === 'number') {
                        parent.children[index] = figureNode;
                    }
                }
            }
        });
    };
}
