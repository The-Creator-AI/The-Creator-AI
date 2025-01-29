import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Injectable } from "injection-js";
import { ServerToClientChannel } from "@/common/ipc/channels.enum";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import { FileNode } from "@/common/types/file-node";
import { Services } from "@/backend/services/services";

@Injectable()
export class FSService {
  createFileTree(
    workspaceRoots: vscode.Uri[],
    files: vscode.Uri[],
    fromSystemRoot = false
  ): FileNode[] {
    const rootNodes: FileNode[] = workspaceRoots.map((root) => {
      if (!fromSystemRoot) {
        return {
          name: root.path.split("/").pop() || "",
          children: [],
          absolutePath: root.fsPath,
        };
      }
      const parts = root.path.split("/").filter(Boolean);
      let currentNode: FileNode = {
        name: parts[0],
        children: [],
        absolutePath: "/" + parts[0],
      };
      let rootNode = currentNode;

      for (let i = 1; i < parts.length; i++) {
        const newNode: FileNode = {
          name: parts[i],
          children: [],
          absolutePath: path.join(currentNode.absolutePath, parts[i]),
        };
        currentNode.children!.push(newNode);
        currentNode = newNode;
      }

      return rootNode;
    });
    const leafNodes = rootNodes.map((root) => {
      let currentNode = root;
      while (currentNode.children && currentNode.children.length > 0) {
        currentNode = currentNode.children[currentNode.children.length - 1];
      }
      return currentNode;
    });

    const workspaceRootPaths = workspaceRoots.map((root) => root.fsPath);

    for (const file of files) {
      const workspaceRootIndex = workspaceRootPaths.findIndex((rootPath) =>
        file.fsPath.startsWith(rootPath)
      );

      if (workspaceRootIndex !== -1) {
        const relativePath = path.relative(
          workspaceRootPaths[workspaceRootIndex],
          file.fsPath
        );
        const parts = relativePath.split(path.sep).filter(Boolean);

        let currentNode = leafNodes[workspaceRootIndex];

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          let child = currentNode.children?.find((c) => c.name === part);

          if (!child) {
            child = {
              name: part,
              absolutePath: path.join(currentNode.absolutePath, part),
            };
            if (i < parts.length - 1) {
              child.children = [];
            }
            currentNode.children = currentNode.children || [];
            currentNode.children.push(child);
          }

          currentNode = child;
        }
      }
    }

