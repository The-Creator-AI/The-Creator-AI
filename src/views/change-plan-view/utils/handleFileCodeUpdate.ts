import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { resolveFilePath } from "./resolveFilePath";
import { extractCodeFromResponse } from "./extractCodeFromResponse";
import { writeFileContent } from "./writeFileContent";
import { openFileAndShowDiff } from "./openFileAndShowDiff";
import { Services } from "../../../backend/services/services";
import { getFileContent } from "./getFileContent";
import { createPromptForLLM } from "./createPromptForLLM";
import { AGENTS } from "../../../constants/agents.constants";
import {
  ServerToClientChannel
} from "../../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../../ipc/server-ipc";

/**
 * Handles the `RequestFileCode` message from the client, fetching the file code,
 * sending it to the LLM for updates, applying the updates, and opening the file in VS Code.
 *
 * @param data An object containing the file path and chat history.
 */
export async function handleFileCodeUpdate(
  serverIpc: ServerPostMessageManager,
  data: {
    filePath: string;
    chatHistory: any[];
    selectedFiles: string[];
  }
) {
  const { filePath, chatHistory, selectedFiles } = data;
  console.log({ data });

  const absoluteFilePath = await resolveFilePath(filePath);
  if (!absoluteFilePath) {
    return; // Error message already shown in resolveFilePath
  }

  try {
    // Check if the file exists
    if (!fs.existsSync(absoluteFilePath)) {
      // If the file doesn't exist, create it
      if (path.isAbsolute(absoluteFilePath)) {
        // If the path is absolute, create it at that path
        fs.writeFileSync(absoluteFilePath, "");
      } else {
        // If the path is relative, create it relative to the workspace directory
        const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const fullFilePath = path.join(workspacePath, absoluteFilePath);
        fs.writeFileSync(fullFilePath, "");
      }
    }

    const fileContentString = await getFileContent(absoluteFilePath);

    const finalMessage = createPromptForLLM(
      absoluteFilePath,
      fileContentString
    );

    const response = await Services.getLlmService().sendPrompt([
      ...chatHistory,
      { user: "instructor", message: AGENTS.Developer.systemInstructions },
      { user: "user", message: finalMessage },
    ], selectedFiles, (chunk: string) => {
      serverIpc.sendToClient(ServerToClientChannel.StreamFileCode, {
        filePath: absoluteFilePath,
        chunk
      });
    });

    // Send the complete code after all chunks have been sent
    const updatedCode = extractCodeFromResponse(response.response);
    await writeFileContent(absoluteFilePath, updatedCode);

    await openFileAndShowDiff(absoluteFilePath);

    serverIpc.sendToClient(ServerToClientChannel.SendFileCode, {
      filePath: absoluteFilePath,
      fileContent: response.response,
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Error processing file: ${error}`);
  }
}