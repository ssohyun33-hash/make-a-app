import React from 'react';
import { FileNode } from '../types';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileTreeProps {
  files: FileNode[];
  activeFilePath: string | null;
  onSelect: (path: string) => void;
}

export function FileTree({ files, activeFilePath, onSelect }: FileTreeProps) {
  return (
    <div className="flex flex-col gap-1 p-2 font-sans text-sm">
      <div className="flex items-center gap-2 mb-2 text-slate-400 font-medium px-2">
        <Folder size={16} />
        <span>PROJECT</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {files.map((file) => (
          <button
            key={file.path}
            onClick={() => onSelect(file.path)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-left",
              activeFilePath === file.path
                ? "bg-indigo-500/20 text-indigo-400"
                : "hover:bg-slate-800 text-slate-300"
            )}
          >
            <File size={14} className={activeFilePath === file.path ? "text-indigo-400" : "text-slate-500"} />
            <span className="truncate">{file.path}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
