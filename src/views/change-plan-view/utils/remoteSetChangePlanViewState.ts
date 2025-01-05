import * as vscode from "vscode";
import { ServerToClientChannel } from "../../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../../ipc/server-ipc";
import { KeyPaths, KeyPathValue } from "src/utils/key-path";
import { ChangePlanViewStore } from "../store/change-plan-view.state-type";

/**
 * Handles active tab changes in VS Code and sends the active file path to the server.
 *
 * @param serverIpc - The server IPC instance used to send messages to the server.
 * @param keyPath - The key path to set in the change plan view store.
 * @param value - The value to set at the key path in the change plan view store.
 */
export const remoteSetChangePlanViewState = <
  Key extends KeyPaths<ChangePlanViewStore>
>(
  serverIpc: ServerPostMessageManager,
  keyPath: Key,
  value: KeyPathValue<Key, ChangePlanViewStore>
) => {
  serverIpc.sendToClient(ServerToClientChannel.SetChangePlanViewState, {
    keyPath,
    value,
  });
};
