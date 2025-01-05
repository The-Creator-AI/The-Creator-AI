import React, { useEffect, useState } from 'react';
import { MdChevronRight } from 'react-icons/md';
import TreeView from '../tree-view/TreeView'; // Import the generic TreeView
import { FileNode } from '../../types/file-node';
import { getFileNodeByPath, addRemovePathInSelectedFiles } from './FileTree.utils';
import Checkbox from '../Checkbox';


interface FileTreeProps {
  data: FileNode[];
  onFileClick?: (filePath: string) => void;
  selectedFiles: string[];
  recentFiles: string[];
  activeFile?: string;
  updateSelectedFiles: (selectedFiles: string[]) => void;
  updateRecentFiles: (recentFiles: string[]) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  data,
  onFileClick,
  selectedFiles,
  recentFiles,
  activeFile,
  updateSelectedFiles,
  updateRecentFiles
}) => {

  const rootNode = data.find((node) => !node.name.includes('/'));

  // State to manage expanded nodes
  const [expandedNodes, setExpandedNodes] = useState<string[]>([rootNode?.name || '']);


  useEffect(() => {
    // If selectedFiles changes, expand the corresponding nodes
    const toExpand = new Set<string>();
    selectedFiles?.forEach((selectedFile) => {
      const pathParts = selectedFile.split('/');
      // Starting from the root, expand each directory in the path
      let currentPath = '';
      pathParts.forEach((part, index) => {
        currentPath += `${currentPath ? '/' : ''}${part}`;
        const node = getFileNodeByPath(data, currentPath);
        const isLast = index === pathParts.length - 1;
        if (node && !isLast) {
          toExpand.add(currentPath);
        }
      });
    });

    setExpandedNodes(prevExpandedNodes => {
      const newExpandedNodes = [...prevExpandedNodes].filter(path => !toExpand.has(path));
      return [...newExpandedNodes, ...Array.from(toExpand)];
    });
  }, [selectedFiles, data]);


  const handleNodeClick = (e: React.MouseEvent<HTMLElement, MouseEvent>, node: FileNode, path: string) => {
    if ((e.target as HTMLElement)?.classList?.contains('checkbox')) {
      return;
    }
    const isDirectory = Array.isArray(node.children);
    if (isDirectory) {
      setExpandedNodes((prevExpandedNodes) => {
        const isExpanded = !!prevExpandedNodes.find((n) => n === path);
        return isExpanded
          ? prevExpandedNodes.filter((n) => n !== path)
          : [...prevExpandedNodes, path];
      });
    } else {
      onFileClick && onFileClick(path);
      const existingRecentFiles = recentFiles.filter(f => f !== path);
      updateRecentFiles([path, ...existingRecentFiles || []]);
    }
  };

  const renderCheckbox = (path: string) => {
    const isSelected = !!selectedFiles?.find(f => f === path);
    const isPartiallySelected = selectedFiles?.filter(f => f.includes(path) && f !== path);
    const selectedAncestors = selectedFiles?.filter(f => path.startsWith(f) && f !== path);
    return (
      <Checkbox
        data-testid="checkbox"
        indeterminate={isPartiallySelected?.length > 0}
        className="mr-2"
        checked={isSelected || !!selectedAncestors?.length}
        onChange={(_, e) => handleFileCheckboxChange(e, path)}
      />
    );
  };

  const handleFileCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    e.stopPropagation();
    e.preventDefault();
    updateSelectedFiles(addRemovePathInSelectedFiles(data, path, selectedFiles));
  };

  const renderFileNodeContent = (node: FileNode, path: string) => {
    const isDirectory = Array.isArray(node.children);
    const isActive = activeFile === path;

    return (
      <div
        className={`
          relative 
          cursor-pointer 
          px-2 py-px
          flex 
          items-center
          z-1
          ${isActive ? 'bg-[#e0dcdc]' : ''}
          ${isDirectory ? 'font-medium' : 'font-normal'}
        `}
      >
        {renderCheckbox(path)}
        <div className="whitespace-nowrap overflow-hidden text-ellipsis">{node.name}</div>
      </div>
    );
  };

  return (
    <div data-testid="file-tree" className="font-sans">
      <TreeView 
        data={data} 
        onNodeClick={(node) => {
          const path = node.absolutePath || '';
          handleNodeClick(undefined as any, node, path);
        }}
        renderNodeContent={(node) => renderFileNodeContent(node, node.absolutePath || '')} 
      />
    </div>
  );
};

export default FileTree;