    return rootNodes;
  }

  readFileContent(filePath: string): string {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      return data;
    } catch (error) {
      console.error("Error reading file:", error);
      return "Error reading file";
    }
  }

  readSelectedFilesContent(filePaths: string[]): {
    [filePath: string]: string;
  } {
    const fileContents: { [filePath: string]: string } = {};
    const processedPaths = new Set<string>();

    const readContentRecursive = (filePath: string) => {
      if (processedPaths.has(filePath)) {
        return;
      }
      processedPaths.add(filePath);

      try {
        if (fs.statSync(filePath).isDirectory()) {
          fs.readdirSync(filePath).forEach((file) =>
            readContentRecursive(path.join(filePath, file))
          );
        } else {
          try {
            fileContents[filePath] = fs.readFileSync(filePath, "utf8");
          } catch (error) {
            console.error(`Error reading file ${filePath}: ${error}`);
          }
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}: ${error}`);
      }
    };

    filePaths.forEach((filePath) => readContentRecursive(filePath));

    return fileContents;
  }

  async resolveFilePath(originalFilePath: string): Promise<string | null> {
    async function findFile(filePath: string): Promise<string | null> {
      const files = await vscode.workspace.findFiles(
        `**/${filePath}`,
        null,
        10
      );

      if (files.length === 1) {
        return files[0].fsPath;
      } else if (files.length > 1) {
        const selectedFile = await vscode.window.showQuickPick(
          files.map((file) => file.fsPath),
          {
            placeHolder: "Multiple files found. Please select the correct one.",
          }
        );
        return selectedFile || null;
      } else {
        const pathParts = filePath.split("/");
        if (pathParts.length > 1) {
          // Drop the first part of the path and try again
          const remainingPath = pathParts.slice(1).join("/");
          return findFile(remainingPath);
        }
        return null;
      }
    }

    const resolvedPath = await findFile(originalFilePath);

    if (resolvedPath) {
      return resolvedPath;
    } else {
      // File not found, ask the user to confirm or modify the path for creating an empty file
      // TODO: What if there are multiple workspace folders?
      const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
      let newFilePath = await vscode.window.showInputBox({
        prompt:
          "The file is not found. Please confirm or modify the file path to create an empty file.",
        value: originalFilePath,
      });
      const isAbsolute = path.isAbsolute(newFilePath);
      newFilePath = isAbsolute
        ? newFilePath
        : path.join(workspacePath, newFilePath);

      if (newFilePath) {
        const dirPath = path.dirname(newFilePath);

        // Create directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        console.log("Creating new file at", newFilePath);

        // Create empty file
        fs.writeFileSync(newFilePath, "");
        vscode.window.showTextDocument(vscode.Uri.file(newFilePath));
        return newFilePath;
      }
      return null;
    }
  }

  async handleFileOpen(data: { filePath: string }) {
    const { filePath } = data;

    const absoluteFilePath = await this.resolveFilePath(filePath);
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
          const workspacePath =
            vscode.workspace.workspaceFolders![0].uri.fsPath;
          const fullFilePath = path.join(workspacePath, absoluteFilePath);
          fs.writeFileSync(fullFilePath, "");
        }
      }

      await vscode.window.showTextDocument(vscode.Uri.file(absoluteFilePath), {
        preview: false,
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Error opening file: ${error}`);
    }
  }

  setupFileSystemWatcher(serverIpc: any) {
    let fileSystemWatcher: vscode.FileSystemWatcher | undefined;
    if (fileSystemWatcher) {
      fileSystemWatcher.dispose();
    }

    fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*");

    fileSystemWatcher.onDidCreate(() => this.sendWorkspaceFiles(serverIpc));
    fileSystemWatcher.onDidDelete(() => this.sendWorkspaceFiles(serverIpc));
    fileSystemWatcher.onDidChange(() => this.sendWorkspaceFiles(serverIpc));
  }

  async handleWorkspaceFilesRequest(serverIpc: ServerPostMessageManager) {
    await this.sendWorkspaceFiles(serverIpc);

    // Set up file system watcher if not already set
    this.setupFileSystemWatcher(serverIpc);
  }

  async sendWorkspaceFiles(serverIpc: ServerPostMessageManager) {
    const workspaceRoots =
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
    const fsService = Services.getFSService();
    const files = await fsService.getFilesRespectingGitignore();
    const workspaceFileTree = fsService.createFileTree(workspaceRoots, files);

    serverIpc.sendToClient(ServerToClientChannel.SendWorkspaceFiles, {
      files: workspaceFileTree,
    });
  }

  async getFilesRespectingGitignore(): Promise<vscode.Uri[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return [];
    }

    const gitignores = await this.findGitignores(workspaceFolder.uri);
    const allFiles = await vscode.workspace.findFiles("**/*");

    return allFiles.filter((file) => !this.isIgnored(file.fsPath, gitignores));
  }

  async findGitignores(workspaceUri: vscode.Uri): Promise<any[]> {
    const gitignoreFiles = await vscode.workspace.findFiles("**/.gitignore");
    const gitignores: any[] = [];

    for (const gitignoreUri of gitignoreFiles) {
      const content = await vscode.workspace.fs.readFile(gitignoreUri);
      gitignores.push({
        path: path.dirname(gitignoreUri.fsPath),
        ig: this.ignore().add(content.toString()),
      });
    }

    return gitignores;
  }

  ignore(): any {
    return {
      add: (content: string) => {
        const ignored = (filePath: string) => {
          return content
            .split("\n")
            .filter(Boolean)
            .some((line) => filePath.includes(line));
        };

        return {
          ignores: ignored,
        };
      },
    };
  }

  isIgnored(filePath: string, gitignores: any[]): boolean {
    for (const { path: gitignorePath, ig } of gitignores) {
      if (filePath.startsWith(gitignorePath)) {
        const relativePath = path.relative(gitignorePath, filePath);
        if (ig.ignores(relativePath)) {
          return true;
        }
      }
    }
    return false;
  }
}
