export const parseJsonResponse = (response: string): any | null => {
  try {
    if (!response) {
      return null;
    }
    const jsonStart = response.indexOf("```json");
    const jsonEnd = response.lastIndexOf("```") + 1;

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = response
        .substring(jsonStart + 7, jsonEnd - 2)
        ?.replaceAll("\n", "");
      return JSON.parse(jsonStr);
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
  return null;
};
