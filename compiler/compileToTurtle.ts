import { Point, Stroke, Layer } from '@/types';
import { simplifyPath, calculateHeading, distance } from './simplifyPath';

interface CompilerOptions {
    canvasWidth: number;
    canvasHeight: number;
    speed: number;
    backgroundColor?: string;
    simplifyTolerance?: number;
}

/**
 * Convert canvas coordinates to Turtle coordinates
 * Canvas: origin at top-left, Y increases downward
 * Turtle: origin at center, Y increases upward
 */
function toTurtleCoords(point: Point, canvasWidth: number, canvasHeight: number): Point {
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;

    return {
        x: point.x - cx,
        y: cy - point.y, // Flip Y axis
    };
}

/**
 * Format a number for Python output (limited decimal places)
 */
function formatNumber(n: number): string {
    return Number(n.toFixed(2)).toString();
}

/**
 * Generate Python Turtle code from strokes and layers
 */
export function compileToTurtle(
    strokes: Stroke[],
    layers: Layer[],
    options: CompilerOptions
): string {
    const { canvasWidth, canvasHeight, speed, backgroundColor = '#000000', simplifyTolerance = 2 } = options;

    const lines: string[] = [];

    // Imports
    lines.push('import turtle');
    lines.push('');

    // Setup
    lines.push('# Setup');
    lines.push('screen = turtle.Screen()');
    lines.push(`screen.bgcolor("${backgroundColor}")`);
    lines.push(`screen.setup(${canvasWidth}, ${canvasHeight})`);
    lines.push('');
    lines.push('t = turtle.Turtle()');
    lines.push(`t.speed(${speed})`);
    lines.push('t.hideturtle()');
    lines.push('');

    // Track current state to avoid redundant commands
    let currentColor = '';
    let currentWidth = 0;

    // Process layers in order (bottom to top)
    const visibleLayers = layers.filter((l) => l.visible);

    for (const layer of visibleLayers) {
        // Get strokes for this layer
        const layerStrokes = strokes.filter((s) => s.layerId === layer.id);

        if (layerStrokes.length === 0) continue;

        lines.push(`# ${layer.name}`);

        for (const stroke of layerStrokes) {
            // Simplify the path
            const simplifiedPoints = simplifyPath(stroke.points, simplifyTolerance);

            if (simplifiedPoints.length < 2) continue;

            // Convert all points to Turtle coordinates
            const turtlePoints = simplifiedPoints.map((p) =>
                toTurtleCoords(p, canvasWidth, canvasHeight)
            );

            // Move to starting position
            const startPoint = turtlePoints[0];
            lines.push('t.penup()');
            lines.push(`t.goto(${formatNumber(startPoint.x)}, ${formatNumber(startPoint.y)})`);

            // Set color if changed
            if (stroke.color !== currentColor) {
                lines.push(`t.pencolor("${stroke.color}")`);
                currentColor = stroke.color;
            }

            // Set width if changed
            if (stroke.width !== currentWidth) {
                lines.push(`t.pensize(${stroke.width})`);
                currentWidth = stroke.width;
            }

            lines.push('t.pendown()');

            // Draw each segment
            for (let i = 1; i < turtlePoints.length; i++) {
                const prevPoint = turtlePoints[i - 1];
                const currPoint = turtlePoints[i];

                const heading = calculateHeading(prevPoint, currPoint);
                const dist = distance(prevPoint, currPoint);

                if (dist > 0.5) {
                    // Only draw if distance is significant
                    lines.push(`t.setheading(${formatNumber(heading)})`);
                    lines.push(`t.forward(${formatNumber(dist)})`);
                }
            }

            lines.push('');
        }
    }

    // Finish
    lines.push('# Keep window open');
    lines.push('turtle.done()');

    return lines.join('\n');
}

/**
 * Generate a downloadable .py file
 */
export function downloadPythonFile(code: string, filename: string = 'drawing.py'): void {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Copy code to clipboard
 */
export async function copyToClipboard(code: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(code);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}
