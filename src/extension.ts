import * as vscode from "vscode";
import { registerCommands, registerViews } from "./client/views";
import { Services } from "./backend/services/services";

let globalContext: vscode.ExtensionContext | null = null;
export function activate(context: vscode.ExtensionContext) {
  globalContext = context;

  console.log(
    'Congratulations, your extension "the-creator-ai" is now active!'
  );

  registerCommands(context);
  registerViews(context);
  Services.initialize();
}

export function getContext() {
  return globalContext;
}

export function deactivate() {}
