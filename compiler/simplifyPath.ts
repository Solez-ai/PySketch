import { Point } from '@/types';

/**
 * Ramer-Douglas-Peucker algorithm for path simplification
 * Reduces the number of points in a stroke while preserving shape
 */

// Calculate perpendicular distance from point to line
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    // Line length squared
    const lineLengthSquared = dx * dx + dy * dy;

    if (lineLengthSquared === 0) {
        // Start and end are the same point
        return Math.sqrt(
            Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2)
        );
    }

    // Calculate projection of point onto the line
    const t = Math.max(0, Math.min(1, (
        (point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy
    ) / lineLengthSquared));

    const projectionX = lineStart.x + t * dx;
    const projectionY = lineStart.y + t * dy;

    return Math.sqrt(
        Math.pow(point.x - projectionX, 2) + Math.pow(point.y - projectionY, 2)
    );
}

// Ramer-Douglas-Peucker algorithm
function rdpSimplify(points: Point[], epsilon: number): Point[] {
    if (points.length <= 2) {
        return points;
    }

    // Find the point with maximum distance
    let maxDistance = 0;
    let maxIndex = 0;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
        const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }

    // If max distance is greater than epsilon, recursively simplify
    if (maxDistance > epsilon) {
        const leftPoints = rdpSimplify(points.slice(0, maxIndex + 1), epsilon);
        const rightPoints = rdpSimplify(points.slice(maxIndex), epsilon);

        // Combine results (removing duplicate middle point)
        return [...leftPoints.slice(0, -1), ...rightPoints];
    }

    // Max distance is less than epsilon, return only endpoints
    return [firstPoint, lastPoint];
}

/**
 * Simplify a path using Ramer-Douglas-Peucker algorithm
 * @param points - Array of points to simplify
 * @param tolerance - Maximum distance tolerance (default: 2)
 * @returns Simplified array of points
 */
export function simplifyPath(points: Point[], tolerance: number = 2): Point[] {
    if (points.length <= 2) {
        return points;
    }

    return rdpSimplify(points, tolerance);
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Calculate angle (heading) from p1 to p2 in degrees
 * Returns angle in Turtle coordinate system (0 = East, 90 = North)
 */
export function calculateHeading(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    // atan2 returns angle in radians (-π to π)
    // Convert to degrees and adjust for Turtle coordinate system
    const radians = Math.atan2(dy, dx);
    const degrees = radians * (180 / Math.PI);

    return degrees;
}
