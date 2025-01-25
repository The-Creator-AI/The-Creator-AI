/**
 * Creates the prompt to send to the LLM for code updates.
 *
 * @param filePath The path to the file.
 * @param fileContent The content of the file.
 * @returns The prompt string.
 */
export function createPromptForLLM(
  filePath: string,
  fileContent: string
): string {
  return `Based on the plan above and previous conversation, please give the updated code for the file: ${filePath}.
  Also please make sure to give full file code in the response.
  `;
}
