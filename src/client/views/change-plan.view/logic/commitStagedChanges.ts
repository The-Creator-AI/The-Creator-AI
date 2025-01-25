import { ClientToServerChannel } from "@/common/ipc/channels.enum";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";

export const commitStagedChanges = (message: string, description: string) => {
  const clientIpc = ClientPostMessageManager.getInstance();
  clientIpc.sendToServer(ClientToServerChannel.CommitStagedChanges, {
    message,
    description,
  });
};
