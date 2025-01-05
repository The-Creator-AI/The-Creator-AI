import React, { useState } from 'react';
import { MdChevronRight } from 'react-icons/md';
import { getExpandedNodes } from './TreeView.utils';

export interface TreeNode {
    name: string;
    children?: TreeNode[];
    isExpanded?: boolean;
    [key: string]: any;
}

interface TreeViewProps {
    data: TreeNode[];
    onNodeClick?: (node: TreeNode) => void;
    renderNodeContent?: (node: TreeNode) => React.ReactNode;
}

const TreeView: React.FC<TreeViewProps> = ({ data, onNodeClick, renderNodeContent }) => {
    const [expandedNodes, setExpandedNodes] = useState<string[]>(getExpandedNodes(data));

    const handleNodeClick = (node: TreeNode) => {
        if (node.children) {
            setExpandedNodes((prevExpandedNodes) => {
                const isExpanded = prevExpandedNodes.includes(node.name);
                return isExpanded
                    ? prevExpandedNodes.filter((n) => n !== node.name)
                    : [...prevExpandedNodes, node.name];
            });
        }
        onNodeClick && onNodeClick(node);
    };

    const renderTreeNodes = (nodes: TreeNode[]) => {
        return nodes.map((node) => {
            const isExpanded = expandedNodes.includes(node.name);
            const isDirectory = !!node.children;

            return (
                <li key={node.name} className="relative">
                    <div
                        onClick={() => handleNodeClick(node)}
                        className={`
              cursor-pointer 
              px-2 
              flex 
              items-center 
              ${isDirectory ? 'font-medium' : 'font-normal'}
            `}
                    >
                        {isDirectory && (
                            <span
                                className={`
                  mr-2 
                  text-xl 
                  ${isExpanded ? 'rotate-90' : ''}
                  transition-transform 
                  duration-200
                  absolute
                  left-[-6px]
                `}
                            >
                                <MdChevronRight />
                            </span>
                        )}
                        {/* Use custom rendering if provided, otherwise display the node name */}
                        {renderNodeContent ? renderNodeContent(node) : node.name}
                    </div>
                    {isDirectory && isExpanded && (
                        <ul className="ml-4">{renderTreeNodes(node.children)}</ul>
                    )}
                </li>
            );
        });
    };

    return (
        <div className="font-sans">
            <ul>{renderTreeNodes(data)}</ul>
        </div>
    );
};

export default TreeView;
