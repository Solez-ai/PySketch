'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Layer, Stroke, DrawingState, Tool, Point } from '@/types';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Default layer
const createDefaultLayer = (): Layer => ({
    id: generateId(),
    name: 'Layer 1',
    visible: true,
});

// Initial state
const initialState: DrawingState = {
    layers: [createDefaultLayer()],
    strokes: [],
    activeLayerId: '',
    globalSpeed: 6,
    backgroundColor: '#0a0a0a',
    toolSettings: {
        activeTool: 'pen',
        color: '#ffffff',
        width: 3,
    },
};

// Fix activeLayerId after initial state
initialState.activeLayerId = initialState.layers[0].id;

// Action types
type Action =
    | { type: 'ADD_STROKE'; payload: Stroke }
    | { type: 'REMOVE_STROKE'; payload: string }
    | { type: 'CLEAR_ALL_STROKES' }
    | { type: 'ADD_LAYER'; payload: Layer }
    | { type: 'REMOVE_LAYER'; payload: string }
    | { type: 'RENAME_LAYER'; payload: { id: string; name: string } }
    | { type: 'TOGGLE_LAYER_VISIBILITY'; payload: string }
    | { type: 'SET_ACTIVE_LAYER'; payload: string }
    | { type: 'REORDER_LAYERS'; payload: Layer[] }
    | { type: 'SET_TOOL'; payload: Tool }
    | { type: 'SET_COLOR'; payload: string }
    | { type: 'SET_WIDTH'; payload: number }
    | { type: 'SET_SPEED'; payload: number }
    | { type: 'SET_BACKGROUND_COLOR'; payload: string }
    | { type: 'LOAD_STATE'; payload: Partial<DrawingState> };

// Reducer
function drawingReducer(state: DrawingState, action: Action): DrawingState {
    switch (action.type) {
        case 'ADD_STROKE':
            return { ...state, strokes: [...state.strokes, action.payload] };

        case 'REMOVE_STROKE':
            return {
                ...state,
                strokes: state.strokes.filter((s) => s.id !== action.payload),
            };

        case 'CLEAR_ALL_STROKES':
            return { ...state, strokes: [] };

        case 'ADD_LAYER': {
            const newLayers = [...state.layers, action.payload];
            return {
                ...state,
                layers: newLayers,
                activeLayerId: action.payload.id,
            };
        }

        case 'REMOVE_LAYER': {
            const filteredLayers = state.layers.filter((l) => l.id !== action.payload);
            const filteredStrokes = state.strokes.filter((s) => s.layerId !== action.payload);
            const newActiveId =
                state.activeLayerId === action.payload
                    ? filteredLayers[0]?.id || ''
                    : state.activeLayerId;
            return {
                ...state,
                layers: filteredLayers,
                strokes: filteredStrokes,
                activeLayerId: newActiveId,
            };
        }

        case 'RENAME_LAYER':
            return {
                ...state,
                layers: state.layers.map((l) =>
                    l.id === action.payload.id ? { ...l, name: action.payload.name } : l
                ),
            };

        case 'TOGGLE_LAYER_VISIBILITY':
            return {
                ...state,
                layers: state.layers.map((l) =>
                    l.id === action.payload ? { ...l, visible: !l.visible } : l
                ),
            };

        case 'SET_ACTIVE_LAYER':
            return { ...state, activeLayerId: action.payload };

        case 'REORDER_LAYERS':
            return { ...state, layers: action.payload };

        case 'SET_TOOL':
            return {
                ...state,
                toolSettings: { ...state.toolSettings, activeTool: action.payload },
            };

        case 'SET_COLOR':
            return {
                ...state,
                toolSettings: { ...state.toolSettings, color: action.payload },
            };

        case 'SET_WIDTH':
            return {
                ...state,
                toolSettings: { ...state.toolSettings, width: action.payload },
            };

        case 'SET_SPEED':
            return { ...state, globalSpeed: action.payload };

        case 'SET_BACKGROUND_COLOR':
            return { ...state, backgroundColor: action.payload };

        case 'LOAD_STATE':
            return { ...state, ...action.payload };

        default:
            return state;
    }
}

