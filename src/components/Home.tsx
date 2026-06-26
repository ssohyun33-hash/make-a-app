import React from 'react';
import { Project } from '../types';
import { Plus, Clock, ExternalLink, Zap, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  projects: Project[];
  onOpen: (id: string) => void;
  onCreate: (prompt: string) => void;
  isGenerating: boolean;
}

export function Home({ projects, onOpen, onCreate, isGenerating }: HomeProps) {
  const [prompt, setPrompt] = React.useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onCreate(prompt);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f172a] p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            AI-Powered IDE
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Gemini Code Studio
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
            Generate full-stack web applications with simple prompts. Multi-file support, real-time error fixing, and seamless GitHub deployment.
          </p>
        </header>

        {/* Create New App */}
        <section className="bg-[#1e293b] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
             <Zap size={120} className="text-indigo-500" />
          </div>
          <div className="relative space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Build a new app</h2>
              <p className="text-slate-400">Describe what you want to create, and Gemini will build the entire structure for you.</p>
            </div>
            <form onSubmit={handleCreate} className="flex gap-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A task manager with drag-and-drop support..."
                className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
              />
              <button
                disabled={isGenerating || !prompt.trim()}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap text-lg"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={24} />
                )}
                Create App
              </button>
            </form>
          </div>
        </section>

        {/* Project List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
            <span className="text-slate-500 text-sm">{projects.length} Projects</span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500">No projects yet. Start by creating your first app above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <motion.button
                  key={project.id}
                  whileHover={{ y: -4 }}
                  onClick={() => onOpen(project.id)}
                  className="bg-[#1e293b] border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all text-left flex flex-col gap-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-[#0f172a] rounded-lg text-indigo-400 border border-slate-800 group-hover:border-indigo-500/50 transition-all">
                      <ExternalLink size={20} />
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Clock size={12} />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-mono">
                      {project.files.length} FILES
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
