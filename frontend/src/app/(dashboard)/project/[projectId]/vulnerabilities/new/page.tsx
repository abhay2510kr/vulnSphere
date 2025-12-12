'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { VulnerabilityPanel } from '@/components/vulnerabilities/vulnerability-panel';

export default function NewVulnerabilityPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>}>
            <NewVulnerabilityPageContent />
        </Suspense>
    );
}

function NewVulnerabilityPageContent() {
    const params = useParams();
    const projectId = params.projectId as string;

    return (
        <div className="h-full">
            <VulnerabilityPanel 
                projectId={projectId} 
                vulnerabilityId="new"
            />
        </div>
    );
}
