import { useState, useCallback, useEffect } from 'react';
import { FileNode, ProjectState, BuildError, ModelMode, Project } from '../types';

const STORAGE_KEY = 'gemini_code_studio_projects';

export function useProject() {
  const [state, setState] = useState<ProjectState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialProjects = saved ? JSON.parse(saved) : [];
    return {
      projects: initialProjects,
      currentProjectId: null,
      activeFilePath: null,
      isGenerating: false,
      errors: [],
      view: 'home'
    };
  });

  const [mode, setMode] = useState<ModelMode>('gemini-3.5-flash');

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects));
  }, [state.projects]);

  const currentProject = state.projects.find(p => p.id === state.currentProjectId) || null;

  const createProject = useCallback(async (prompt: string, name?: string) => {
    setState(prev => ({ ...prev, isGenerating: true }));
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: mode })
      });
      const data = await response.json();
      
      if (data.files) {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name: name || `App ${state.projects.length + 1}`,
          description: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''),
          files: data.files,
          improvements: data.improvements,
          createdAt: Date.now()
        };

        setState(prev => ({
          ...prev,
          projects: [newProject, ...prev.projects],
          currentProjectId: newProject.id,
          activeFilePath: newProject.files[0]?.path || null,
          isGenerating: false,
          errors: [],
          view: 'editor'
        }));
      }
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [mode, state.projects.length]);

  const openProject = useCallback((id: string) => {
    const project = state.projects.find(p => p.id === id);
    if (project) {
      setState(prev => ({
        ...prev,
        currentProjectId: id,
        activeFilePath: project.files[0]?.path || null,
        view: 'editor',
        errors: []
      }));
    }
  }, [state.projects]);

  const goToHome = useCallback(() => {
    setState(prev => ({ ...prev, view: 'home', currentProjectId: null }));
  }, []);

  const updateFileContent = useCallback((path: string, content: string) => {
    if (!state.currentProjectId) return;
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === prev.currentProjectId 
          ? { ...p, files: p.files.map(f => f.path === path ? { ...f, content } : f) }
          : p
      )
    }));
  }, [state.currentProjectId]);

  const fixErrors = useCallback(async () => {
    if (!currentProject) return;
    setState(prev => ({ ...prev, isGenerating: true }));
    try {
      const response = await fetch('/api/fix-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: currentProject.files, errors: state.errors })
      });
      const data = await response.json();
      if (data.files) {
        setState(prev => ({
          ...prev,
          projects: prev.projects.map(p => 
            p.id === prev.currentProjectId 
              ? { ...p, files: data.files, improvements: data.improvements }
              : p
          ),
          isGenerating: false,
          errors: []
        }));
      }
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [currentProject, state.errors, state.currentProjectId]);

  const setActiveFile = useCallback((path: string) => {
    setState(prev => ({ ...prev, activeFilePath: path }));
  }, []);

  const runLint = useCallback(() => {
    if (!currentProject) return;
    const newErrors: BuildError[] = [];
    currentProject.files.forEach(file => {
      if (file.language === 'html' && file.path === 'index.html') {
        if (!file.content.includes('<body')) {
          newErrors.push({ file: file.path, message: 'Missing <body> tag in index.html', severity: 'error' });
        }
      }
      if ((file.language === 'typescript' || file.language === 'javascript') && file.content.includes('TODO')) {
        newErrors.push({ file: file.path, message: 'Unresolved TODO item', severity: 'warning' });
      }
    });
    setState(prev => ({ ...prev, errors: newErrors }));
  }, [currentProject]);

  return {
    state,
    currentProject,
    mode,
    setMode,
    createProject,
    openProject,
    goToHome,
    updateFileContent,
    fixErrors,
    setActiveFile,
    runLint
  };
}
