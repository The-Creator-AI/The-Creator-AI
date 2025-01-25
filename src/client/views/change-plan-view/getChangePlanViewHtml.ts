import * as vscode from "vscode";
import { getViewHtml } from "@/common/utils/get-view-html";

// Function to get HTML for change plan view
export function getChangePlanViewHtml(
  webview: vscode.Webview,
  nonce: string,
  extensionUri: vscode.Uri
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "changePlanView.js")
  );
  return getViewHtml({ webview, nonce, scriptUri: scriptUri.toString() });
}
