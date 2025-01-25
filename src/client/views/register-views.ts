import * as vscode from "vscode";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import { getNonce } from "./nonce";
import { views } from "./views";

export const serverIPCs: Record<string,ServerPostMessageManager> = {
};

export function registerViews(context: vscode.ExtensionContext) {
  views.forEach((viewConfig) => {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(viewConfig.type, {
        resolveWebviewView: (webviewView, _, token) => {
          webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [context.extensionUri],
          };

          const nonce = getNonce();
          webviewView.webview.html = viewConfig.getHtml(
            webviewView.webview,
            nonce,
            context.extensionUri
          );

          const serverIpc = ServerPostMessageManager.getInstance(
            webviewView.webview.onDidReceiveMessage,
            (data: any) => webviewView.webview.postMessage(data)
          );

          serverIPCs[viewConfig.type] = serverIpc;

          viewConfig.handleMessage(serverIpc);
        },
      })
    );
  });
}
