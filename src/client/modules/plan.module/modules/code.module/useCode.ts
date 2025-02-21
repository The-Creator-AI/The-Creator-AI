import { useEffect, useState } from "react";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "@/common/ipc/channels.enum";
import { useStore } from "@/client/store/useStore";
import {
  changePlanViewStoreStateSubject,
  getChangePlanViewState,
} from "../../store/change-plan-view.store";
import { setChangePlanViewState } from "../../store/change-plan-view.logic";
import * as React from "react";

const useCode = () => {
  const { selectedContext, fileChunkMap } = useStore(changePlanViewStoreStateSubject);
  const clientIpc = ClientPostMessageManager.getInstance();

  React.useEffect(() => {
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
    });
  }, []);

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
    const chatHistory = getChangePlanViewState("chatHistory");
    clientIpc.sendToServer(ClientToServerChannel.RequestStreamFileCode, {
      filePath,
      chatHistory,
      selectedFiles: selectedContext.files,
    });
  };

  return {
    fileChunkMap,
    handleRequestFileCode,
  };
};

export default useCode;
