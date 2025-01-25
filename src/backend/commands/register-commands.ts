import * as vscode from "vscode";
import { commands } from "./commands";

export function registerCommands(context: vscode.ExtensionContext) {
  // Iterate over the commands array to register each command
  commands.forEach(({ commandId, callback }) => {
    let disposable = vscode.commands.registerCommand(commandId, callback);
    context.subscriptions.push(disposable);
  });
}
