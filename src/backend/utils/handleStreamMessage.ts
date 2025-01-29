import { Services } from "@/backend/services/services";
import { ServerToClientChannel } from "@/common/ipc/channels.enum";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import { mergeOpenEditorsWithSelectedFiles } from "./mergeOpenEditorsWithSelectedFiles";

export async function handleStreamMessage(
  serverIpc: ServerPostMessageManager,
  data: {
    chatHistory: any[];
    selectedFiles: string[];
  }
) {
  try {
    const { chatHistory, selectedFiles } = data;

    const updatedSelectedFiles =
      mergeOpenEditorsWithSelectedFiles(selectedFiles);

    const response = await Services.getLlmService().sendPrompt(
      chatHistory,
      updatedSelectedFiles,
      (chunk: string) => {
        serverIpc.sendToClient(ServerToClientChannel.StreamMessage, { chunk });
      }
    );
    serverIpc.sendToClient(ServerToClientChannel.SendMessage, {
      message: response.response,
    });
  } catch (error: any) {
    serverIpc.sendToClient(ServerToClientChannel.SendMessage, error.message);
  }
}
