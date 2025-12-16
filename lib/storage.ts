import { Project } from '@/types';

const STORAGE_KEY = 'turtle_projects';

// Generate unique ID
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};

// Get all projects from localStorage
export const getProjects = (): Project[] => {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) return [];

        return parsed;
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
};

// Get a single project by ID
export const getProject = (id: string): Project | null => {
    const projects = getProjects();
    return projects.find((p) => p.id === id) || null;
};

// Save a project (create or update)
export const saveProject = (project: Project): void => {
    if (typeof window === 'undefined') return;

    try {
        const projects = getProjects();
        const existingIndex = projects.findIndex((p) => p.id === project.id);

        if (existingIndex >= 0) {
            projects[existingIndex] = { ...project, lastModified: Date.now() };
        } else {
            projects.push({ ...project, lastModified: Date.now() });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
        console.error('Error saving project:', error);
    }
};

// Delete a project
export const deleteProject = (id: string): void => {
    if (typeof window === 'undefined') return;

    try {
        const projects = getProjects().filter((p) => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
        console.error('Error deleting project:', error);
    }
};

// Rename a project
export const renameProject = (id: string, name: string): void => {
    if (typeof window === 'undefined') return;

    try {
        const projects = getProjects();
        const project = projects.find((p) => p.id === id);

        if (project) {
            project.name = name;
            project.lastModified = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        }
    } catch (error) {
        console.error('Error renaming project:', error);
    }
};

// Create a new empty project
export const createNewProject = (name: string = 'Untitled Project'): Project => {
    const defaultLayerId = generateId();

    const project: Project = {
        id: generateId(),
        name,
        lastModified: Date.now(),
        layers: [
            {
                id: defaultLayerId,
                name: 'Layer 1',
                visible: true,
            },
        ],
        strokes: [],
        settings: {
            speed: 6,
            backgroundColor: '#0a0a0a',
        },
    };

    saveProject(project);
    return project;
};

// Format date for display
export const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
};
