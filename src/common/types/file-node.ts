export interface FileNode {
  name: string;
  children?: FileNode[];
  absolutePath?: string;
}
