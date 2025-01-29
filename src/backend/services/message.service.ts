import { Injectable } from "injection-js";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import { mergeOpenEditorsWithSelectedFiles } from "@/backend/utils/mergeOpenEditorsWithSelectedFiles";
import { Services } from "./services";
import { ServerToClientChannel } from "@/common/ipc/channels.enum";

@Injectable()
export class MessageService {

  async sendMessage(
    serverIpc: ServerPostMessageManager,
    data: {
      chatHistory: any[];
      selectedFiles: string[];
    }
  ) {
    const { chatHistory, selectedFiles } = data;

    const updatedSelectedFiles = mergeOpenEditorsWithSelectedFiles(selectedFiles);

    const response = await Services.getLlmService().sendPrompt(
      chatHistory,
      updatedSelectedFiles
    );

    serverIpc.sendToClient(ServerToClientChannel.SendMessage, {
      message: response.response,
    });
  }

  async streamMessage(
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
}