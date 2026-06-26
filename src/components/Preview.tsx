import React, { useMemo } from 'react';
import { FileNode } from '../types';
import { Maximize2, RotateCcw } from 'lucide-react';

interface PreviewProps {
  files: FileNode[];
}

export function Preview({ files }: PreviewProps) {
  const indexFile = files.find(f => f.path === 'index.html');
  const cssFiles = files.filter(f => f.path.endsWith('.css'));
  const jsFiles = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.ts'));

  const blobUrl = useMemo(() => {
    if (!indexFile) return null;

    let html = indexFile.content;
    
    // Inject styles
    const styles = cssFiles.map(f => `<style>${f.content}</style>`).join('\n');
    html = html.replace('</head>', `${styles}</head>`);

    // Inject scripts (basic support)
    const scripts = jsFiles.map(f => `<script>${f.content}</script>`).join('\n');
    html = html.replace('</body>', `${scripts}</body>`);

    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [files, indexFile, cssFiles, jsFiles]);

  const toggleFullscreen = () => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-slate-400 font-mono">localhost:3000</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="p-1 hover:bg-slate-800 rounded text-slate-400"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-1 hover:bg-slate-800 rounded text-slate-400"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white">
        {blobUrl ? (
          <iframe
            id="preview-iframe"
            src={blobUrl}
            className="w-full h-full border-none"
            title="Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Create an index.html file to see a preview
          </div>
        )}
      </div>
    </div>
  );
}
