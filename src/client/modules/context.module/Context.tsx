import React, { useEffect, useState } from 'react';
import { FileNode } from '@/common/types/file-node';
import { ClientPostMessageManager } from '@/common/ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '@/common/ipc/channels.enum';
import FileTree from '@/client/components/file-tree/FileTree';
import { handleFileClick } from '@/client/views/change-plan.view/logic/handleFileClick';
import { setChangePlanViewState as setState } from '@/client/views/change-plan.view/store/change-plan-view.logic';
import { getChangePlanViewState } from '@/client/views/change-plan.view/store/change-plan-view.store';

const Context: React.FC = () => {
  const clientIpc = ClientPostMessageManager.getInstance();
  const selectedFiles = getChangePlanViewState("selectedFiles");
  const files = getChangePlanViewState("files");
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string>();


  useEffect(() => {
    const handleSendWorkspaceFiles = ({ files }: { files: FileNode[] }) => {
        setState("files")(files);
    };
    clientIpc.onServerMessage(
      ServerToClientChannel.SendWorkspaceFiles,
      handleSendWorkspaceFiles
    );

        // Request workspace files on component mount
        clientIpc.sendToServer(ClientToServerChannel.RequestWorkspaceFiles, {});


  }, []);


  return (
    <div className="p-4 overflow-y-auto overflow-x-hidden">
      {/* Render FileTree for each root node */}
      {files.map((rootNode, index) => (
        <FileTree
          key={index}
          data={[rootNode]}
          onFileClick={(filePath) => handleFileClick({
            clientIpc,
            filePath,
            setActiveFile,
          })}
          selectedFiles={selectedFiles}
          recentFiles={recentFiles}
          activeFile={activeFile}
          updateSelectedFiles={(files) => setState("selectedFiles")(files)}
          updateRecentFiles={setRecentFiles}
        />
      ))}
      {!files.length && (
        <div className="text-gray-500">Loading files...</div>
      )}
    </div>
  );
};

export default Context;