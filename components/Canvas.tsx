'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrawing } from '@/store/drawingStore';
import { Point, Stroke } from '@/types';

interface CanvasProps {
    className?: string;
}

export default function Canvas({ className = '' }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { state, addStroke, removeStroke } = useDrawing();

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Handle canvas resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCanvasSize({ width: rect.width, height: rect.height });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Render strokes
    const renderStrokes = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Clear canvas with background color
        ctx.fillStyle = state.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        const gridSize = 50;

        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw center crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY);
        ctx.lineTo(centerX + 20, centerY);
        ctx.moveTo(centerX, centerY - 20);
        ctx.lineTo(centerX, centerY + 20);
        ctx.stroke();

        // Draw strokes by layer order (bottom to top)
        const visibleLayers = state.layers.filter((l) => l.visible);

        for (const layer of visibleLayers) {
            const layerStrokes = state.strokes.filter((s) => s.layerId === layer.id);

            for (const stroke of layerStrokes) {
                if (stroke.points.length < 2) continue;

                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = stroke.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                ctx.beginPath();
                ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

                for (let i = 1; i < stroke.points.length; i++) {
                    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                }

                ctx.stroke();
            }
        }

        // Draw current stroke being drawn
        if (currentPoints.length >= 2) {
            ctx.strokeStyle = state.toolSettings.color;
            ctx.lineWidth = state.toolSettings.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

            for (let i = 1; i < currentPoints.length; i++) {
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
            }

            ctx.stroke();
        }
    }, [state.strokes, state.layers, state.toolSettings, state.backgroundColor, currentPoints]);

    // Render on state change
    useEffect(() => {
        renderStrokes();
    }, [renderStrokes, canvasSize]);

    // Get pointer position relative to canvas
    const getPointerPosition = (e: React.PointerEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    // Check if point is near a stroke (for eraser)
    const findStrokeAtPoint = (point: Point, threshold: number = 10): Stroke | null => {
        const visibleLayers = state.layers.filter((l) => l.visible);

        // Check in reverse order (top layer first)
        for (let i = visibleLayers.length - 1; i >= 0; i--) {
            const layer = visibleLayers[i];
            const layerStrokes = state.strokes.filter((s) => s.layerId === layer.id);

            for (let j = layerStrokes.length - 1; j >= 0; j--) {
                const stroke = layerStrokes[j];

                for (const strokePoint of stroke.points) {
                    const dist = Math.sqrt(
                        Math.pow(point.x - strokePoint.x, 2) +
                        Math.pow(point.y - strokePoint.y, 2)
                    );

                    if (dist <= threshold + stroke.width / 2) {
                        return stroke;
                    }
                }
            }
        }

        return null;
    };

    // Pointer event handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        const point = getPointerPosition(e);

        if (state.toolSettings.activeTool === 'eraser') {
            // Eraser mode - find and remove stroke
            const stroke = findStrokeAtPoint(point);
            if (stroke) {
                removeStroke(stroke.id);
            }
        } else {
            // Pen mode - start drawing
            setIsDrawing(true);
            setCurrentPoints([point]);
        }

        // Capture pointer for better tracking
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const point = getPointerPosition(e);

        if (state.toolSettings.activeTool === 'eraser' && e.buttons > 0) {
            // Continuous erasing while dragging
            const stroke = findStrokeAtPoint(point);
            if (stroke) {
                removeStroke(stroke.id);
            }
        } else if (isDrawing) {
            // Add point with sampling to avoid too many points
            const lastPoint = currentPoints[currentPoints.length - 1];
            const dist = Math.sqrt(
                Math.pow(point.x - lastPoint.x, 2) +
                Math.pow(point.y - lastPoint.y, 2)
            );

            // Only add point if moved more than 2 pixels
            if (dist >= 2) {
                setCurrentPoints((prev) => [...prev, point]);
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDrawing && currentPoints.length >= 2) {
            // Finalize stroke
            addStroke(
                currentPoints,
                state.toolSettings.color,
                state.toolSettings.width
            );
        }

        setIsDrawing(false);
        setCurrentPoints([]);

        // Release pointer capture
        (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden ${className}`}
        >
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="absolute inset-0 cursor-crosshair touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            />

            {/* Eraser cursor indicator */}
            {state.toolSettings.activeTool === 'eraser' && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-full text-red-400 text-xs font-medium">
                    Eraser Mode
                </div>
            )}
        </div>
    );
}
