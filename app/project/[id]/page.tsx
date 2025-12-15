'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProject, saveProject, deleteProject } from '@/lib/storage';
import { DrawingProvider, useDrawing } from '@/store/drawingStore';
import Canvas from '@/components/Canvas';
import ToolPanel from '@/components/ToolPanel';
import LayerPanel from '@/components/LayerPanel';
import CodePanel from '@/components/CodePanel';
import { Project } from '@/types';

// Icons
const HomeIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
);


// Logo component
const Logo = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
    <Image
        src="/logo.png"
        alt="PySketch Logo"
        width={size}
        height={size}
        className={`rounded-lg ${className}`}
        priority
    />
);

// Editor content component (needs to be inside DrawingProvider)
function EditorContent({ project }: { project: Project }) {
    const router = useRouter();
    const { state, dispatch } = useDrawing();
    const [projectName, setProjectName] = useState(project.name);
    const [isEditing, setIsEditing] = useState(false);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const isInitialized = useRef(false);

    // Load project state on mount - only once
    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        dispatch({
            type: 'LOAD_STATE',
            payload: {
                layers: project.layers,
                strokes: project.strokes,
                activeLayerId: project.layers[0]?.id || '',
                globalSpeed: project.settings.speed,
                backgroundColor: project.settings.backgroundColor,
            },
        });
    }, [project, dispatch]);

    // Get canvas size
    useEffect(() => {
        const updateSize = () => {
            if (canvasContainerRef.current) {
                const rect = canvasContainerRef.current.getBoundingClientRect();
                setCanvasSize({ width: rect.width, height: rect.height });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Auto-save with debounce
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstRender = useRef(true);

    // Trigger auto-save on state changes (skip first render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            const updatedProject: Project = {
                ...project,
                name: projectName,
                layers: state.layers,
                strokes: state.strokes,
                settings: {
                    speed: state.globalSpeed,
                    backgroundColor: state.backgroundColor,
                },
                lastModified: Date.now(),
            };
            saveProject(updatedProject);
        }, 500);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [project, projectName, state.layers, state.strokes, state.globalSpeed, state.backgroundColor]);

    // Handle delete
    const handleDelete = () => {
        deleteProject(project.id);
        router.push('/');
    };

    // Handle rename
    const handleFinishRename = () => {
        setIsEditing(false);
    };

    return (
        <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-xl z-50">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Back to Dashboard"
                    >
                        <HomeIcon />
                    </Link>

                    <div className="flex items-center gap-2">
                        <Logo size={36} className="shadow-md shadow-emerald-500/20" />

                        {isEditing ? (
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                onBlur={handleFinishRename}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFinishRename();
                                    if (e.key === 'Escape') {
                                        setProjectName(project.name);
                                        setIsEditing(false);
                                    }
                                }}
                                className="bg-zinc-800 text-white px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                            />
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-white font-medium hover:text-emerald-400 transition-colors"
                            >
                                {projectName}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                        Auto-saved
                    </span>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <TrashIcon />
                        Delete
                    </button>
                </div>
            </header>

            {/* Main Content - Three Panel Layout */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel - Tools & Layers */}
                <aside className="w-64 flex flex-col bg-zinc-900/50 border-r border-zinc-800 overflow-y-auto">
                    <div className="p-4">
                        <ToolPanel />
                    </div>
                    <div className="border-t border-zinc-800" />
                    <div className="p-4 flex-1">
                        <LayerPanel />
                    </div>
                </aside>

                {/* Center Panel - Canvas */}
                <div
                    ref={canvasContainerRef}
                    className="flex-1 relative bg-zinc-950"
                >
                    <Canvas />
                </div>

                {/* Right Panel - Code */}
                <aside className="w-96 bg-zinc-900/50 border-l border-zinc-800 overflow-hidden">
                    <CodePanel
                        canvasWidth={canvasSize.width}
                        canvasHeight={canvasSize.height}
                        projectName={projectName}
                    />
                </aside>
            </main>
        </div>
    );
}

// Main page component
export default function ProjectEditorPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const loadedProject = getProject(id);

        if (loadedProject) {
            setProject(loadedProject);
        } else {
            // Project not found, redirect to dashboard
            router.replace('/');
        }

        setLoading(false);
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-400">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <DrawingProvider>
            <EditorContent project={project} />
        </DrawingProvider>
    );
}
