import { visit } from 'unist-util-visit'

export default function remarkGithub() {
    return (tree) => {
        visit(tree, (node) => {
            if (node.type === 'containerDirective' || node.type === 'leafDirective' || node.type === 'textDirective') {
                if (node.name === 'github') {
                    const data = node.data || (node.data = {});
                    const attributes = node.attributes || {};
                    const repo = attributes.repo;

                    if (repo) {
                        data.hName = 'github-card';
                        data.hProperties = { 'data-repo': repo };
                    } else {
                        console.warn('remark-github: Missing repo attribute in github directive');
                    }
                }
            }
        });
    }
}
