import { Services } from "@/backend/services/services";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "@/common/ipc/channels.enum";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import { CodeService } from "./code.service";
import {
  RequestFileCodeDTO,
  RequestStreamFileCodeDTO,
} from "./code.dto";

export function controller(serverIpc: ServerPostMessageManager) {
  const handlers = [
    {
      channel: ClientToServerChannel.RequestFileCode,
      handler: async (data: RequestFileCodeDTO) => {
        const res = await Services.getService(CodeService).requestFileCode(
          data.filePath,
          data.chatHistory,
          data.selectedFiles
        );
        serverIpc.sendToClient(ServerToClientChannel.SendFileCode, res);
      },
    },
    {
      channel: ClientToServerChannel.RequestStreamFileCode,
      handler: async (data: RequestStreamFileCodeDTO) => {
        const res = await Services.getService(CodeService).requestFileCode(
          data.filePath,
          data.chatHistory,
          data.selectedFiles,
          (filePath, chunk) => {
            serverIpc.sendToClient(ServerToClientChannel.StreamFileCode, {
              filePath,
              chunk,
            });
          }
        );
        serverIpc.sendToClient(ServerToClientChannel.SendFileCode, res);
      },
    },
  ];

  handlers.forEach(({ channel, handler }) => {
    serverIpc.onClientMessage(channel, handler);
  });
}
