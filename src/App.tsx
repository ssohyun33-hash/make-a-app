import React, { useState } from 'react';
import { FileTree } from './components/FileTree';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Terminal } from './components/Terminal';
import { GitHubModal } from './components/GitHubModal';
import { Home } from './components/Home';
import { useProject } from './hooks/useProject';
import { Download, Github, Play, Sparkles, Zap, MessageSquare, Home as HomeIcon, Settings, Code } from 'lucide-react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { 
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
  } = useProject();

  const [prompt, setPrompt] = useState('');
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showImprovements, setShowImprovements] = useState(false);

  const activeFile = currentProject?.files.find(f => f.path === state.activeFilePath) || null;

  const handleDownload = async () => {
    if (!currentProject) return;
    const zip = new JSZip();
    currentProject.files.forEach(file => {
      zip.file(file.path, file.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}.zip`;
    link.click();
  };

  const handleGenerate = () => {
    if (prompt.trim()) {
      createProject(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="flex h-screen font-sans bg-[#0f172a] text-slate-100 overflow-hidden">
      {/* Navigation Rail */}
      <nav className="w-16 bg-[#1e293b] border-r border-slate-800 flex flex-col items-center py-6 gap-6 z-20">
        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Zap size={24} className="text-white" />
        </div>
        
        <div className="flex flex-col gap-4 flex-1">
          <button
            onClick={goToHome}
            className={cn(
              "p-3 rounded-xl transition-all",
              state.view === 'home' ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            )}
            title="Home"
          >
            <HomeIcon size={20} />
          </button>
          {currentProject && (
            <button
              onClick={() => {}}
              className={cn(
                "p-3 rounded-xl transition-all",
                state.view === 'editor' ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              )}
              title="Editor"
            >
              <Code size={20} />
            </button>
          )}
        </div>

        <button className="p-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
          <Settings size={20} />
        </button>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Main Header (Conditional) */}
        {state.view === 'editor' && (
          <header className="flex items-center justify-between px-6 py-3 bg-[#1e293b]/50 backdrop-blur-sm border-b border-slate-800 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="font-bold text-white tracking-tight">{currentProject?.name}</h2>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                  mode.includes('lite') ? "bg-slate-700 text-slate-300" : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                )}>
                  {mode === 'gemini-3.5-flash' ? 'Flash 3.5' : 'Flash Lite 3.1'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  runLint();
                  setActiveTab('preview');
                }}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-lg active:scale-95"
              >
                <Play size={14} fill="currentColor" />
                Run
              </button>
              <div className="w-px h-6 bg-slate-800 mx-1" />
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                title="Download ZIP"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                title="Export to GitHub"
              >
                <Github size={20} />
              </button>
            </div>
          </header>
        )}

        {/* Dynamic Content View */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {state.view === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <Home 
                  projects={state.projects} 
                  onOpen={openProject} 
                  onCreate={createProject} 
                  isGenerating={state.isGenerating} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="editor-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full flex"
              >
                {/* Sidebar */}
                <aside className="w-64 bg-[#161b22] border-r border-slate-800 overflow-y-auto">
                  <FileTree
                    files={currentProject?.files || []}
                    activeFilePath={state.activeFilePath}
                    onSelect={setActiveFile}
                  />
                </aside>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-4 px-6 py-2 bg-[#0f172a] border-b border-slate-800 shrink-0">
                    <div className="flex gap-2 p-1 bg-slate-900 rounded-full border border-slate-800">
                      <button
                        onClick={() => setActiveTab('editor')}
                        className={cn(
                          "px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                          activeTab === 'editor' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        Editor
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={cn(
                          "px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                          activeTab === 'preview' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        Preview
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setShowImprovements(!showImprovements)}
                      className={cn(
                        "flex items-center gap-2 ml-auto px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                        showImprovements ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      <MessageSquare size={14} />
                      AI Notes
                    </button>
                  </div>

                  <div className="flex-1 relative overflow-hidden bg-[#0d1117]">
                    {activeTab === 'editor' ? (
                      <Editor
                        file={activeFile}
                        onChange={(content) => activeFile && updateFileContent(activeFile.path, content)}
                      />
                    ) : (
                      <div className="h-full p-8">
                        <Preview files={currentProject?.files || []} />
                      </div>
                    )}

                    {/* AI Notes Overlay */}
                    <AnimatePresence>
                      {showImprovements && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.9 }}
                          className="absolute bottom-6 right-6 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-y-auto z-10"
                        >
                          <div className="flex items-center gap-2 mb-3 text-indigo-400">
                            <Sparkles size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Architectural Improvements</span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed italic">
                            "{currentProject?.improvements}"
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Terminal */}
                  <div className="h-64 shrink-0">
                    <Terminal 
                      errors={state.errors} 
                      onFix={fixErrors} 
                      isFixing={state.isGenerating} 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Floating Prompt Bar (Bottom Left) */}
        <div className="absolute bottom-6 left-24 z-50">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-600/20 blur-xl group-hover:bg-indigo-600/30 transition-all rounded-full" />
            <div className="relative flex items-center bg-[#1e293b] border border-slate-700 rounded-full shadow-2xl p-1 w-[400px]">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Ask Gemini to make changes..."
                className="flex-1 bg-transparent border-none py-2 px-6 text-sm text-white focus:outline-none placeholder:text-slate-500"
              />
              <div className="flex items-center gap-1 bg-[#0f172a] rounded-full p-0.5 mr-1 border border-slate-700">
                <button
                  onClick={() => setMode('gemini-3.5-flash')}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all",
                    mode === 'gemini-3.5-flash' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  3.5
                </button>
                <button
                  onClick={() => setMode('gemini-3.1-flash-lite')}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all",
                    mode === 'gemini-3.1-flash-lite' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Lite
                </button>
              </div>
              <button
                onClick={handleGenerate}
                disabled={state.isGenerating || !prompt.trim()}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:scale-95"
              >
                {state.isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        files={currentProject?.files || []}
      />
    </div>
  );
}
