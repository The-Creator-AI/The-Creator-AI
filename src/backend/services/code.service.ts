import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Injectable } from "injection-js";
import { Services } from "./services";
import { AGENTS } from "@/common/constants/agents.constants";

@Injectable()
export class CodeService {
  public findFilePaths(paths: string[]): string[] {
    return paths.map(this.findFilePath.bind(this)); // Bind to the service instance
  }

  public findFilePath(filePath: string): string {
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    const parts = filePath.split(path.sep);
    let currentPath = parts[0];

    // Traverse the path from the top to find the deepest valid directory
    for (let i = 1; i < parts.length; i++) {
      currentPath = path.join(currentPath, parts[i]);
      if (!fs.existsSync(currentPath)) {
        currentPath = path.dirname(currentPath);
        break;
      }
    }

    const fileName = parts[parts.length - 1];
    let dirToSearch = currentPath;
    let foundFiles = this.findFilesInDirectory(dirToSearch, fileName);

    while (!foundFiles?.length) {
      dirToSearch = path.dirname(dirToSearch);
      if (dirToSearch === ".") break;
      foundFiles = this.findFilesInDirectory(dirToSearch, fileName);
    }

    if (foundFiles.length === 1) {
      return foundFiles[0];
    } else if (foundFiles.length > 1) {
      const parentDir = parts[parts.length - 2];
      for (const file of foundFiles) {
        if (path.basename(path.dirname(file)) === parentDir) {
          return file;
        }
      }
    }

    console.error(`File not found: ${filePath}`);
    console.log(`Creating file: ${filePath}`);

    fs.writeFileSync(filePath, "", "utf-8");
    return filePath;
  }

  /**
   * Recursively searches for files with a given name in a directory and its subdirectories.
   * @param dir The directory to search in.
   * @param fileName The name of the file to search for.
   * @returns An array of file paths that match the file name.
   */
  private findFilesInDirectory(dir: string, fileName: string): string[] {
    try {
      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) return [];
    } catch (err) {
      return [];
    }

    const files: string[] = [];
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isFile() && path.basename(fullPath) === fileName) {
          files.push(fullPath);
        } else if (stat.isDirectory()) {
          files.push(...this.findFilesInDirectory(fullPath, fileName)); // Use this.findFilesInDirectory
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${dir}:`, err);
    }

    return files;
  }

  getDiff(diffText: string) {
    const diffLines = diffText.split("\n");

    let fileToChange: string | undefined = undefined;
    let originalCode: string | undefined = undefined;
    let modifiedCode: string | undefined = undefined;
    let inSearchBlock = false;
    let inReplaceBlock = false;
    let inFilePathBlock = false;

    const changes = [];

    for (const line of diffLines) {
      if (line.startsWith("\`\`\`diff")) {
        if (fileToChange && originalCode && modifiedCode) {
          changes.push({ fileToChange, originalCode, modifiedCode });
        }
        fileToChange = undefined;
        originalCode = undefined;
        modifiedCode = undefined;
        inFilePathBlock = true;
        continue;
      }

      if (inFilePathBlock) {
        fileToChange = line.trim();
        inFilePathBlock = false;
        continue;
      }

      if (line.startsWith("<<<<<<< SEARCH")) {
        inSearchBlock = true;
        inReplaceBlock = false;
        continue;
      }

      if (line.startsWith("=======")) {
        inSearchBlock = false;
        inReplaceBlock = true;
        continue;
      }

      if (line.startsWith(">>>>>>>")) {
        if (fileToChange && originalCode && modifiedCode) {
          changes.push({ fileToChange, originalCode, modifiedCode });
        }
        fileToChange = undefined;
        originalCode = undefined;
        modifiedCode = undefined;
        inSearchBlock = false;
        inReplaceBlock = false;
        continue;
      }

      if (inSearchBlock && originalCode !== undefined) {
        originalCode += line + "\n";
      } else if (inSearchBlock) {
        originalCode = line + "\n";
      } else if (inReplaceBlock && modifiedCode !== undefined) {
        modifiedCode += line + "\n";
      } else if (inReplaceBlock) {
        modifiedCode = line + "\n";
      }
    }

    // Push the last block if it exists
    if (fileToChange && originalCode && modifiedCode) {
      changes.push({ fileToChange, originalCode, modifiedCode });
    }

    return changes;
  }

  public async applyDiffs(
    diffText: string,
    trySmartApply: (
      filePath: string,
      originalCode: string,
      modifiedCode: string
    ) => void
  ): Promise<void> {
    const blocks = this.getDiff(diffText);
    console.log({ diffText, blocks });

    for await (const block of blocks) {
      const { fileToChange, originalCode, modifiedCode } = block;

      const currentFilePath = this.findFilePath(fileToChange); // Use injected service

      const resCode = await this.applyChangesToFile(
        currentFilePath,
        originalCode,
        modifiedCode
      );

      if (resCode) {
        trySmartApply(currentFilePath, originalCode, modifiedCode);
      }
    }
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private async applyChangesToFile(
    filePath: string,
    originalCode: string,
    modifiedCode: string
  ): Promise<boolean> {
    console.log({ filePath, originalCode, modifiedCode });

    try {
      const fileContent = await fs.promises.readFile(filePath, "utf8");

      const whitespaceFlexibleOriginalCode = this.escapeRegExp(originalCode)
        .split("\n")
        .map((line) => line.trim().replace(/\s+/g, "\\s+"))
        .join("\\s*");

      const regex = new RegExp(whitespaceFlexibleOriginalCode, "g");
      console.log({ whitespaceFlexibleOriginalCode });

      const updatedContent = fileContent.replace(regex, modifiedCode);

      await fs.promises.writeFile(filePath, updatedContent, "utf8");
      console.log(`Applied changes to ${filePath}`);

      return fileContent === updatedContent;
    } catch (error) {
      console.error(`Error applying changes to ${filePath}:`, error);
      return false; // Indicate failure
    }
  }

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

  private extractDiffFromResponse(response: string): string {
    const diffBlockRegex = /```diff\n([\s\S]*?)\n```/;
    console.log(response);
    const match = response.match(diffBlockRegex);
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
  ) {
    ``;
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
          {
            user: "instructor",
            message: AGENTS.Developer_diff.systemInstructions,
          },
          { user: "user", message: finalMessage },
        ],
        selectedFiles,
        (chunk: string) => {
          if (onChunk) {
            onChunk(absoluteFilePath, chunk);
          }
        }
      );

      const updatedCode = await this.applyDiffs(response.response, () => {});

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
