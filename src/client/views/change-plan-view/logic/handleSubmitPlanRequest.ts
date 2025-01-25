import { AGENTS } from "@/common/constants/agents.constants";
import { ClientToServerChannel } from "@/common/ipc/channels.enum";
import {
  setChangePlanViewState as setState,
  setChangePlanViewState,
} from "@/client/views/change-plan-view/store/change-plan-view.logic";
import { getChangePlanViewState } from "@/client/views/change-plan-view/store/change-plan-view.store";
import { getSelectedFiles } from "@/client/views/change-plan-view/logic/getSelectedFiles";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import { FileNode } from "@/common/types/file-node";

export const handleSubmitPlanRequest = (
  clientIpc: ClientPostMessageManager,
  files: FileNode[]
) => {
  setState("isLoading")(true);
  const llmResponse = getChangePlanViewState("llmResponse");
  const changeDescription = getChangePlanViewState("changeDescription");
  if (!changeDescription) {
    setState("isLoading")(false);
    const fileChunkMap = getChangePlanViewState("fileChunkMap");
    const updatedFileChunkMap = Object.keys(fileChunkMap).reduce(
      (acc, filePath) => {
        acc[filePath] = {
          ...fileChunkMap[filePath],
          isLoading: false,
        };
        return acc;
      },
      {}
    );
    setChangePlanViewState("fileChunkMap")(updatedFileChunkMap);
    return;
  }

  const selectedFiles = getSelectedFiles(files);

  const isUpdatingPlan =
    getChangePlanViewState("chatHistory").length && llmResponse;

  let chatHistory = getChangePlanViewState("chatHistory");
  const messagesToSend = [];

  if (chatHistory.length > 0) {
    if (chatHistory.length > 2) {
      messagesToSend.push(chatHistory[1]); // Add second message if it exists
    }
    messagesToSend.push(chatHistory[chatHistory.length - 1]); // Add last message
  }

  const newChatHistory = [
    ...(isUpdatingPlan
      ? [
          ...chatHistory,
          {
            user: "instructor",
            message: AGENTS["Code Plan Update"]?.systemInstructions,
          },
        ]
      : [
          {
            user: "instructor",
            message: AGENTS["Code Plan"]?.systemInstructions,
          },
        ]),
    ...(messagesToSend || []),
    {
      user: "user",
      message: (isUpdatingPlan ? `Revise the plan:\n` : "") + changeDescription,
    },
  ];
  setState("chatHistory")(newChatHistory); // Update chatHistory in the store

  clientIpc.sendToServer(ClientToServerChannel.SendStreamMessage, {
    chatHistory: newChatHistory,
    selectedFiles,
  });
};
