import { visit } from "unist-util-visit";

/**
 * Remark plugin to handle spoiler text syntax
 * Converts ||spoiler text|| to <span class="spoiler">spoiler text</span>
 */
export function remarkSpoiler() {
	return (tree) => {
		visit(tree, "text", (node, index, parent) => {
			if (!node.value) return;

			const spoilerRegex = /\|\|(.*?)\|\|/g;
			const matches = [...node.value.matchAll(spoilerRegex)];

			if (matches.length === 0) return;

			// Split the text and create new nodes
			const newNodes = [];
			let lastIndex = 0;

			for (const match of matches) {
				const [fullMatch, spoilerText] = match;
				const matchIndex = match.index;

				// Add text before the spoiler
				if (matchIndex > lastIndex) {
					const beforeText = node.value.slice(lastIndex, matchIndex);
					if (beforeText) {
						newNodes.push({
							type: "text",
							value: beforeText,
						});
					}
				}

				// Add the spoiler element
				newNodes.push({
					type: "html",
					value: `<span class="spoiler">${spoilerText}</span>`,
				});

				lastIndex = matchIndex + fullMatch.length;
			}

			// Add remaining text
			if (lastIndex < node.value.length) {
				const remainingText = node.value.slice(lastIndex);
				if (remainingText) {
					newNodes.push({
						type: "text",
						value: remainingText,
					});
				}
			}

			// Replace the current node with new nodes
			if (newNodes.length > 0) {
				parent.children.splice(index, 1, ...newNodes);
			}
		});
	};
}
