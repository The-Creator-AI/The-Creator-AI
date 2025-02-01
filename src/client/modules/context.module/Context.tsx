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
    const selectedContext = getChangePlanViewState("selectedContext");
    const fullContext = getChangePlanViewState("context");
    const [recentFiles, setRecentFiles] = useState<string[]>([]);
    const [activeFile, setActiveFile] = useState<string>();
      const [activeContext, setActiveContext] = useState<'code' | 'features' | 'architecture' | 'guidelines'>('code');

    useEffect(() => {
        const handleSendContextData = ({ files, features, architecture, guidelines }: { files: FileNode[], features: any, architecture: any, guidelines: any }) => {
            setState("context")({
                files,
                features,
                architecture,
                guidelines,
            });
        };
        clientIpc.onServerMessage(
            ServerToClientChannel.SendContextData,
            handleSendContextData
        );
    
        // Request workspace files on component mount
        clientIpc.sendToServer(ClientToServerChannel.RequestContextData, {});
    }, []);

     const handleContextChange = (context: 'code' | 'features' | 'architecture' | 'guidelines') => {
        setActiveContext(context);
    };

    return (
        <div className="p-4 overflow-y-auto overflow-x-hidden">
            <div className='flex mb-4'>
                <button 
                  className={`mr-2 px-4 py-2 border rounded ${activeContext === 'code' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
                  onClick={() => handleContextChange('code')}
                >
                  Code
                </button>
                 <button 
                    className={`mr-2 px-4 py-2 border rounded ${activeContext === 'features' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
                    onClick={() => handleContextChange('features')}
                >
                  Features
                </button>
                 <button 
                  className={`mr-2 px-4 py-2 border rounded ${activeContext === 'architecture' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
                  onClick={() => handleContextChange('architecture')}
                >
                  Architecture
                </button>
                 <button 
                 className={`mr-2 px-4 py-2 border rounded ${activeContext === 'guidelines' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
                 onClick={() => handleContextChange('guidelines')}
                >
                    Guidelines
                  </button>
            </div>
             {/* Render FileTree for each root node */}
             {activeContext === 'code' && fullContext.files.map((rootNode, index) => (
                <FileTree
                    key={index}
                    data={[rootNode]}
                    onFileClick={(filePath) => handleFileClick({
                    clientIpc,
                    filePath,
                    setActiveFile,
                })}
                selectedFiles={selectedContext.files}
                recentFiles={recentFiles}
                activeFile={activeFile}
                updateSelectedFiles={(files) => setState("selectedContext")({
                    files,
                    architecture: selectedContext.architecture,
                    features: selectedContext.features,
                    guidelines: selectedContext.guidelines,
                })}
                updateRecentFiles={setRecentFiles}
            />
             ))}
        {activeContext !== 'code' && <div className="text-gray-500"> {activeContext} Tree View is under development. </div>}
            {!fullContext.length && (
                <div className="text-gray-500">Loading files...</div>
            )}
        </div>
    );
};
export default Context;
