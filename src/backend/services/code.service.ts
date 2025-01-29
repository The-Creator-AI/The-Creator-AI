import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Injectable } from "injection-js";
import { Services } from "./services";
import { AGENTS } from "@/common/constants/agents.constants";

@Injectable()
export class CodeService {
  private getFileContent(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const data = fs.readFileSync(filePath, "utf-8");
        resolve(data);
      } catch (error) {
        console.error("Error reading file:", error);
        reject("Error reading file");
      }
    });
  }

  private async writeFileContent(
    filePath: string,
    content: string
  ): Promise<void> {
    const fileUri = vscode.Uri.file(filePath);
    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));
  }

  private async openFileAndShowDiff(filePath: string): Promise<void> {
    const fileUri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(fileUri);
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("git.openChange", fileUri);
  }

  private extractCodeFromResponse(response: string): string {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/;
    const match = response.match(codeBlockRegex);
    return match ? match[1] : response;
  }

  private createPromptForLLM(filePath: string, fileContent: string): string {
    return `Based on the plan above and previous conversation, please give the updated code for the file: ${filePath}.
      Also please make sure to give full file code in the response.
      `;
  }

  async requestFileCode(
    filePath: string,
    chatHistory: any[],
    selectedFiles: string[],
    onChunk?: (path: string, chunk: string) => void
  ) {``
    const fsService = Services.getFSService();
    const absoluteFilePath = await fsService.resolveFilePath(filePath);
    if (!absoluteFilePath) {
      throw new Error(`Could not resolve file path: ${filePath}`);
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
          const workspacePath =
            vscode.workspace.workspaceFolders![0].uri.fsPath;
          const fullFilePath = path.join(workspacePath, absoluteFilePath);
          fs.writeFileSync(fullFilePath, "");
        }
      }

      const fileContentString = await this.getFileContent(absoluteFilePath);
      const finalMessage = this.createPromptForLLM(
        absoluteFilePath,
        fileContentString
      );
      const response = await Services.getLlmService().sendPrompt(
        [
          ...chatHistory,
          { user: "instructor", message: AGENTS.Developer.systemInstructions },
          { user: "user", message: finalMessage },
        ],
        selectedFiles,
        (chunk: string) => {
          if (onChunk) {
            onChunk(absoluteFilePath, chunk);
          }
        }
      );

      const updatedCode = this.extractCodeFromResponse(response.response);
      await this.writeFileContent(absoluteFilePath, updatedCode);

      // TODO: Instead of showing the diff after making change, we can show it before and ask user to apply the changes
      //   await this.openFileAndShowDiff(absoluteFilePath);
      return {
        filePath: absoluteFilePath,
        fileContent: response.response,
      };
    } catch (error) {
      console.error(`Error processing file: ${error}`);
      throw error;
    }
  }
}
