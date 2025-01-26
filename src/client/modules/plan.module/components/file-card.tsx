import { useStore } from '@/client/store/useStore';
import { changePlanViewStoreStateSubject } from '@/client/views/change-plan.view/store/change-plan-view.store';
import * as React from "react";
import { MdDescription } from 'react-icons/md';
import { ClientToServerChannel } from '@/common/ipc/channels.enum';
import { ClientPostMessageManager } from '@/common/ipc/client-ipc';
import { getChangePlanViewState } from '../../../views/change-plan.view/store/change-plan-view.store';
import { setChangePlanViewState } from '@/client/views/change-plan.view/store/change-plan-view.logic';
import { ServerToClientChannel } from '@/common/ipc/channels.enum';
import Markdown from "markdown-to-jsx";

interface FileCardProps {
    fileName: string;
    operation: string;
    recommendations: string[];
    filePath: string;
}

const FileCard: React.FC<FileCardProps> = ({ fileName, operation, recommendations, filePath }) => {
    const { fileChunkMap } = useStore(changePlanViewStoreStateSubject);
    const clientIpc = ClientPostMessageManager.getInstance();
    const chatHistory = getChangePlanViewState('chatHistory');
    const selectedFiles = getChangePlanViewState('selectedFiles');
    const isLoading = fileChunkMap[filePath]?.isLoading;
    const fileContent = fileChunkMap[filePath]?.fileContent;

    React.useEffect(() => {
        clientIpc.onServerMessage(ServerToClientChannel.StreamFileCode, (data) => {
            const { filePath, chunk } = data;
            console.log({ filePath, chunk });
            const fileChunkMap = getChangePlanViewState('fileChunkMap');
            const localFilePath = Object.keys(fileChunkMap).find((key) => key.includes(filePath) || filePath.includes(key));

            if (!fileChunkMap[localFilePath]?.isLoading) {
                return;
            }

            const updatedFileChunkMap = {
                ...fileChunkMap,
                [localFilePath]: {
                    ...fileChunkMap[localFilePath],
                    fileContent: (fileChunkMap[localFilePath]?.fileContent || '') + chunk
                }
            };
            setChangePlanViewState('fileChunkMap')(updatedFileChunkMap);
        });

        clientIpc.onServerMessage(ServerToClientChannel.SendFileCode, (data) => {
            const { filePath, fileContent } = data;
            console.log({ filePath, fileContent });
            const fileChunkMap = getChangePlanViewState('fileChunkMap');
            const localFilePath = Object.keys(fileChunkMap).find((key) => key.includes(filePath) || filePath.includes(key));
            const updatedFileChunkMap = {
                ...fileChunkMap,
                [localFilePath]: {
                    ...fileChunkMap[localFilePath],
                    fileContent,
                    isLoading: false
                }
            };
            setChangePlanViewState('fileChunkMap')(updatedFileChunkMap);
        });
    }, []);

    const handleRequestOpenFile = (filePath: string) => {
        clientIpc.sendToServer(ClientToServerChannel.RequestOpenFile, {
            filePath
        });
    };


    return (
        <div className="file-card flex flex-grow flex-col bg-sidebar-bg border border-gray-700 rounded p-4 shadow-md min-w-0 relative">
            <div className="flex items-center mb-2">
                <MdDescription
                    size={18}
                    className={`mr-2 cursor-pointer ${isLoading ? 'text-gray-400' : 'hover:text-blue-500'} `}
                />
                <h4 className="text-base font-medium text-editor-fg cursor-pointer" onClick={() => handleRequestOpenFile(filePath)}>{fileName}</h4>
            </div>
            <p className="text-gray-600 mb-3">{operation}</p>
            <ul className="list-disc list-inside">
                {recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-400 text-xs mb-2">
                         <Markdown>{JSON.stringify(recommendation, null, 2)}</Markdown>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileCard;