import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import { sendWorkspaceFiles } from "./sendWorkspaceFiles";
import { setupFileSystemWatcher } from "./setupFileSystemWatcher";

/**
 * Handles the `RequestWorkspaceFiles` message from the client,
 * sending the workspace files and setting up a file system watcher.
 */
export async function handleWorkspaceFilesRequest(
  serverIpc: ServerPostMessageManager
) {
  await sendWorkspaceFiles(serverIpc);

  // Set up file system watcher if not already set
  setupFileSystemWatcher(serverIpc);
}
