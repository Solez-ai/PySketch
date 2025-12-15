'use client';

import React from 'react';
import { useDrawing } from '@/store/drawingStore';
import { Tool } from '@/types';

// Icons as SVG components
const PenIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
    </svg>
);

const EraserIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8l10-10c.8-.8 2-.8 2.8 0l6 6c.8.8.8 2 0 2.8L13 21" />
        <path d="M6 11l6 6" />
    </svg>
);

const ClearIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
);

export default function ToolPanel() {
    const { state, setTool, setColor, setWidth, setBackgroundColor, clearAllStrokes } = useDrawing();
    const { activeTool, color, width } = state.toolSettings;
    const backgroundColor = state.backgroundColor;

    const handleToolChange = (tool: Tool) => {
        setTool(tool);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    };

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWidth(parseInt(e.target.value, 10));
    };

    const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBackgroundColor(e.target.value);
    };

    const handleClear = () => {
        clearAllStrokes();
    };

    // Preset stroke colors
    const presetColors = [
        '#ffffff', '#ff4444', '#ff8844', '#ffcc00',
        '#44ff44', '#00ccff', '#4444ff', '#cc44ff',
        '#ff44cc', '#888888', '#444444', '#000000',
    ];

    // Preset background colors (Turtle-friendly colors)
    const bgPresetColors = [
        '#000000', '#0a0a0a', '#1a1a2e', '#16213e',
        '#ffffff', '#f0f0f0', '#282c34', '#1e1e1e',
        '#2d3436', '#0c1618', '#141e30', '#243b55',
    ];

    return (
        <div className="tool-panel flex flex-col gap-6">
            {/* Tools Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Tools
                </h3>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleToolChange('pen')}
                        className={`tool-button ${activeTool === 'pen' ? 'active' : ''}`}
                        title="Pen Tool"
                    >
                        <PenIcon />
                    </button>

                    <button
                        onClick={() => handleToolChange('eraser')}
                        className={`tool-button ${activeTool === 'eraser' ? 'active' : ''}`}
                        title="Eraser Tool"
                    >
                        <EraserIcon />
                    </button>

                    <button
                        onClick={handleClear}
                        className="tool-button text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                        title="Clear All"
                    >
                        <ClearIcon />
                    </button>
                </div>
            </div>

            {/* Stroke Color Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Stroke Color
                </h3>

                {/* Current color picker */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg border-2 border-zinc-600 shadow-lg"
                        style={{ backgroundColor: color }}
                    />
                    <input
                        type="color"
                        value={color}
                        onChange={handleColorChange}
                        className="color-picker"
                    />
                </div>

                {/* Preset colors */}
                <div className="grid grid-cols-6 gap-1.5">
                    {presetColors.map((presetColor) => (
                        <button
                            key={presetColor}
                            onClick={() => setColor(presetColor)}
                            className={`w-7 h-7 rounded-md border-2 transition-all ${color === presetColor
                                ? 'border-white scale-110'
                                : 'border-zinc-700 hover:border-zinc-500'
                                }`}
                            style={{ backgroundColor: presetColor }}
                            title={presetColor}
                        />
                    ))}
                </div>
            </div>

            {/* Background Color Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Background Color
                </h3>

                {/* Current background color picker */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg border-2 border-zinc-600 shadow-lg"
                        style={{ backgroundColor: backgroundColor }}
                    />
                    <input
                        type="color"
                        value={backgroundColor || '#000000'}
                        onChange={handleBackgroundColorChange}
                        className="color-picker"
                    />
                </div>

                {/* Preset background colors */}
                <div className="grid grid-cols-6 gap-1.5">
                    {bgPresetColors.map((presetColor) => (
                        <button
                            key={`bg-${presetColor}`}
                            onClick={() => setBackgroundColor(presetColor)}
                            className={`w-7 h-7 rounded-md border-2 transition-all ${backgroundColor === presetColor
                                ? 'border-emerald-400 scale-110'
                                : 'border-zinc-700 hover:border-zinc-500'
                                }`}
                            style={{ backgroundColor: presetColor }}
                            title={presetColor}
                        />
                    ))}
                </div>
            </div>

            {/* Stroke Width Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Stroke Width
                </h3>

                <div className="space-y-2">
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={width}
                        onChange={handleWidthChange}
                        className="width-slider"
                    />

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">1px</span>
                        <span className="text-sm font-medium text-zinc-300">{width}px</span>
                        <span className="text-xs text-zinc-500">20px</span>
                    </div>

                    {/* Width preview */}
                    <div className="flex items-center justify-center p-3 bg-zinc-800/50 rounded-lg">
                        <div
                            className="rounded-full"
                            style={{
                                width: width * 2,
                                height: width * 2,
                                backgroundColor: color,
                                minWidth: 4,
                                minHeight: 4,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
