import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, X, Check, Loader2 } from 'lucide-react';
import { FileNode } from '../types';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
}

export function GitHubModal({ isOpen, onClose, files }: GitHubModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setToken(event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      const { url } = await res.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async () => {
    if (!token || !name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/github/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, description, isPrivate, files })
      });
      const data = await res.json();
      if (data.url) {
        setRepoUrl(data.url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Github className="text-white" />
            <h2 className="text-xl font-semibold text-white">Export to GitHub</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!token ? (
            <div className="text-center space-y-4">
              <p className="text-slate-400">Connect your GitHub account to export this project.</p>
              <button
                onClick={handleConnect}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Github size={20} />
                Connect GitHub
              </button>
            </div>
          ) : repoUrl ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h3 className="text-lg font-medium text-white">Repository Created!</h3>
              <p className="text-slate-400 text-sm">Your project has been successfully uploaded to GitHub.</p>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View on GitHub
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Repository Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-gemini-app"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Built with Gemini Code Studio"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private-repo"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="private-repo" className="text-sm text-slate-400 select-none cursor-pointer">
                  Private Repository
                </label>
              </div>
              <button
                onClick={handleCreate}
                disabled={!name || isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating...
                  </>
                ) : (
                  'Create Repository'
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
