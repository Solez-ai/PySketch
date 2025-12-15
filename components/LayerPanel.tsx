'use client';

import React, { useState } from 'react';
import { useDrawing } from '@/store/drawingStore';
import { Layer } from '@/types';

// Icons
const EyeIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const GripIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
    </svg>
);

export default function LayerPanel() {
    const {
        state,
        addLayer,
        removeLayer,
        renameLayer,
        toggleLayerVisibility,
        setActiveLayer,
        reorderLayers,
    } = useDrawing();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleAddLayer = () => {
        addLayer();
    };

    const handleDeleteLayer = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (state.layers.length > 1) {
            removeLayer(id);
        }
    };

    const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleLayerVisibility(id);
    };

    const handleStartRename = (layer: Layer, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(layer.id);
        setEditName(layer.name);
    };

    const handleFinishRename = () => {
        if (editingId && editName.trim()) {
            renameLayer(editingId, editName.trim());
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

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newLayers = [...state.layers];
        const draggedLayer = newLayers[draggedIndex];
        newLayers.splice(draggedIndex, 1);
        newLayers.splice(index, 0, draggedLayer);

        reorderLayers(newLayers);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Get stroke count for a layer
    const getStrokeCount = (layerId: string) => {
        return state.strokes.filter((s) => s.layerId === layerId).length;
    };

    return (
        <div className="layer-panel flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Layers
                </h3>
                <button
                    onClick={handleAddLayer}
                    className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    title="Add Layer"
                >
                    <PlusIcon />
                </button>
            </div>

            {/* Layer List */}
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {state.layers.map((layer, index) => (
                    <div
                        key={layer.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setActiveLayer(layer.id)}
                        className={`layer-item group ${state.activeLayerId === layer.id ? 'active' : ''
                            } ${!layer.visible ? 'opacity-50' : ''}`}
                    >
                        {/* Drag Handle */}
                        <div className="cursor-grab text-zinc-600 group-hover:text-zinc-400">
                            <GripIcon />
                        </div>

                        {/* Layer Name */}
                        {editingId === layer.id ? (
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={handleFinishRename}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-zinc-700 text-white text-sm px-2 py-0.5 rounded outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                            />
                        ) : (
                            <span
                                className="flex-1 text-sm truncate cursor-text"
                                onDoubleClick={(e) => handleStartRename(layer, e)}
                            >
                                {layer.name}
                            </span>
                        )}

                        {/* Stroke Count */}
                        <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {getStrokeCount(layer.id)}
                        </span>

                        {/* Visibility Toggle */}
                        <button
                            onClick={(e) => handleToggleVisibility(layer.id, e)}
                            className={`p-1 rounded transition-colors ${layer.visible
                                    ? 'text-zinc-400 hover:text-white'
                                    : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                            title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                        >
                            {layer.visible ? <EyeIcon /> : <EyeOffIcon />}
                        </button>

                        {/* Delete Button */}
                        {state.layers.length > 1 && (
                            <button
                                onClick={(e) => handleDeleteLayer(layer.id, e)}
                                className="p-1 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete Layer"
                            >
                                <TrashIcon />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Layer Info */}
            <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                {state.layers.length} layer{state.layers.length !== 1 ? 's' : ''} • {state.strokes.length} stroke{state.strokes.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
}
