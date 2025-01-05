import { useStore } from '@/store/useStore';
import { changePlanViewStoreStateSubject } from '@/views/change-plan-view/store/change-plan-view.store';
import * as React from "react";
import { MdDescription, MdFileDownload } from 'react-icons/md';
import { ClientToServerChannel } from '../../../../../ipc/channels.enum';
import { ClientPostMessageManager } from '../../../../../ipc/client-ipc';
import { getChangePlanViewState } from '../../../store/change-plan-view.store';
import { setChangePlanViewState } from '@/views/change-plan-view/store/change-plan-view.logic';
import { ServerToClientChannel } from '@/ipc/channels.enum';
import Markdown from "markdown-to-jsx";

interface FileCardProps {
    fileName: string;
    operation: string;
    recommendations: string[];
    filePath: string;
    fileNumber: number; // Added prop for file number
    totalFiles: number; // Added prop for total file count
}

const FileCard: React.FC<FileCardProps> = ({ fileName, operation, recommendations, filePath, fileNumber, totalFiles }) => { // Added fileNumber and totalFiles props
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

    const handleRequestFileCode = (filePath: string) => {
        const fileChunkMap = getChangePlanViewState('fileChunkMap');
        const updatedFileChunkMap = {
            ...fileChunkMap,
            [filePath]: {
                isLoading: true,
                fileContent: ''
            }
        };
        setChangePlanViewState('fileChunkMap')(updatedFileChunkMap);
        clientIpc.sendToServer(ClientToServerChannel.RequestStreamFileCode, {
            filePath,
            chatHistory,
            selectedFiles,
        });
    };

    return (
        <div className="file-card flex flex-grow flex-col bg-sidebar-bg border border-gray-700 rounded p-4 shadow-md min-w-0 relative overflow-hidden">
            {/* File Number Indicator */}
            <div className="absolute top-2 right-2 text-gray-500 text-sm">
                {fileNumber} / {totalFiles}
            </div>
            <p className="text-gray-700 text-xs mt-4 whitespace-nowrap overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none' }}>{filePath}</p>
            <div className="flex items-center mb-2">
                <MdDescription
                    size={18}
                    className={`mr-2 cursor-pointer ${isLoading ? 'text-gray-400' : 'hover:text-blue-500'} `}
                />
                <h4 className="text-base font-medium text-editor-fg cursor-pointer" onClick={() => handleRequestOpenFile(filePath)}>{fileName}</h4>
                {!isLoading ? <MdFileDownload
                    size={18}
                    className={`ml-2 cursor-pointer text-blue-500`}
                    onClick={() => handleRequestFileCode(filePath)}
                /> : null}
                {isLoading && (
                    <span className="loader mr-2">
                        <div className="spinner w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin ml-2"></div>
                    </span>
                )}
                {isLoading && fileContent?.length ? (
                    <span className="text-xs text-gray-500 whitespace-nowrap overflow-x-auto">({fileContent?.length} ++)</span>
                ) : null}
            </div>
            <p className="text-gray-600 mb-3">{operation}</p>
            <ul className="list-disc list-inside overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
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