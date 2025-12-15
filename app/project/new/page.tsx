'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNewProject } from '@/lib/storage';

export default function NewProjectPage() {
    const router = useRouter();

    useEffect(() => {
        // Create a new project and redirect to editor
        const project = createNewProject();
        router.replace(`/project/${project.id}`);
    }, [router]);

    // Show loading while redirecting
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-400">Creating new project...</p>
            </div>
        </div>
    );
}
