import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.scss';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import FileTree from '../../components/file-tree/FileTree';
import { useState, useEffect } from 'react';
import { FileNode } from '../../types/file-node';

const App = () => {
    const [files, setFiles] = useState<FileNode[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [recentFiles, setRecentFiles] = useState<string[]>([]);
    const [activeFile, setActiveFile] = useState<string>();

    const clientIpc = ClientPostMessageManager.getInstance();

    useEffect(() => {
        // Request workspace files on component mount
        clientIpc.sendToServer(ClientToServerChannel.RequestWorkspaceFiles, {});

        // Listen for workspace files response
        clientIpc.onServerMessage(ServerToClientChannel.SendWorkspaceFiles, ({ files }) => {
            setFiles(files);
        });
    }, []);

    const handleFileClick = (filePath: string) => {
        setActiveFile(filePath);
        // Send the selected editor path to the extension
        clientIpc.sendToServer(ClientToServerChannel.SendSelectedEditor, {
            editor: {
                fileName: filePath.split('/').pop() || '',
                filePath,
                languageId: '', // You might need to determine the languageId here
            },
        });
    };


    return (
        <div className="h-full overflow-y-auto">
            {files.length > 0 ? (
                <FileTree
                    data={files}
                    onFileClick={handleFileClick}
                    selectedFiles={selectedFiles}
                    recentFiles={recentFiles}
                    activeFile={activeFile}
                    updateSelectedFiles={setSelectedFiles}
                    updateRecentFiles={setRecentFiles}
                />
            ) : (
                <div className="p-4 text-gray-500">Loading files...</div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('file-explorer-root')!);
root.render(<App />);
