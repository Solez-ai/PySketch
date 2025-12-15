'use client';

import React, { useMemo, useState } from 'react';
import { useDrawing } from '@/store/drawingStore';
import { compileToTurtle, downloadPythonFile, copyToClipboard } from '@/compiler/compileToTurtle';

interface CodePanelProps {
    canvasWidth?: number;
    canvasHeight?: number;
    projectName?: string;
}

// Icons
const CopyIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
);

const DownloadIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function CodePanel({
    canvasWidth = 800,
    canvasHeight = 600,
    projectName = 'drawing',
}: CodePanelProps) {
    const { state, setSpeed } = useDrawing();
    const [copied, setCopied] = useState(false);

    // Generate Python code
    const code = useMemo(() => {
        return compileToTurtle(state.strokes, state.layers, {
            canvasWidth,
            canvasHeight,
            speed: state.globalSpeed,
            backgroundColor: state.backgroundColor,
            simplifyTolerance: 2,
        });
    }, [state.strokes, state.layers, state.globalSpeed, canvasWidth, canvasHeight]);

    // Speed presets
    const speedLabels: Record<number, string> = {
        0: 'Instant',
        1: 'Slowest',
        3: 'Slow',
        6: 'Normal',
        10: 'Fast',
    };

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSpeed(parseInt(e.target.value, 10));
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(code);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.py`;
        downloadPythonFile(code, filename);
    };

    // Count lines
    const lineCount = code.split('\n').length;

    return (
        <div className="code-panel flex flex-col h-full">
            {/* Speed Control */}
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    Animation Speed
                </h3>

                <div className="space-y-2">
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={state.globalSpeed}
                        onChange={handleSpeedChange}
                        className="width-slider"
                    />

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Slow</span>
                        <span className="text-sm font-medium text-zinc-300">
                            {speedLabels[state.globalSpeed] || `Speed ${state.globalSpeed}`}
                        </span>
                        <span>Fast</span>
                    </div>
                </div>
            </div>

            {/* Code Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Python Turtle Code
                    </h3>
                    <p className="text-xs text-zinc-600 mt-0.5">
                        {lineCount} lines
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copied
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                            }`}
                    >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/40 transition-all"
                    >
                        <DownloadIcon />
                        Download
                    </button>
                </div>
            </div>

            {/* Code Preview */}
            <div className="flex-1 overflow-auto">
                <pre className="code-preview">
                    <code>
                        {code.split('\n').map((line, i) => (
                            <div key={i} className="code-line">
                                <span className="line-number">{i + 1}</span>
                                <span className="line-content">
                                    <HighlightedLine line={line} />
                                </span>
                            </div>
                        ))}
                    </code>
                </pre>
            </div>

            {/* Footer Info */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
                <p className="text-xs text-zinc-500 text-center">
                    Run this code in Python with Turtle graphics support
                </p>
            </div>
        </div>
    );
}

// Token types for syntax highlighting
type TokenType = 'keyword' | 'builtin' | 'string' | 'number' | 'comment' | 'method' | 'text';

interface Token {
    type: TokenType;
    value: string;
}

// Proper React-based syntax highlighting (no dangerouslySetInnerHTML)
function HighlightedLine({ line }: { line: string }) {
    const tokens = tokenizePython(line);

    return (
        <>
            {tokens.map((token, i) => {
                const className = getTokenClassName(token.type);
                return className ? (
                    <span key={i} className={className}>{token.value}</span>
                ) : (
                    <span key={i}>{token.value}</span>
                );
            })}
        </>
    );
}

function getTokenClassName(type: TokenType): string {
    switch (type) {
        case 'keyword': return 'text-purple-400';
        case 'builtin': return 'text-blue-400';
        case 'string': return 'text-emerald-400';
        case 'number': return 'text-amber-400';
        case 'comment': return 'text-zinc-500';
        case 'method': return 'text-yellow-400';
        default: return '';
    }
}

function tokenizePython(line: string): Token[] {
    // Handle comments first
    if (line.trim().startsWith('#')) {
        return [{ type: 'comment', value: line }];
    }

    const keywords = new Set(['import', 'from', 'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None']);
    const builtins = new Set(['turtle', 'screen', 't', 'print', 'time']);

    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
        // Check for strings
        if (line[i] === '"' || line[i] === "'") {
            const quote = line[i];
            let j = i + 1;
            while (j < line.length && line[j] !== quote) {
                if (line[j] === '\\') j++; // Skip escaped chars
                j++;
            }
            tokens.push({ type: 'string', value: line.slice(i, j + 1) });
            i = j + 1;
            continue;
        }

        // Check for numbers
        if (/\d/.test(line[i]) || (line[i] === '-' && /\d/.test(line[i + 1] || ''))) {
            let j = i;
            if (line[j] === '-') j++;
            while (j < line.length && /[\d.]/.test(line[j])) j++;
            tokens.push({ type: 'number', value: line.slice(i, j) });
            i = j;
            continue;
        }

        // Check for identifiers (words)
        if (/[a-zA-Z_]/.test(line[i])) {
            let j = i;
            while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
            const word = line.slice(i, j);

            // Check if it's a method call (preceded by dot)
            const prevToken = tokens[tokens.length - 1];
            const isMethod = prevToken?.value === '.' && j < line.length && line[j] === '(';

            if (isMethod) {
                tokens.push({ type: 'method', value: word });
            } else if (keywords.has(word)) {
                tokens.push({ type: 'keyword', value: word });
            } else if (builtins.has(word)) {
                tokens.push({ type: 'builtin', value: word });
            } else {
                tokens.push({ type: 'text', value: word });
            }
            i = j;
            continue;
        }

        // Everything else (operators, punctuation, whitespace)
        tokens.push({ type: 'text', value: line[i] });
        i++;
    }

    return tokens;
}
