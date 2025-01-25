import { ClientToServerChannel } from "@/common/ipc/channels.enum";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";

export const handleFileClick = ({
  clientIpc,
  setActiveFile,
  filePath,
}: {
  clientIpc: ClientPostMessageManager;
  setActiveFile: React.Dispatch<React.SetStateAction<string>>;
  filePath: string;
}) => {
  setActiveFile(filePath);

  // Send the selected editor path to the extension
  clientIpc.sendToServer(ClientToServerChannel.SendSelectedEditor, {
    editor: {
      fileName: filePath.split("/").pop() || "",
      filePath,
      languageId: "", // You might need to determine the languageId here
    },
  });
};
