import * as child_process from "child_process";
import * as vscode from "vscode";

/**
 * Commits changes to the Git repository with the provided message.
 *
 * @param commitMessage - The commit message to use.
 * @param commitDescription - (Optional) A commit description to include.
 * @returns The Git commit output as a string, or an empty string if an error occurs.
 */
export const gitCommit = (
  commitMessage: string,
  commitDescription?: string
): string => {
  try {
    // 1. Construct the commit command
    let commitCommand = `git commit -m "${commitMessage}"`;

    // 2. (Optional) Include description if provided
    if (commitDescription?.trim()) {
      commitCommand += ` -m "${commitDescription}"`;
    }

    // 3. Execute the commit command
    // current working directory
    const commitOutput = child_process.execSync(commitCommand, {
        cwd: vscode.workspace.rootPath,
    });

    // 4. Handle the commit result
    console.log("Commit successful:", commitOutput.toString());
    return commitOutput.toString();
  } catch (error) {
    console.error("Error during commit:", error);
    return "";
  }
};
