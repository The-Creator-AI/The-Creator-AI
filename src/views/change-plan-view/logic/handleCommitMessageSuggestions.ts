import { ServerToClientChannel } from "@/ipc/channels.enum";
import { ClientPostMessageManager } from "@/ipc/client-ipc";
import { setChangePlanViewState } from "../store/change-plan-view.logic";

export const handleCommitMessageSuggestions = () => {
  const clientIpc = ClientPostMessageManager.getInstance();
  clientIpc.onServerMessage(
    ServerToClientChannel.SendCommitMessageSuggestions,
    (message) => {
      setChangePlanViewState("commitSuggestions")(message.suggestions);
      setChangePlanViewState("commitSuggestionsLoading")(false);
    }
  );
};
