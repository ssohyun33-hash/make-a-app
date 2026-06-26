import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { FileNode } from '../types';

interface EditorProps {
  file: FileNode | null;
  onChange: (content: string) => void;
}

export function Editor({ file, onChange }: EditorProps) {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 font-sans">
        Select a file to start editing
      </div>
    );
  }

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <MonacoEditor
      height="100%"
      language={file.language}
      theme="vs-dark"
      value={file.content}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 10 },
        tabSize: 2,
      }}
    />
  );
}
