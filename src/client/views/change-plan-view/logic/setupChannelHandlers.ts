import {
    ClientToServerChannel,
    ServerToClientChannel,
} from "@/common/ipc/channels.enum";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import { FileNode } from "@/common/types/file-node";
import { KeyPaths, KeyPathValue } from "@/common/utils/key-path";
import { ChangePlanSteps } from "@/client/views/change-plan-view/change-plan-view.types";
import { updateOrCreateChangePlan } from "@/client/views/change-plan-view/logic/updateOrCreateChangePlan";
import {
    setChangePlanViewState as setState
} from "@/client/views/change-plan-view/store/change-plan-view.logic";
import { ChangePlanViewStore } from "@/client/views/change-plan-view/store/change-plan-view.state-type";
import { getChangePlanViewState } from "@/client/views/change-plan-view/store/change-plan-view.store";

export const setupChannelHandlers = (
  setFiles: React.Dispatch<React.SetStateAction<FileNode[]>>
) => {
  const clientIpc = ClientPostMessageManager.getInstance();

  const handleSendMessage = ({ message }: { message: string }) => {
    setState("isLoading")(false);
    setState("llmResponse")(message);
    setState("changeDescription")("");
    setState("currentStep")(ChangePlanSteps.Plan);

    // Update chat history
    setState("chatHistory")([
      ...getChangePlanViewState("chatHistory"),
      { user: "bot", message },
    ]);

    // Update or add the new change plan
    updateOrCreateChangePlan(message);
  };

  const handleStreamMessage = ({ chunk }: { chunk: string }) => {
    setState("llmResponse")(getChangePlanViewState("llmResponse") + chunk);
  };

  const handleSendWorkspaceFiles = ({ files }: { files: FileNode[] }) => {
    setFiles(files);
  };

  const handleSendFileCode = ({
    fileContent,
    filePath,
  }: {
    fileContent: string;
    filePath: string;
  }) => {
    if (filePath) {
      try {
        console.log(fileContent);
        console.log(`File ${filePath} updated successfully.`);
      } catch (err) {
        console.error(`Error updating file ${filePath}:`, err);
      }
    }
  };

  const handleSetChangePlanViewState = <
    Key extends KeyPaths<ChangePlanViewStore>
  >(data: {
    keyPath: Key;
    value: KeyPathValue<Key, ChangePlanViewStore>;
  }) => {
    console.log({ data });
    setState(data.keyPath)(data.value);
  };

  clientIpc.onServerMessage(
    ServerToClientChannel.SendMessage,
    handleSendMessage
  );
  clientIpc.onServerMessage(
    ServerToClientChannel.StreamMessage,
    handleStreamMessage
  );

  // Request workspace files on component mount
  clientIpc.sendToServer(ClientToServerChannel.RequestWorkspaceFiles, {});

  // Listen for workspace files response
  clientIpc.onServerMessage(
    ServerToClientChannel.SendWorkspaceFiles,
    handleSendWorkspaceFiles
  );

  // Listener for SendFileCode
  clientIpc.onServerMessage(
    ServerToClientChannel.SendFileCode,
    handleSendFileCode
  );

  clientIpc.onServerMessage(
    ServerToClientChannel.SetChangePlanViewState,
    handleSetChangePlanViewState
  );

  clientIpc.sendToServer(ClientToServerChannel.FetchStore, {
    storeName: "changePlanViewState",
  });
};
