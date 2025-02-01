import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import { getChangePlanViewState } from "../store/change-plan-view.store";
import { ClientToServerChannel } from "@/common/ipc/channels.enum";

export const requestCommitMessageSuggestions = () => {
  const chatHistory = getChangePlanViewState("chatHistory");
  const clientIpc = ClientPostMessageManager.getInstance();
  clientIpc.sendToServer(
    ClientToServerChannel.RequestCommitMessageSuggestions,
    {
      chatHistory,
    }
  );
};
