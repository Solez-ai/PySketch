'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProjects, deleteProject, renameProject, createNewProject, formatDate } from '@/lib/storage';
import { Project } from '@/types';

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Logo component
const Logo = ({ size = 40, className = "" }: { size?: number; className?: string }) => (
  <Image
    src="/logo.png"
    alt="PySketch Logo"
    width={size}
    height={size}
    className={`rounded-xl ${className}`}
    priority
  />
);

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Load projects on mount
  useEffect(() => {
    setProjects(getProjects());
  }, []);

  // Create new project
  const handleNewProject = () => {
    const project = createNewProject();
    router.push(`/project/${project.id}`);
  };

  // Delete project
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteProject(id);
    setProjects(getProjects());
  };

  // Start rename
  const handleStartRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(project.id);
    setEditName(project.name);
  };

  // Finish rename
  const handleFinishRename = () => {
    if (editingId && editName.trim()) {
      renameProject(editingId, editName.trim());
      setProjects(getProjects());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditName('');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={48} className="shadow-lg shadow-emerald-500/20" />
            <div>
              <h1 className="text-xl font-bold text-white">PySketch</h1>
              <p className="text-xs text-zinc-500">Drawing to Python Turtle Code</p>
            </div>
          </div>

          <button
            onClick={handleNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/25"
          >
            <PlusIcon />
            New Project
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {projects.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-6">
              <Logo size={80} className="shadow-xl shadow-emerald-500/30" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Projects Yet</h2>
            <p className="text-zinc-500 mb-6 text-center max-w-md">
              Create your first project to start drawing and generating Python Turtle code.
            </p>
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all"
            >
              <PlusIcon />
              Create First Project
            </button>
          </div>
        ) : (
          // Project Grid
          <>
            <h2 className="text-lg font-semibold text-zinc-300 mb-6">
              Your Projects ({projects.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* New Project Card */}
              <button
                onClick={handleNewProject}
                className="project-card group flex flex-col items-center justify-center gap-3 border-dashed hover:border-emerald-500/50 hover:bg-emerald-500/5"
              >
                <div className="p-3 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/20 transition-colors">
                  <PlusIcon />
                </div>
                <span className="text-sm text-zinc-400 group-hover:text-emerald-400">
                  New Project
                </span>
              </button>

              {/* Project Cards */}
              {projects.sort((a, b) => b.lastModified - a.lastModified).map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="project-card group"
                >
                  {/* Preview Area */}
                  <div className="flex items-center justify-center h-24 mb-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <FolderIcon />
                  </div>

                  {/* Project Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingId === project.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={handleFinishRename}
                          onKeyDown={handleKeyDown}
                          onClick={(e) => e.preventDefault()}
                          className="w-full bg-zinc-700 text-white text-sm px-2 py-1 rounded outline-none focus:ring-1 focus:ring-emerald-500"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-sm font-medium text-white truncate">
                          {project.name}
                        </h3>
                      )}
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatDate(project.lastModified)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartRename(project, e)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                        title="Rename"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 mt-2 text-xs text-zinc-600">
                    <span>{project.layers.length} layers</span>
                    <span>{project.strokes.length} strokes</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer - Always at bottom */}
      <footer className="border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Top Section - App Info and Workflow */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <Logo size={44} className="shadow-lg shadow-emerald-500/10" />
              <div>
                <p className="text-base font-semibold text-zinc-200">PySketch</p>
                <p className="text-xs text-zinc-500">Visual Python Turtle Code Generator</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap justify-center">
              <span className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/30 transition-colors">Draw on canvas</span>
              <span className="text-emerald-500 font-bold">→</span>
              <span className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/30 transition-colors">Generate Python code</span>
              <span className="text-emerald-500 font-bold">→</span>
              <span className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/30 transition-colors">Run with Turtle</span>
            </div>
          </div>

          {/* Bottom Section - Developer Credits */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
              <span className="text-zinc-500">Made with</span>
              <span className="text-red-400">❤️</span>
              <span className="text-zinc-500">by</span>
              <a
                href="https://solez.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all"
              >
                Samin Yeasar
              </a>
              <span className="text-zinc-600">[Solez-ai]</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {/* Portfolio */}
              <a
                href="https://solez.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                title="Portfolio"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Solez-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-700/50 transition-all"
                title="GitHub"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/Solez_None"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-700/50 transition-all"
                title="X (Twitter)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:sheditzofficial918@gmail.com"
                className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                title="Email"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/8801975757115"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/10 transition-all"
                title="WhatsApp"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
