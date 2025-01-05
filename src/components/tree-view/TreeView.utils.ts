import { TreeNode } from "./TreeView";

export const getExpandedNodes = (data: TreeNode[]): string[] => {
  return data.reduce((acc, node) => {
    if (node.isExpanded) {
      acc.push(node.name);
    }
    if (node.children) {
      acc.push(...getExpandedNodes(node.children));
    }
    return acc;
  }, []);
};
