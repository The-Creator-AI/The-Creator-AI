import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from 'injection-js';

@Injectable()
export class CreatorService {
  getDirectoryStructure(dir: string, loadShallow: boolean = false, level = 0) {
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      const children: any = files
        .filter(file => !['.git', 'node_modules'].includes(file.name)) // Filter out unwanted directories
        .map((file) => {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            return {
              name: file.name,
              children: loadShallow && level >= 1 ? [] : this.getDirectoryStructure(fullPath, loadShallow, level + 1),
            };
          } else {
            return { name: file.name };
          }
        });
      return children;
    } catch (error) {
      console.error('Error reading directory:', error);
      // Handle the error appropriately, e.g., throw an error, return a default value, etc.
      return []; // Return an empty array if there's an error
    }
  }


  getFileContent(filePath: string): string {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return data;
    } catch (error) {
      console.error('Error reading file:', error);
      return 'Error reading file';
    }
  }

  readSelectedFilesContent(filePaths: string[]): { [filePath: string]: string } {
    const fileContents: { [filePath: string]: string } = {};
    const processedPaths = new Set<string>();

    const readContentRecursive = (filePath: string) => {
      if (processedPaths.has(filePath)) {
        return;
      }
      processedPaths.add(filePath);

      try {
        if (fs.statSync(filePath).isDirectory()) {
          fs.readdirSync(filePath).forEach(file => readContentRecursive(path.join(filePath, file)));
        } else {
          try {
            fileContents[filePath] = fs.readFileSync(filePath, 'utf8');
          } catch (error) {
            console.error(`Error reading file ${filePath}: ${error}`);
          }
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}: ${error}`);
      }
    };

    filePaths.forEach(filePath => readContentRecursive(filePath));

    return fileContents;
  }

}