/**
 * Extracts the first code block from the LLM response.
 *
 * @param response The LLM response.
 * @returns The extracted code block, or the entire response if no code block is found.
 */
export function extractCodeFromResponse(response: string): string {
  const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/;
  const match = response.match(codeBlockRegex);
  return match ? match[1] : response;
}
