// Core Types for PySketch Application

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  layerId: string;
  color: string;
  width: number;
  speed: number;
  points: Point[];
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export interface ProjectSettings {
  speed: number;
  backgroundColor: string;
}

export interface Project {
  id: string;
  name: string;
  lastModified: number;
  layers: Layer[];
  strokes: Stroke[];
  settings: ProjectSettings;
}

export type Tool = 'pen' | 'eraser';

export interface ToolSettings {
  activeTool: Tool;
  color: string;
  width: number;
}

export interface DrawingState {
  layers: Layer[];
  strokes: Stroke[];
  activeLayerId: string;
  globalSpeed: number;
  backgroundColor: string;
  toolSettings: ToolSettings;
}
