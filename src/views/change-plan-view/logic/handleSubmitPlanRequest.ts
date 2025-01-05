import { AGENTS } from "@/constants/agents.constants";
import { ClientToServerChannel } from "@/ipc/channels.enum";
import {setChangePlanViewState as setState, setChangePlanViewState} from '@/views/change-plan-view/store/change-plan-view.logic';
import { getChangePlanViewState } from "@/views/change-plan-view/store/change-plan-view.store";
import { getSelectedFiles } from "@/views/change-plan-view/logic/getSelectedFiles";
import { ClientPostMessageManager } from "@/ipc/client-ipc";
import { FileNode } from "@/types/file-node";

export const handleSubmitPlanRequest = (
  clientIpc: ClientPostMessageManager,
  files: FileNode[]
) => {
  setState("isLoading")(true);
  const llmResponse = getChangePlanViewState("llmResponse");
  const changeDescription = getChangePlanViewState("changeDescription");
  if (!changeDescription) {
    setState("isLoading")(false);
    const fileChunkMap = getChangePlanViewState('fileChunkMap');
    const updatedFileChunkMap = Object.keys(fileChunkMap).reduce((acc, filePath) => {
      acc[filePath] = {
        ...fileChunkMap[filePath],
        isLoading: false,
      };
      return acc;
    }, {});
    setChangePlanViewState('fileChunkMap')(updatedFileChunkMap);
    return;
  }

  const selectedFiles = getSelectedFiles(files);
  const newChatHistory = [
    ...(getChangePlanViewState("chatHistory").length < 1 || !llmResponse
      ? [
          {
            user: "instructor",
            message: AGENTS["Code Plan"]?.systemInstructions,
          },
        ]
      : [
          ...getChangePlanViewState("chatHistory"), // Use chatHistory from store
          {
            user: "instructor",
            message: AGENTS["Code Plan Update"]?.systemInstructions,
          },
        ]),
    { user: "user", message: `Revise the plan:\n` + changeDescription },
  ];
  setState("chatHistory")(newChatHistory); // Update chatHistory in the store

  clientIpc.sendToServer(ClientToServerChannel.SendStreamMessage, {
    chatHistory: newChatHistory,
    selectedFiles,
  });
};