// Context
interface DrawingContextType {
    state: DrawingState;
    dispatch: React.Dispatch<Action>;
    // Helper functions
    addStroke: (points: Point[], color: string, width: number) => void;
    removeStroke: (id: string) => void;
    clearAllStrokes: () => void;
    addLayer: (name?: string) => void;
    removeLayer: (id: string) => void;
    renameLayer: (id: string, name: string) => void;
    toggleLayerVisibility: (id: string) => void;
    setActiveLayer: (id: string) => void;
    reorderLayers: (layers: Layer[]) => void;
    setTool: (tool: Tool) => void;
    setColor: (color: string) => void;
    setWidth: (width: number) => void;
    setSpeed: (speed: number) => void;
    setBackgroundColor: (color: string) => void;
    loadState: (state: Partial<DrawingState>) => void;
    generateId: () => string;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

// Provider
export function DrawingProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(drawingReducer, initialState);

    const addStroke = (points: Point[], color: string, width: number) => {
        const stroke: Stroke = {
            id: generateId(),
            layerId: state.activeLayerId,
            color,
            width,
            speed: state.globalSpeed,
            points,
        };
        dispatch({ type: 'ADD_STROKE', payload: stroke });
    };

    const removeStroke = (id: string) => {
        dispatch({ type: 'REMOVE_STROKE', payload: id });
    };

    const clearAllStrokes = () => {
        dispatch({ type: 'CLEAR_ALL_STROKES' });
    };

    const addLayer = (name?: string) => {
        const layer: Layer = {
            id: generateId(),
            name: name || `Layer ${state.layers.length + 1}`,
            visible: true,
        };
        dispatch({ type: 'ADD_LAYER', payload: layer });
    };

    const removeLayer = (id: string) => {
        dispatch({ type: 'REMOVE_LAYER', payload: id });
    };

    const renameLayer = (id: string, name: string) => {
        dispatch({ type: 'RENAME_LAYER', payload: { id, name } });
    };

    const toggleLayerVisibility = (id: string) => {
        dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: id });
    };

    const setActiveLayer = (id: string) => {
        dispatch({ type: 'SET_ACTIVE_LAYER', payload: id });
    };

    const reorderLayers = (layers: Layer[]) => {
        dispatch({ type: 'REORDER_LAYERS', payload: layers });
    };

    const setTool = (tool: Tool) => {
        dispatch({ type: 'SET_TOOL', payload: tool });
    };

    const setColor = (color: string) => {
        dispatch({ type: 'SET_COLOR', payload: color });
    };

    const setWidth = (width: number) => {
        dispatch({ type: 'SET_WIDTH', payload: width });
    };

    const setSpeed = (speed: number) => {
        dispatch({ type: 'SET_SPEED', payload: speed });
    };

    const setBackgroundColor = (color: string) => {
        dispatch({ type: 'SET_BACKGROUND_COLOR', payload: color });
    };

    const loadState = (newState: Partial<DrawingState>) => {
        dispatch({ type: 'LOAD_STATE', payload: newState });
    };

    return (
        <DrawingContext.Provider
            value={{
                state,
                dispatch,
                addStroke,
                removeStroke,
                clearAllStrokes,
                addLayer,
                removeLayer,
                renameLayer,
                toggleLayerVisibility,
                setActiveLayer,
                reorderLayers,
                setTool,
                setColor,
                setWidth,
                setSpeed,
                setBackgroundColor,
                loadState,
                generateId,
            }}
        >
            {children}
        </DrawingContext.Provider>
    );
}

// Hook
export function useDrawing() {
    const context = useContext(DrawingContext);
    if (context === undefined) {
        throw new Error('useDrawing must be used within a DrawingProvider');
    }
    return context;
}
