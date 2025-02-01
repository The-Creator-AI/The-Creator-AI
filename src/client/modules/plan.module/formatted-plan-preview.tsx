import { ClientToServerChannel, ServerToClientChannel } from "@/common/ipc/channels.enum";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import { useStore } from "@/client/store/useStore";
import { setChangePlanViewState } from "@/client/views/change-plan.view/store/change-plan-view.logic";
import { changePlanViewStoreStateSubject, getChangePlanViewState } from "@/client/views/change-plan.view/store/change-plan-view.store";
import * as React from "react";
import { useEffect, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import FileCard from "./components/file-card"; // Import the new FileCard component

interface FormattedPlanPreviewProps {
  jsonData: any;
}

const FormattedPlanPreview: React.FC<FormattedPlanPreviewProps> = ({
  jsonData,
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const { activeTab } = useStore(changePlanViewStoreStateSubject);
  const clientIpc = ClientPostMessageManager.getInstance();
  const chatHistory = getChangePlanViewState("chatHistory");
  const selectedContext = getChangePlanViewState("selectedContext");
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const { fileChunkMap } = useStore(changePlanViewStoreStateSubject);

  useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.StreamFileCode, (data) => {
      const { filePath, chunk } = data;
      console.log({ filePath, chunk });
      const fileChunkMap = getChangePlanViewState("fileChunkMap");
      const localFilePath = Object.keys(fileChunkMap).find(
        (key) => key.includes(filePath) || filePath.includes(key)
      );

      if (!fileChunkMap[localFilePath]?.isLoading) {
        return;
      }

      const updatedFileChunkMap = {
        ...fileChunkMap,
        [localFilePath]: {
          ...fileChunkMap[localFilePath],
          fileContent: (fileChunkMap[localFilePath]?.fileContent || "") + chunk,
        },
      };
      setChangePlanViewState("fileChunkMap")(updatedFileChunkMap);
    });

    clientIpc.onServerMessage(ServerToClientChannel.SendFileCode, (data) => {
      const { filePath, fileContent } = data;
      console.log({ filePath, fileContent });
      const fileChunkMap = getChangePlanViewState("fileChunkMap");
      const localFilePath = Object.keys(fileChunkMap).find(
        (key) => key.includes(filePath) || filePath.includes(key)
      );
      const updatedFileChunkMap = {
        ...fileChunkMap,
        [localFilePath]: {
          ...fileChunkMap[localFilePath],
          fileContent,
          isLoading: false,
        },
      };
      setChangePlanViewState("fileChunkMap")(updatedFileChunkMap);
      setLoadingFile(null);
    });
  }, []);

  const handleHeaderClick = (index: number) => {
    setCurrentFileIndex(index);
    clientIpc.sendToServer(ClientToServerChannel.RequestOpenFile, {
      filePath: jsonData.code_plan[index]?.filename,
    });
  };

  useEffect(() => {
    const matchingCardIndex = jsonData.code_plan.findIndex(
      (item: any) =>
        item?.filename && activeTab && activeTab.endsWith(item.filename)
    );
    if (matchingCardIndex !== -1) {
      setCurrentFileIndex(matchingCardIndex);
    }
  }, [activeTab, jsonData.code_plan]);

  const handleRequestFileCode = (filePath: string) => {
    const fileChunkMap = getChangePlanViewState("fileChunkMap");
    const updatedFileChunkMap = {
      ...fileChunkMap,
      [filePath]: {
        isLoading: true,
        fileContent: "",
      },
    };
    setChangePlanViewState("fileChunkMap")(updatedFileChunkMap);
    clientIpc.sendToServer(ClientToServerChannel.RequestStreamFileCode, {
      filePath,
      chatHistory,
      selectedFiles: selectedContext.files,
    });
    setLoadingFile(filePath);
  };

  return jsonData ? (
    <div className="formatted-plan-preview min-h-0 pt-2 flex flex-col flex-grow focus:outline-none overflow-y-auto">
      <h3 className="flex justify-center text-xs font-bold mb-2 px-4 text-center">
        {jsonData.title}
      </h3>
      <p
        className="flex justify-center text-gray-700 px-4 text-center"
      >
        {jsonData.description}
      </p>
      {/* Pagination Dots */}
      <div className="flex flex-col my-4">
        {jsonData.code_plan.map((item: any, index: number) => (
          <div key={index}>
            <button
              onClick={() => handleHeaderClick(index)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-hover-bg ${
                index === currentFileIndex ? "bg-hover-bg" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.filename?.split("/").pop() || ""}
                </span>
                {!fileChunkMap[item.filename]?.isLoading ? (
                  <MdFileDownload
                    size={18}
                    className={`ml-2 cursor-pointer text-blue-500`}
                    onClick={() => handleRequestFileCode(item.filename)}
                  />
                ) : null}
                {fileChunkMap[item.filename]?.isLoading && (
                  <span className="loader mr-2">
                    <div className="spinner w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin ml-2"></div>
                  </span>
                )}
                {fileChunkMap[item.filename]?.isLoading &&
                fileChunkMap[item.filename]?.fileContent?.length ? (
                  <span className="text-xs text-gray-500 whitespace-nowrap overflow-x-auto">
                    ({fileChunkMap[item.filename]?.fileContent?.length} ++)
                  </span>
                ) : null}
              </div>
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-grow mx-4">
        {jsonData.code_plan.map((item: any, index: number) => {
          if (item?.filename && index === currentFileIndex) {
            // Only render the card at the currentFileIndex
            return (
              <FileCard
                key={index}
                fileName={item.filename?.split("/").pop() || ""}
                operation={item.operation}
                recommendations={item.recommendations}
                filePath={item.filename}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  ) : null;
};

export default FormattedPlanPreview;