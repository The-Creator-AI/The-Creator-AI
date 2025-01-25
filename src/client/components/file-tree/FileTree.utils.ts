import { FileNode } from "@/common/types/file-node";

export const addRemovePathInSelectedFiles = (
  files: FileNode[],
  path: string,
  selectedFiles: string[]
): string[] => {
  const isSelected = !!selectedFiles?.find((f) => f === path);
  if (isSelected) {
    // Remove this file from selectedFiles
    return selectedFiles?.filter((f) => f !== path);
  }

  const selectedAncestorPath = selectedFiles.find(
    (f) => path.startsWith(f) && f !== path
  );
  if (selectedAncestorPath) {
    // 1. Remove the ancestor from selectedFiles
    // 2. Add all children of the ancestor to selectedFiles except node which is another ancestor of the selected node
    // 3. Add all the siblings of the all the nodes between the ancestor and the selected node
    const pathParts = path.split("/");
    const ancestorParts = selectedAncestorPath.split("/");
    let siblingsAtEveryLevel: string[] = [];
    for (let i = ancestorParts.length - 1; i < pathParts.length - 1; i++) {
      const filePath = pathParts.slice(0, i + 1).join("/");
      const levelNode = getFileNodeByPath(files, filePath);
      if (levelNode) {
        siblingsAtEveryLevel = [
          ...siblingsAtEveryLevel,
          ...(levelNode.children
            ?.filter((c) => c.name !== pathParts[i + 1])
            ?.map((c) => `${filePath}/${c.name}`) || []),
        ];
      }
    }
    const newSelectedFiles = [
      ...selectedFiles.filter((f) => !f.includes(selectedAncestorPath)),
      ...siblingsAtEveryLevel,
    ];
    return newSelectedFiles;
  }

  // Remove all children and push this file into selectedFiles
  const newSelectedFiles = isSelected
    ? selectedFiles?.filter((f) => f !== path)
    : [...selectedFiles.filter((f) => !f.includes(path)), path];
  return newSelectedFiles;
};

export const getFileNodeByPath = (
  fileNodes: FileNode[],
  filePath: string
): FileNode | null => {
  const pathParts = filePath.split("/");
  // let's find the node in the data
  let node = {
    name: "",
    children: fileNodes,
  } as FileNode | undefined;
  for (const part of pathParts) {
    if (!node) {
      return null;
    }
    node = node.children?.find((child) => child.name === part);
  }
  return node || null;
};
