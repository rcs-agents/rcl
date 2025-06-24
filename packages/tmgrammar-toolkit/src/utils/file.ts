/**
   * Check if a file exists
   */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    const fs = await import('node:fs/promises');
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Read a JSON file and parse it
 */
export const readJson = async (filePath: string): Promise<any> => {
  const fs = await import('node:fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
};

/**
 * Write an object to a JSON file
 */
export const writeJson = async (filePath: string, data: any, indent = 2): Promise<void> => {
  const fs = await import('node:fs/promises');
  const content = JSON.stringify(data, null, indent);
  await fs.writeFile(filePath, content, 'utf-8');
};