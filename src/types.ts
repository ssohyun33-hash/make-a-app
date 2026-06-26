export interface FileNode {
  path: string;
  content: string;
  language: string;
}

export interface BuildError {
  file: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: FileNode[];
  improvements: string;
  createdAt: number;
}

export interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  activeFilePath: string | null;
  isGenerating: boolean;
  errors: BuildError[];
  view: 'home' | 'editor';
}

export type ModelMode = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
