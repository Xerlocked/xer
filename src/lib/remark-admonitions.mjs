import { visit } from 'unist-util-visit'
import { h } from 'hastscript'

export default function remarkAdmonitions() {
    return (tree) => {
        visit(tree, (node) => {
            // Find container directives (e.g. :::tip)
            if (node.type === 'containerDirective') {
                const type = node.name;

                // Define supported admonition types
                const supportedTypes = ['note', 'tip', 'important', 'warning', 'caution'];

                if (supportedTypes.includes(type)) {
                    const data = node.data || (node.data = {});

                    let title = type.toUpperCase();
                    if (node.attributes && node.attributes.title) {
                        title = node.attributes.title;
                    }

                    // In remark 13+, HTML directives use hast nodes to configure rendering
                    data.hName = 'div';
                    data.hProperties = { className: ['admonition', type] };

                    // Prepend the admonition title to the container's children
                    const titleNode = {
                        type: 'paragraph',
                        data: {
                            hName: 'div',
                            hProperties: { className: ['admonition-title'] }
                        },
                        children: [{ type: 'text', value: title }]
                    };

                    // Insert title at the top
                    node.children.unshift(titleNode);
                }
            }
        });
    }
}
